import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { amountToWordsFr } from '../../lib/numberToWordsFr';

const PAGE_W = 210;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR');
const fmtDate = (d) => {
    const date = d ? new Date(d) : new Date();
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fr-FR');
};

/**
 * Facture légale conforme au Code Général des Impôts (Guinée) — analyse
 * concurrentielle #3. Document distinct des gabarits BCA "commerciaux"
 * (bcaDocumentPdf.js) : le vendeur de la marketplace est l'émetteur légal
 * de la vente (NIF/RCCM du vendeur, pas ceux de BCA), BCA Connect n'étant
 * que la plateforme qui a facilité et sécurisé (séquestre) la transaction.
 *
 * Hypothèse assumée : les prix affichés sur BCA Connect sont TTC (pratique
 * commerciale courante en Guinée) — voir invoice.service.js côté backend
 * pour le calcul HT/TVA/TTC correspondant, effectué une seule fois à
 * l'émission et jamais recalculé ici.
 *
 * @param {object} invoice - objet retourné par GET /api/invoices/:id
 */
export function generateFactureLegalePdf(invoice) {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    let y = MARGIN;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(20, 40, 80);
    doc.text('FACTURE', PAGE_W / 2, y + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Document généré via la marketplace BCA Connect — transaction sécurisée sous séquestre', PAGE_W / 2, y + 12, { align: 'center' });
    y += 20;

    doc.setDrawColor(20, 40, 80);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 6;

    // Numéro / date (immutables, attribués séquentiellement côté backend)
    doc.setFillColor(240, 244, 249);
    doc.setDrawColor(210, 216, 224);
    doc.rect(MARGIN, y, CONTENT_W, 12, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 40, 80);
    doc.text(`N° ${invoice.numero}`, MARGIN + 4, y + 7.5);
    doc.text(`Date d'émission : ${fmtDate(invoice.date_emission)}`, PAGE_W - MARGIN - 4, y + 7.5, { align: 'right' });
    y += 18;

    // Émetteur (vendeur) / Acheteur
    const colW = CONTENT_W / 2 - 3;
    const boutique = invoice.boutique || {};
    const acheteur = invoice.acheteur || {};

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 40, 80);
    doc.text('ÉMETTEUR (VENDEUR)', MARGIN, y);
    doc.text('DESTINATAIRE (ACHETEUR)', MARGIN + colW + 6, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    const emetteurLines = [
        boutique.nom_boutique || '—',
        boutique.localisation ? `Adresse : ${boutique.localisation}` : null,
        `NIF : ${boutique.nif || '— (non renseigné)'}`,
        `RCCM : ${boutique.rccm || '— (non renseigné)'}`,
        boutique.telephone_boutique ? `Tél : ${boutique.telephone_boutique}` : null,
    ].filter(Boolean);
    const acheteurLines = [
        acheteur.nom_complet || invoice.commande?.nom_destinataire || '—',
        invoice.commande?.adresse_livraison ? `Adresse : ${invoice.commande.adresse_livraison}` : null,
        `NIF : ${invoice.acheteur_nif || '— (particulier)'}`,
        acheteur.telephone ? `Tél : ${acheteur.telephone}` : null,
    ].filter(Boolean);

    emetteurLines.forEach((line, i) => doc.text(doc.splitTextToSize(line, colW), MARGIN, y + i * 4.5));
    acheteurLines.forEach((line, i) => doc.text(doc.splitTextToSize(line, colW), MARGIN + colW + 6, y + i * 4.5));
    y += Math.max(emetteurLines.length, acheteurLines.length) * 4.5 + 8;

    // Lignes de facturation (désignation détaillée — mention CGI obligatoire)
    const lignes = invoice.lignes || [];
    autoTable(doc, {
        startY: y,
        head: [['Désignation', 'Qté', 'PU TTC', 'Montant TTC']],
        body: lignes.map((l) => [
            l.designation,
            String(l.quantite),
            `${fmt(l.prix_unitaire_ttc)} GNF`,
            `${fmt(l.montant_ttc)} GNF`,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [20, 40, 80], textColor: 255, fontSize: 8.5 },
        bodyStyles: { fontSize: 8.5 },
        margin: { left: MARGIN, right: MARGIN },
    });
    y = doc.lastAutoTable.finalY + 6;

    // Totaux HT / TVA / TTC
    const totalsW = 70;
    const totalsX = PAGE_W - MARGIN - totalsW;
    const rows = [
        ['Total HT', `${fmt(invoice.montant_ht)} GNF`],
        [`TVA (${fmt(invoice.taux_tva)}%)`, `${fmt(invoice.montant_tva)} GNF`],
        ['Total TTC', `${fmt(invoice.montant_ttc)} GNF`],
    ];
    rows.forEach(([label, value], i) => {
        const isLast = i === rows.length - 1;
        doc.setFillColor(isLast ? 20 : 246, isLast ? 40 : 247, isLast ? 80 : 249);
        doc.setDrawColor(210, 216, 224);
        doc.rect(totalsX, y, totalsW, 7, 'FD');
        doc.setFont('helvetica', isLast ? 'bold' : 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(isLast ? 255 : 40, isLast ? 255 : 40, isLast ? 255 : 40);
        doc.text(label, totalsX + 3, y + 4.8);
        doc.text(value, totalsX + totalsW - 3, y + 4.8, { align: 'right' });
        y += 7;
    });
    y += 6;

    doc.setFillColor(255, 246, 232);
    doc.setDrawColor(216, 118, 26);
    const arreteText = `ARRÊTÉE À : ${amountToWordsFr(parseFloat(invoice.montant_ttc))}`.toUpperCase();
    const arreteLines = doc.splitTextToSize(arreteText, CONTENT_W - 6);
    doc.rect(MARGIN, y, CONTENT_W, 6 + arreteLines.length * 4, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(150, 80, 10);
    doc.text(arreteLines, MARGIN + 3, y + 5);
    y += 6 + arreteLines.length * 4 + 8;

    // Mentions légales obligatoires (CGI Guinée)
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    const mentions = [
        'Facture émise conformément aux dispositions du Code Général des Impôts de la République de Guinée.',
        'TVA au taux normal de 18% conformément à la réglementation fiscale en vigueur.',
        `Numérotation séquentielle sans interruption — document N° ${invoice.numero}, non modifiable après émission.`,
    ];
    mentions.forEach((m, i) => {
        doc.text(doc.splitTextToSize(m, CONTENT_W), MARGIN, y + i * 4);
    });

    return doc;
}
