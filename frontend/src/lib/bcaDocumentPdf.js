import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BCA_LOGO_BASE64, BCA_LOGO_WIDTH, BCA_LOGO_HEIGHT } from './pdfBranding';
import {
    BCA_COMPANY,
    BCA_CATEGORIES_BANDEAU,
    BCA_SECTEURS_FOOTER,
    BCA_GARANTIE,
    BCA_MENTION_CONFORMITE_BON_COMMANDE,
} from './bcaCompanyInfo';
import { amountToWordsFr } from './numberToWordsFr';

const PAGE_W = 210;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

const isSet = (v) => v !== null && v !== undefined && v !== '';
const fmtAmount = (n) => (Number(n) || 0).toLocaleString('fr-FR');
const fmtDate = (d) => {
    const date = d ? new Date(d) : new Date();
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fr-FR');
};

/** En-tête commun (logo + slogan + bandeau + bandeau catégories) — commun à Facture/Proforma/Bon de commande. */
function drawCommercialHeader(doc, documentTitle) {
    const logoWidth = 30;
    const logoHeight = (BCA_LOGO_HEIGHT / BCA_LOGO_WIDTH) * logoWidth;
    try {
        doc.addImage(BCA_LOGO_BASE64, 'PNG', MARGIN, 10, logoWidth, logoHeight);
    } catch {
        // Continue sans logo si le décodage échoue.
    }

    const textX = MARGIN + logoWidth + 6;
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(14);
    doc.setTextColor(15, 40, 90);
    doc.text(BCA_COMPANY.slogan, textX, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(BCA_COMPANY.accroche, textX, 21);

    let y = 10 + logoHeight + 4;

    // Bandeau bleu foncé
    doc.setFillColor(20, 40, 80);
    doc.rect(MARGIN, y, CONTENT_W, 6, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(BCA_COMPANY.baseline, PAGE_W / 2, y + 4, { align: 'center' });
    y += 9;

    // Bandeau catégories
    const catW = CONTENT_W / BCA_CATEGORIES_BANDEAU.length;
    doc.setFontSize(6.5);
    BCA_CATEGORIES_BANDEAU.forEach((cat, i) => {
        const x = MARGIN + i * catW;
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(246, 247, 249);
        doc.rect(x, y, catW, 9, 'FD');
        doc.setTextColor(40, 40, 40);
        const lines = doc.splitTextToSize(cat, catW - 2);
        doc.text(lines, x + catW / 2, y + 4, { align: 'center' });
    });
    y += 13;

    doc.setDrawColor(20, 40, 80);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(20, 40, 80);
    doc.text(documentTitle, PAGE_W / 2, y, { align: 'center' });
    y += 4;

    return y + 5;
}

/** Pied de page commun (coordonnées légales BCA + bandeau secteurs). */
function drawCommercialFooter(doc) {
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = pageHeight - 26;

    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text(BCA_COMPANY.site, MARGIN, y);
    doc.text(BCA_COMPANY.telephones.join(' / '), PAGE_W - MARGIN, y, { align: 'right' });
    y += 4;
    doc.text(BCA_COMPANY.emails.join(' / '), MARGIN, y);
    doc.text(BCA_COMPANY.adresse, PAGE_W - MARGIN, y, { align: 'right' });
    y += 5;

    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
        `Capital social : ${BCA_COMPANY.capitalSocial} ; RCCM/${BCA_COMPANY.rccm} – NIF : ${BCA_COMPANY.nif} Clé TVA : ${BCA_COMPANY.cleTva}`,
        PAGE_W / 2, y, { align: 'center' },
    );
    y += 4;

    const secW = CONTENT_W / BCA_SECTEURS_FOOTER.length;
    doc.setFontSize(6);
    BCA_SECTEURS_FOOTER.forEach((sec, i) => {
        const x = MARGIN + i * secW;
        doc.setFillColor(i === BCA_SECTEURS_FOOTER.length - 1 ? 216 : 20, i === BCA_SECTEURS_FOOTER.length - 1 ? 118 : 40, i === BCA_SECTEURS_FOOTER.length - 1 ? 26 : 80);
        doc.rect(x, y, secW, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(sec, x + secW / 2, y + 3.4, { align: 'center' });
    });
}

/**
 * Génère une Facture ou une Facture Proforma (même gabarit officiel).
 * @param {'facture'|'proforma'} type
 * @param {object} opts
 * @param {string} opts.numero
 * @param {string|Date} [opts.date]
 * @param {{nom:string, adresse?:string, telephone?:string}} opts.client
 * @param {Array<{description:string, qte:number, prixUnitaire:number}>} opts.items
 * @param {string} [opts.livraison] - Délai et lieu de livraison
 * @param {string} [opts.conditionsPaiement]
 * @param {string} [opts.modePaiement]
 * @returns {import('jspdf').jsPDF}
 */
export function generateFactureOrProformaPdf(type, opts) {
    const { numero, date, client, items = [], livraison = '', conditionsPaiement = '', modePaiement = '' } = opts;
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const title = type === 'proforma' ? 'FACTURE PROFORMA' : 'FACTURE';

    let y = drawCommercialHeader(doc, title);

    // Bloc Numéro/Date + client
    doc.setDrawColor(210, 216, 224);
    doc.setFillColor(240, 244, 249);
    doc.rect(MARGIN, y, CONTENT_W * 0.42, 16, 'FD');
    doc.rect(MARGIN + CONTENT_W * 0.42, y, CONTENT_W * 0.58, 16, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 40, 80);
    doc.text(`Numéro : ${numero || '—'}`, MARGIN + 3, y + 6);
    doc.text(`Date : ${fmtDate(date)}`, MARGIN + 3, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.text('A', PAGE_W - MARGIN - CONTENT_W * 0.29, y + 5, { align: 'center' });
    doc.setFontSize(9);
    doc.text(client?.nom || '—', PAGE_W - MARGIN - 3, y + 9, { align: 'right' });
    if (client?.adresse) doc.text(client.adresse, PAGE_W - MARGIN - 3, y + 13.5, { align: 'right' });
    y += 22;

    const totalHT = items.reduce((sum, it) => sum + (Number(it.qte) || 0) * (Number(it.prixUnitaire) || 0), 0);

    autoTable(doc, {
        startY: y,
        head: [['N°', 'Description', 'Qté', 'Prix Unitaire', 'Total HT']],
        body: items.map((it, i) => [
            String(i + 1),
            it.description || '',
            String(it.qte ?? ''),
            isSet(it.prixUnitaire) ? `${fmtAmount(it.prixUnitaire)} GNF` : '',
            isSet(it.prixUnitaire) && isSet(it.qte) ? `${fmtAmount(it.qte * it.prixUnitaire)} GNF` : '',
        ]),
        foot: [['', '', '', 'Total Hors TVA', `${fmtAmount(totalHT)} GNF`]],
        theme: 'grid',
        headStyles: { fillColor: [20, 40, 80], textColor: 255, fontSize: 8.5 },
        footStyles: { fillColor: [240, 244, 249], textColor: [20, 40, 80], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8.5 },
        margin: { left: MARGIN, right: MARGIN },
    });

    y = doc.lastAutoTable.finalY + 6;

    doc.setFillColor(255, 246, 232);
    doc.setDrawColor(216, 118, 26);
    doc.rect(MARGIN, y, CONTENT_W, 10, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(150, 80, 10);
    const arreteText = `ARRÊTÉE À : ${amountToWordsFr(totalHT)}`.toUpperCase();
    doc.text(doc.splitTextToSize(arreteText, CONTENT_W - 6), MARGIN + 3, y + 6);
    y += 16;

    const colW = CONTENT_W / 3;
    [['Délai et Lieu de livraison', livraison], ['Conditions de Paiement', conditionsPaiement], ['Mode de Paiement', modePaiement]]
        .forEach(([label, value], i) => {
            const x = MARGIN + i * colW;
            doc.setDrawColor(210, 216, 224);
            doc.rect(x, y, colW, 16, 'D');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(20, 40, 80);
            doc.text(label, x + 2, y + 5);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(40, 40, 40);
            doc.text(doc.splitTextToSize(value || '—', colW - 4), x + 2, y + 10);
        });
    y += 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 40, 80);
    doc.text(BCA_GARANTIE.titre, PAGE_W / 2, y, { align: 'center' });
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    BCA_GARANTIE.points.forEach((point) => {
        doc.text(`✔ ${point}`, MARGIN, y);
        y += 5;
    });
    y += 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 40, 80);
    doc.text(BCA_GARANTIE.engagementsTitre, PAGE_W / 2, y, { align: 'center' });
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    BCA_GARANTIE.engagements.forEach((point) => {
        doc.text(`✔ ${point}`, MARGIN, y);
        y += 5;
    });
    y += 3;

    doc.setFillColor(240, 244, 249);
    doc.rect(MARGIN, y, CONTENT_W, 10, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(20, 40, 80);
    doc.text(BCA_GARANTIE.signature, PAGE_W / 2, y + 6, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text(BCA_COMPANY.signataire, PAGE_W - MARGIN, y + 26, { align: 'right' });

    drawCommercialFooter(doc);
    return doc;
}

/**
 * Génère un Bon de Commande (gabarit officiel BCA).
 * @param {object} opts
 * @param {string} opts.numero
 * @param {string|Date} [opts.date]
 * @param {{raisonSociale:string, adresse?:string, telephone?:string, email?:string}} opts.fournisseur
 * @param {{lieu?:string, contact?:string, telephone?:string, dateSouhaitee?:string, incoterm?:string}} [opts.livraison]
 * @param {{demandeur?:string, service?:string, referenceProjet?:string, modePaiement?:string, delaiPaiement?:string}} [opts.informations]
 * @param {Array<{designation:string, reference?:string, qte:number, puHT:number, tva?:number}>} opts.items
 * @param {string} [opts.objet]
 * @returns {import('jspdf').jsPDF}
 */
export function generateBonDeCommandePdf(opts) {
    const { numero, date, fournisseur = {}, livraison = {}, informations = {}, items = [], objet = '' } = opts;
    const doc = new jsPDF('portrait', 'mm', 'a4');

    let y = drawCommercialHeader(doc, 'BON DE COMMANDE');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 40, 80);
    doc.text(`N° : BC${numero || '—'}`, PAGE_W - MARGIN, y - 21, { align: 'right' });
    doc.text(`Date : ${fmtDate(date)}`, PAGE_W - MARGIN, y - 17, { align: 'right' });

    const colW = CONTENT_W / 3;
    const blocks = [
        ['Fournisseur', [
            `Raison sociale : ${fournisseur.raisonSociale || '—'}`,
            `Adresse : ${fournisseur.adresse || '—'}`,
            `Téléphone : ${fournisseur.telephone || '—'}`,
            `Email : ${fournisseur.email || '—'}`,
        ]],
        ['Livraison', [
            `Lieu : ${livraison.lieu || '—'}`,
            `Contact : ${livraison.contact || '—'}`,
            `Téléphone : ${livraison.telephone || '—'}`,
            `Date souhaitée : ${livraison.dateSouhaitee || '—'}`,
            `Incoterm : ${livraison.incoterm || '—'}`,
        ]],
        ['Informations', [
            `Demandeur : ${informations.demandeur || '—'}`,
            `Service : ${informations.service || '—'}`,
            `Réf. projet : ${informations.referenceProjet || '—'}`,
            `Paiement : ${informations.modePaiement || '—'}`,
            `Délai paiement : ${informations.delaiPaiement || '—'}`,
        ]],
    ];
    blocks.forEach(([label, lines], i) => {
        const x = MARGIN + i * colW;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(20, 40, 80);
        doc.text(label, x, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(40, 40, 40);
        lines.forEach((line, li) => {
            doc.text(doc.splitTextToSize(line, colW - 4), x, y + 5 + li * 4);
        });
    });
    y += 5 + blocks[2][1].length * 4 + 6;

    autoTable(doc, {
        startY: y,
        head: [['N°', 'Désignation', 'Référence', 'Qté', 'PU HT', 'TVA (%)', 'Montant HT']],
        body: items.map((it, i) => [
            String(i + 1),
            it.designation || '',
            it.reference || '',
            String(it.qte ?? ''),
            isSet(it.puHT) ? `${fmtAmount(it.puHT)} GNF` : '',
            isSet(it.tva) ? `${it.tva}%` : '',
            isSet(it.puHT) && isSet(it.qte) ? `${fmtAmount(it.qte * it.puHT)} GNF` : '',
        ]),
        theme: 'grid',
        headStyles: { fillColor: [20, 40, 80], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: MARGIN, right: MARGIN },
    });
    y = doc.lastAutoTable.finalY + 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 40, 80);
    doc.text('Objet de la commande :', MARGIN, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text(doc.splitTextToSize(objet || '—', CONTENT_W), MARGIN, y);
    y += 14;

    doc.setDrawColor(216, 118, 26);
    doc.setFillColor(255, 246, 232);
    const mentionLines = doc.splitTextToSize(BCA_MENTION_CONFORMITE_BON_COMMANDE, CONTENT_W - 6);
    const mentionH = 6 + mentionLines.length * 4;
    doc.rect(MARGIN, y, CONTENT_W, mentionH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(150, 80, 10);
    doc.text('MENTION DE CONFORMITÉ :', MARGIN + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(mentionLines, MARGIN + 3, y + 9.5);
    y += mentionH + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 40, 80);
    doc.text('Bon pour accord', MARGIN, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text('Nom : ……………………………………………………………', MARGIN, y);
    y += 6;
    doc.text('Fonction : …………………………………………………', MARGIN, y);
    y += 6;
    doc.text('Signature & Cachet : …………………………………….', MARGIN, y);

    drawCommercialFooter(doc);
    return doc;
}
