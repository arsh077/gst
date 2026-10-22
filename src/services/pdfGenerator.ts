import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, CompanyProfile } from '../types';
import { formatIndianNumber } from './gstCalculationService';
import { LOGO_PNG_BASE64, WATERMARK_PNG_BASE64, LOGO_ASPECT_RATIO } from '../assets/logoBase64';

export interface PDFGenerateOptions {
  companyProfile?: CompanyProfile;
  currencyFormat?: '₹' | 'Rs.';
  previewOnly?: boolean;
}

/**
 * Draws a clean vector Indian Rupee symbol at the specified coordinates.
 * Vector-based rendering prevents font encoding errors (e.g. superscript 1 '¹' or '\x00' spacing).
 */
export function drawVectorRupee(
  doc: jsPDF,
  x: number,
  y: number,
  size: number = 2.8,
  color: [number, number, number] = [15, 23, 42]
): number {
  doc.saveGraphicsState();
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setFillColor(color[0], color[1], color[2]);
  doc.setLineWidth(size * 0.11);

  // y is text baseline
  const top = y - size * 0.85;
  const mid = y - size * 0.45;
  const w = size * 0.62;

  // Upper bar
  doc.line(x, top, x + w, top);
  // Lower horizontal bar
  doc.line(x, mid, x + w * 0.82, mid);
  // Vertical stem
  doc.line(x + size * 0.08, top, x + size * 0.08, y);
  // Curved upper bowl
  doc.line(x + size * 0.08, top, x + w * 0.6, top);
  doc.line(x + w * 0.6, top, x + w * 0.6, mid);
  doc.line(x + w * 0.6, mid, x + size * 0.08, mid);
  // Slanted leg
  doc.line(x + size * 0.22, mid, x + w * 0.72, y);

  doc.restoreGraphicsState();
  return w + 0.8; // returns consumed width in mm
}

/**
 * Generates an ultra-clean, compact A4 GST Invoice PDF for Legal Success India.
 * Conforms strictly to A4 portrait (210x297mm) standards with 10mm margins.
 * Reconciles all calculations, eliminates superscript 1 artifacts, prevents edge clipping,
 * and handles GSTIN verification status correctly.
 */
export function generateInvoicePDF(
  invoice: Invoice,
  options: PDFGenerateOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const currencyPrefix = options.currencyFormat || 'Rs.';
  const prefixStr = currencyPrefix === 'Rs.' ? 'Rs. ' : 'Rs. ';

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2; // 190 mm
  let currentY = margin;

  // Colors
  const navy: [number, number, number] = [15, 23, 42]; // #0f172a
  const blueAccent: [number, number, number] = [30, 64, 175]; // #1e40af
  const slateMuted: [number, number, number] = [100, 116, 139]; // #64748b
  const slateBorder: [number, number, number] = [203, 213, 225]; // #cbd5e1
  const bgLight: [number, number, number] = [248, 250, 252]; // #f8fafc
  const redText: [number, number, number] = [190, 18, 60]; // #be123c
  const greenText: [number, number, number] = [16, 185, 129]; // #10b981

  // Function to draw subtle centered watermark on a page
  const drawPageWatermark = () => {
    try {
      const wmW = 105;
      const wmH = wmW / LOGO_ASPECT_RATIO;
      const wmX = (pageWidth - wmW) / 2;
      const wmY = (pageHeight - wmH) / 2;
      doc.addImage(WATERMARK_PNG_BASE64, 'PNG', wmX, wmY, wmW, wmH, undefined, 'FAST');
    } catch (e) {
      console.warn('Watermark rendering skipped:', e);
    }
  };

  // Draw watermark on first page (behind all text and tables)
  drawPageWatermark();

  // ==========================================
  // 1. TOP HEADER SECTION WITH OFFICIAL LOGO
  // ==========================================
  const isGstinVerified = invoice.supplier.isGstinVerified && !!invoice.supplier.gstin;
  const isTaxInvoice = isGstinVerified && invoice.documentType === 'TAX_INVOICE';
  const docTitle = isTaxInvoice ? 'TAX INVOICE' : 'DRAFT INVOICE';
  const docSubTitle = isTaxInvoice
    ? '(Original for Recipient)'
    : '(Not a Valid Tax Invoice — Draft Document)';

  // Top-left Corner Logo (18mm wide, preserving original aspect ratio)
  const logoW = 18;
  const logoH = logoW / LOGO_ASPECT_RATIO;
  const logoX = margin;
  const logoY = currentY;

  try {
    doc.addImage(LOGO_PNG_BASE64, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
  } catch (e) {
    console.warn('Corner logo rendering skipped:', e);
  }

  // Company Details aligned neatly to the right of the logo
  const companyTextX = margin + logoW + 3; // 31mm
  const companyMaxW = pageWidth - margin - 65 - companyTextX; // ample width for text

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(...navy);
  doc.text(invoice.supplier.legalName || 'KHALID LEGAL WORKS PRIVATE LIMITED', companyTextX, currentY + 4, { maxWidth: companyMaxW });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...blueAccent);
  doc.text(invoice.supplier.brandName || 'Legal Success India', companyTextX, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...slateMuted);
  doc.text(`CIN: ${invoice.supplier.cin || 'U70200WB2024PTC270336'}`, companyTextX, currentY + 11.8);
  doc.text(invoice.supplier.address || '22/1 Mominpore Road, Kolkata, West Bengal – 700023, India', companyTextX, currentY + 15.2, { maxWidth: companyMaxW });
  doc.text(`Email: ${invoice.supplier.email} | Phone: ${invoice.supplier.phone}`, companyTextX, currentY + 18.6);
  
  const directorStr = invoice.supplier.directors
    ? invoice.supplier.directors.map((d) => `${d.name} (DIN: ${d.din})`).join(' | ')
    : 'Azsed Anwar (DIN: 10614233) | Arshed Anwar (DIN: 10614234)';
  doc.text(`Directors: ${directorStr}`, companyTextX, currentY + 22, { maxWidth: companyMaxW });

  // Right Header: Document Type & GSTIN info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...(isTaxInvoice ? navy : redText));
  doc.text(docTitle, pageWidth - margin, currentY + 4.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slateMuted);
  doc.text(docSubTitle, pageWidth - margin, currentY + 8.5, { align: 'right' });

  // Supplier Tax Snapshot Box
  const taxBoxX = pageWidth - margin - 60;
  const taxBoxY = currentY + 11;
  const taxBoxW = 60;
  const taxBoxH = 13.5;

  doc.setDrawColor(...slateBorder);
  doc.setFillColor(...bgLight);
  doc.roundedRect(taxBoxX, taxBoxY, taxBoxW, taxBoxH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...slateMuted);
  doc.text('GSTIN:', taxBoxX + 2.5, taxBoxY + 4);
  doc.text('PAN:', taxBoxX + 2.5, taxBoxY + 8);
  doc.text('State / Code:', taxBoxX + 2.5, taxBoxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  if (isGstinVerified) {
    doc.setTextColor(...navy);
    doc.text(invoice.supplier.gstin, taxBoxX + 20, taxBoxY + 4);
  } else {
    doc.setTextColor(...redText);
    doc.text('Pending Verification', taxBoxX + 20, taxBoxY + 4);
  }

  doc.setTextColor(...navy);
  doc.text('As Applicable', taxBoxX + 20, taxBoxY + 8);
  doc.text(`${invoice.supplier.state} (${invoice.supplier.stateCode})`, taxBoxX + 20, taxBoxY + 12);

  currentY += 26;

  // ==========================================
  // 2. UNVERIFIED GSTIN NOTICE BANNER
  // ==========================================
  if (!isGstinVerified) {
    const bannerH = 6;
    doc.setDrawColor(254, 202, 202); // red-200
    doc.setFillColor(254, 242, 242); // red-50
    doc.roundedRect(margin, currentY, contentWidth, bannerH, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(185, 28, 28); // red-700
    doc.text(
      'NOTICE: Supplier GST registration details are pending formal CA verification. This document is issued as a Pro Forma / Quotation.',
      pageWidth / 2,
      currentY + 4,
      { align: 'center' }
    );
    currentY += 8;
  } else {
    currentY += 2;
  }

  // ==========================================
  // 3. INVOICE DETAILS & CUSTOMER BLOCK
  // ==========================================
  const cardGap = 4;
  const cardW = (contentWidth - cardGap) / 2; // 93 mm each
  const cardH = 25;

  // Left Card: Invoice Meta
  doc.setDrawColor(...slateBorder);
  doc.setFillColor(...bgLight);
  doc.roundedRect(margin, currentY, cardW, cardH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...navy);
  doc.text('INVOICE DETAILS', margin + 3, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slateMuted);
  doc.text('Invoice Number:', margin + 3, currentY + 9);
  doc.text('Invoice Date:', margin + 3, currentY + 13.5);
  doc.text('Due Date:', margin + 3, currentY + 18);
  doc.text('Place of Supply:', margin + 3, currentY + 22.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text(invoice.invoiceNumber, margin + 26, currentY + 9);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceDate, margin + 26, currentY + 13.5);
  doc.text(invoice.dueDate, margin + 26, currentY + 18);

  const posText = `${invoice.placeOfSupply} (${invoice.placeOfSupplyCode}) — ${
    invoice.summary.isIntraState ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'
  }`;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blueAccent);
  doc.text(posText, margin + 26, currentY + 22.5);

  // Right Card: Billed To (Customer)
  const custX = margin + cardW + cardGap;
  doc.setDrawColor(...slateBorder);
  doc.setFillColor(...bgLight);
  doc.roundedRect(custX, currentY, cardW, cardH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...navy);
  doc.text('BILLED TO (CLIENT / RECIPIENT)', custX + 3, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...navy);
  const custName = invoice.customer.companyName || invoice.customer.name;
  doc.text(custName, custX + 3, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...slateMuted);
  const addressLines = doc.splitTextToSize(
    `${invoice.customer.address}, ${invoice.customer.city}, ${invoice.customer.state} – ${invoice.customer.pincode}`,
    cardW - 6
  );
  doc.text(addressLines.slice(0, 2), custX + 3, currentY + 13);

  const clientGstin = invoice.customer.gstin ? `Client GSTIN: ${invoice.customer.gstin}` : 'Client GSTIN: Unregistered Consumer';
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text(clientGstin, custX + 3, currentY + 19);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateMuted);
  const contactText = `Contact: ${invoice.customer.phone || 'N/A'} | ${invoice.customer.email || 'N/A'}`;
  doc.text(contactText, custX + 3, currentY + 22.5);

  currentY += cardH + 4;

  // ==========================================
  // 4. ITEMS TABLE (jspdf-autotable)
  // ==========================================
  const tableHead = [
    [
      '#',
      'Description of Legal Service / Matter',
      'SAC',
      'Qty',
      'Rate (Rs.)',
      'Disc.',
      'Taxable (Rs.)',
      'GST %',
      'Total (Rs.)',
    ],
  ];

  const tableBody = invoice.lineItems.map((item, index) => {
    const descText = item.detailedScope
      ? `${item.description}\n${item.detailedScope}`
      : item.description;

    const discDisplay = item.discount && item.discount > 0
      ? (item.discountType === 'percentage' ? `${item.discount}%` : formatIndianNumber(item.discount))
      : '-';

    return [
      String(index + 1),
      descText,
      item.sacCode || '998213',
      `${item.quantity} ${item.unit || 'service'}`,
      formatIndianNumber(item.rate),
      discDisplay,
      formatIndianNumber(item.taxableValue),
      `${item.gstRate}%`,
      formatIndianNumber(item.lineTotal),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: tableHead,
    body: tableBody,
    theme: 'plain',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.2,
      cellPadding: { top: 2.5, bottom: 2.5, left: 1.5, right: 1.5 },
      halign: 'left',
    },
    styles: {
      font: 'helvetica',
      fontSize: 6.8,
      textColor: [15, 23, 42],
      cellPadding: { top: 2.2, bottom: 2.2, left: 1.5, right: 1.5 },
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' }, // #
      1: { cellWidth: 65, halign: 'left' },  // Description
      2: { cellWidth: 15, halign: 'center' }, // SAC
      3: { cellWidth: 16, halign: 'center' }, // Qty
      4: { cellWidth: 20, halign: 'right' },  // Rate
      5: { cellWidth: 12, halign: 'right' },  // Disc
      6: { cellWidth: 22, halign: 'right' },  // Taxable
      7: { cellWidth: 12, halign: 'center' }, // GST %
      8: { cellWidth: 21, halign: 'right', fontStyle: 'bold' }, // Total
    },
    alternateRowStyles: {
      fillColor: [253, 254, 255],
    },
  });

  // Position after table
  const finalTableY = (doc as any).lastAutoTable.finalY || currentY + 30;
  currentY = finalTableY + 4;

  // ==========================================
  // 5. GST BREAKDOWN & INVOICE TOTALS (SIDE BY SIDE)
  // ==========================================
  const bottomCardW = (contentWidth - cardGap) / 2; // 93 mm each
  const bottomCardH = 34;

  // Check if we need to add a page (multi-page handling)
  if (currentY + bottomCardH + 45 > pageHeight - margin) {
    doc.addPage();
    drawPageWatermark();
    currentY = margin;
  }

  // --- Left: GST Tax Breakdown Card ---
  doc.setDrawColor(...slateBorder);
  doc.setFillColor(...bgLight);
  doc.roundedRect(margin, currentY, bottomCardW, bottomCardH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...navy);
  doc.text('GST TAX BREAKDOWN', margin + 3, currentY + 4.5);

  let taxRowY = currentY + 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...navy);

  if (invoice.summary.isIntraState) {
    const cgstRate = (invoice.lineItems[0]?.cgstRate || 9).toFixed(0);
    const sgstRate = (invoice.lineItems[0]?.sgstRate || 9).toFixed(0);

    doc.text(`Central GST (CGST @ ${cgstRate}%):`, margin + 3, taxRowY);
    doc.text(`${prefixStr}${formatIndianNumber(invoice.summary.cgstTotal)}`, margin + bottomCardW - 3, taxRowY, { align: 'right' });
    taxRowY += 4.5;

    doc.text(`State GST (SGST @ ${sgstRate}%):`, margin + 3, taxRowY);
    doc.text(`${prefixStr}${formatIndianNumber(invoice.summary.sgstTotal)}`, margin + bottomCardW - 3, taxRowY, { align: 'right' });
    taxRowY += 4.5;
  } else {
    const igstRate = (invoice.lineItems[0]?.igstRate || 18).toFixed(0);
    doc.text(`Integrated GST (IGST @ ${igstRate}%):`, margin + 3, taxRowY);
    doc.text(`${prefixStr}${formatIndianNumber(invoice.summary.igstTotal)}`, margin + bottomCardW - 3, taxRowY, { align: 'right' });
    taxRowY += 4.5;
  }

  // Separator line
  doc.setDrawColor(...slateBorder);
  doc.line(margin + 3, taxRowY, margin + bottomCardW - 3, taxRowY);
  taxRowY += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('Total Applicable Tax:', margin + 3, taxRowY);
  doc.text(`${prefixStr}${formatIndianNumber(invoice.summary.totalGst)}`, margin + bottomCardW - 3, taxRowY, { align: 'right' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.2);
  doc.setTextColor(...slateMuted);
  doc.text('Tax calculated as per Indian GST Act & Place of Supply Rules', margin + 3, currentY + bottomCardH - 3);

  // --- Right: Invoice Summary Card ---
  const sumX = margin + bottomCardW + cardGap;
  doc.setDrawColor(...slateBorder);
  doc.setFillColor(...bgLight);
  doc.roundedRect(sumX, currentY, bottomCardW, bottomCardH, 1, 1, 'FD');

  let sumRowY = currentY + 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...slateMuted);

  // Subtotal (Gross)
  doc.text('Subtotal (Gross):', sumX + 3, sumRowY);
  doc.setTextColor(...navy);
  const grossSub = invoice.summary.taxableSubtotal + invoice.summary.totalDiscount;
  doc.text(`${prefixStr}${formatIndianNumber(grossSub)}`, sumX + bottomCardW - 3, sumRowY, { align: 'right' });
  sumRowY += 4.2;

  // Discount (if any)
  if (invoice.summary.totalDiscount > 0) {
    doc.setTextColor(...slateMuted);
    doc.text('Total Discount:', sumX + 3, sumRowY);
    doc.setTextColor(...redText);
    doc.text(`-${prefixStr}${formatIndianNumber(invoice.summary.totalDiscount)}`, sumX + bottomCardW - 3, sumRowY, { align: 'right' });
    sumRowY += 4.2;
  }

  // Taxable Value
  doc.setTextColor(...slateMuted);
  doc.text('Total Taxable Value:', sumX + 3, sumRowY);
  doc.setTextColor(...navy);
  doc.text(`${prefixStr}${formatIndianNumber(invoice.summary.taxableSubtotal)}`, sumX + bottomCardW - 3, sumRowY, { align: 'right' });
  sumRowY += 4.2;

  // Total Tax
  doc.setTextColor(...slateMuted);
  doc.text('Total GST Tax:', sumX + 3, sumRowY);
  doc.setTextColor(...navy);
  doc.text(`${prefixStr}${formatIndianNumber(invoice.summary.totalGst)}`, sumX + bottomCardW - 3, sumRowY, { align: 'right' });
  sumRowY += 5;

  // Grand Total Navy Ribbon
  const ribbonH = 6.5;
  doc.setFillColor(...navy);
  doc.roundedRect(sumX + 1.5, sumRowY - 1, bottomCardW - 3, ribbonH, 0.8, 0.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Total Invoice Amount:', sumX + 4, sumRowY + 3.2);
  // Important: right aligned with safe padding to prevent clipping!
  doc.text(`${prefixStr}${formatIndianNumber(invoice.summary.grandTotal)}`, sumX + bottomCardW - 4.5, sumRowY + 3.2, { align: 'right' });
  sumRowY += ribbonH + 3.2;

  // Paid and Balance Due row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...greenText);
  doc.text(`Paid: ${prefixStr}${formatIndianNumber(invoice.amountPaid)}`, sumX + 3, sumRowY);

  doc.setTextColor(...redText);
  doc.text(`Balance Due: ${prefixStr}${formatIndianNumber(invoice.balanceDue)}`, sumX + bottomCardW - 3, sumRowY, { align: 'right' });

  currentY += bottomCardH + 3;

  // ==========================================
  // 6. AMOUNT IN WORDS BANNER
  // ==========================================
  const wordsH = 6;
  doc.setDrawColor(...slateBorder);
  doc.setFillColor(...bgLight);
  doc.roundedRect(margin, currentY, contentWidth, wordsH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...navy);
  doc.text('Amount in Words:', margin + 3, currentY + 4);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blueAccent);
  doc.text(invoice.amountInWords || 'Rupees Zero Only', margin + 30, currentY + 4);

  currentY += wordsH + 4;

  // ==========================================
  // 7. BANK DETAILS & AUTHORISED SIGNATORY
  // ==========================================
  const bankCardW = bottomCardW;
  const maxValW = bankCardW - 25; // Safe width for text values

  // Pre-calculate wrapped lines for bank details to calculate height
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  const accLines = doc.splitTextToSize(
    invoice.supplier.bankDetails.accountName || 'KHALID LEGAL WORKS PRIVATE LIMITED',
    maxValW
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  const bankLines = doc.splitTextToSize(
    `${invoice.supplier.bankDetails.bankName}, ${invoice.supplier.bankDetails.branch}`,
    maxValW
  );

  // Height required for bank details (padding + title + account + bank + accNo + ifsc + bottom margin)
  const requiredBankH = 6 + (accLines.length * 3.3) + (bankLines.length * 3.1) + 3.5 + 3.5 + 2;
  const footerCardH = Math.max(25, requiredBankH);

  // Bank Card Background Box
  doc.setDrawColor(...slateBorder);
  doc.setFillColor(...bgLight);
  doc.roundedRect(margin, currentY, bankCardW, footerCardH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...navy);
  doc.text('BANK SETTLEMENT INSTRUCTIONS', margin + 3, currentY + 4);

  // Bank Rows with clean dynamic spacing
  let bRowY = currentY + 7.5;

  // 1. Account Name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...slateMuted);
  doc.text('Account Name:', margin + 3, bRowY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text(accLines, margin + 22, bRowY);
  bRowY += accLines.length * 3.3;

  // 2. Bank & Branch (Cleanly wrapped within card border)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateMuted);
  doc.text('Bank & Branch:', margin + 3, bRowY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...navy);
  doc.text(bankLines, margin + 22, bRowY);
  bRowY += bankLines.length * 3.1;

  // 3. Account No
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateMuted);
  doc.text('Account No:', margin + 3, bRowY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text(invoice.supplier.bankDetails.accountNumber || '924020042522662', margin + 22, bRowY);
  bRowY += 3.5;

  // 4. IFSC Code
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateMuted);
  doc.text('IFSC Code:', margin + 3, bRowY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text(invoice.supplier.bankDetails.ifscCode || 'UTIB0000351', margin + 22, bRowY);

  // Signatory Block
  const sigX = margin + bankCardW + cardGap;
  doc.setDrawColor(...slateBorder);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(sigX, currentY, bankCardW, footerCardH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...navy);
  doc.text(`For ${invoice.supplier.legalName || 'KHALID LEGAL WORKS PRIVATE LIMITED'}`, sigX + bankCardW / 2, currentY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(...slateMuted);
  const dirLines = doc.splitTextToSize(`Directors: ${directorStr}`, bankCardW - 6);
  doc.text(dirLines, sigX + bankCardW / 2, currentY + 7.5, { align: 'center' });

  // Signature space & title anchored cleanly to bottom of card
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.2);
  doc.setTextColor(...slateMuted);
  doc.text('Authorised Signatory', sigX + bankCardW - 5, currentY + footerCardH - 10, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...navy);
  doc.text('Azsed Anwar', sigX + bankCardW - 5, currentY + footerCardH - 5.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Director', sigX + bankCardW - 5, currentY + footerCardH - 2.5, { align: 'right' });

  currentY += footerCardH + 3;

  // ==========================================
  // 8. TERMS & CONDITIONS
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...navy);
  doc.text('Terms & Conditions:', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.6);
  doc.setTextColor(...slateMuted);

  const defaultTerms = [
    '1. Payment is due within the stipulated credit terms.',
    '2. In case of delayed payment beyond due date, interest @ 18% p.a. may be charged.',
    '3. Official government statutory fees paid to regulatory bodies (IP India / MCA / FSSAI) are non-refundable.',
    '4. Disputes subject to Kolkata jurisdiction only.',
  ];

  const termsToUse = invoice.terms && invoice.terms.length > 0 ? invoice.terms : defaultTerms;
  let termY = currentY + 2.8;
  termsToUse.forEach((term) => {
    const tLines = doc.splitTextToSize(term, contentWidth);
    doc.text(tLines, margin, termY);
    termY += tLines.length * 2.6;
  });

  // ==========================================
  // 9. BOTTOM PAGE FOOTER (PAGINATION)
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...slateMuted);

    const footerText = `${invoice.supplier.brandName} — ${invoice.supplier.legalName} | Generated: ${new Date().toLocaleDateString('en-GB')}`;
    doc.text(footerText, margin, pageHeight - 5);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  return doc;
}
