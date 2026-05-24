require('dotenv').config({ path: './.env' });
const fs = require('fs');
const { Groq } = require('groq-sdk');

const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : "";
if (!apiKey) {
    console.error("GROQ_API_KEY manquante");
    process.exit(1);
}

const groq = new Groq({ apiKey });

async function main() {
    console.log("Lecture du fichier de traductions...");
    const filePath = '../frontend/src/context/translations.js';
    let content = fs.readFileSync(filePath, 'utf-8');

    // Extract FR object
    const frMatch = content.match(/FR:\s*\{([\s\S]*?)\},\n\s*EN:/);
    if (!frMatch) {
        console.error("FR object not found");
        return;
    }

    const frContent = frMatch[1];
    
    // Create a dictionary from FR content
    const frKeys = {};
    const lines = frContent.split('\n');
    for (const line of lines) {
        const match = line.match(/^\s*([a-zA-Z0-9_]+):\s*"(.*)",?\s*$/);
        if (match) {
            frKeys[match[1]] = match[2];
        }
    }

    console.log(`Trouvé ${Object.keys(frKeys).length} clés en Français.`);

    const languages = [
        { code: 'SO', name: 'Susu (Soussou) language from Guinea' },
        { code: 'PE', name: 'Pular (Fula/Peul) language from Guinea' },
        { code: 'MA', name: 'Maninka (Malinke) language from Guinea' }
    ];

    let newContent = content;

    for (const lang of languages) {
        console.log(`\n--- Traduction pour ${lang.code} (${lang.name}) ---`);
        
        // Extract current lang object
        const regex = new RegExp(`${lang.code}:\\s*\\{([\\s\\S]*?)\\}(,?\\n\\s*[A-Z]{2}:|\\n\\s*\\}$)`);
        const langMatch = content.match(regex);
        
        let existingKeys = {};
        if (langMatch) {
            const langLines = langMatch[1].split('\n');
            for (const line of langLines) {
                const m = line.match(/^\s*([a-zA-Z0-9_]+):\s*"(.*)",?\s*$/);
                if (m) existingKeys[m[1]] = m[2];
            }
        }

        const missingKeys = Object.keys(frKeys).filter(k => !existingKeys[k]);
        console.log(`${missingKeys.length} clés manquantes pour ${lang.code}.`);

        if (missingKeys.length === 0) continue;

        // Batch translation
        const batchSize = 60;
        let generatedObject = `    ${lang.code}: {\n`;
        
        // Append existing
        for (const [k, v] of Object.entries(existingKeys)) {
            generatedObject += `        ${k}: "${v}",\n`;
        }

        for (let i = 0; i < missingKeys.length; i += batchSize) {
            const batchKeys = missingKeys.slice(i, i + batchSize);
            const batchDict = {};
            for (const k of batchKeys) {
                batchDict[k] = frKeys[k];
            }

            console.log(`Traduction batch ${i / batchSize + 1} (${batchKeys.length} clés)...`);
            
            try {
                const completion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: `You are an expert translator specializing in the Guinean language: ${lang.name}. Translate the following JSON object values from French to ${lang.name}. Keep the exact same keys. ONLY output a valid JSON object. No markdown, no explanations.`
                        },
                        {
                            role: "user",
                            content: JSON.stringify(batchDict, null, 2)
                        }
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                });

                const translatedBatch = JSON.parse(completion.choices[0].message.content);
                for (const k of batchKeys) {
                    if (translatedBatch[k]) {
                        // escape quotes
                        const safeVal = translatedBatch[k].replace(/"/g, '\\"');
                        generatedObject += `        ${k}: "${safeVal}",\n`;
                    } else {
                        generatedObject += `        ${k}: "${frKeys[k]}",\n`; // fallback
                    }
                }
            } catch (err) {
                console.error("Erreur de traduction:", err.message);
                // Fallback to FR
                for (const k of batchKeys) {
                    generatedObject += `        ${k}: "${frKeys[k]}",\n`;
                }
            }
        }
        
        generatedObject += `    }`;

        // Replace in newContent
        newContent = newContent.replace(regex, `${generatedObject}$2`);
    }

    fs.writeFileSync(filePath, newContent);
    console.log("\nTraduction terminée et sauvegardée dans translations.js !");
}

main();
