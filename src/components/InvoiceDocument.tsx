import React from 'react';
import { Invoice } from '../types';
import { formatIndianNumber } from '../services/gstCalculationService';

interface InvoiceDocumentProps {
  invoice: Invoice;
  currencySymbol?: '₹' | 'Rs.';
  compact?: boolean;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoice,
  currencySymbol = '₹',
  compact = false,
}) => {
  const isGstinVerified = invoice.supplier.isGstinVerified && !!invoice.supplier.gstin;
  const isTaxInvoice = isGstinVerified && invoice.documentType === 'TAX_INVOICE';
  const docTitle = isTaxInvoice ? 'TAX INVOICE' : 'DRAFT INVOICE';
  const docSubTitle = isTaxInvoice
    ? '(Original for Recipient)'
    : '(Not a Valid Tax Invoice — Draft Document)';

  const formatAmount = (val: number) => {
    const formatted = formatIndianNumber(val);
    return currencySymbol === 'Rs.' ? `Rs. ${formatted}` : `₹${formatted}`;
  };

  const directorNames = invoice.supplier.directors?.length
    ? invoice.supplier.directors.map((d) => `${d.name} (DIN: ${d.din})`).join(' | ')
    : 'Azsed Anwar (DIN: 10614233) | Arshed Anwar (DIN: 10614234)';

  return (
    <div
      id="printable-invoice"
      className="invoice-page printable-document relative bg-white text-slate-900 mx-auto transition-all shadow-sm rounded-none border border-slate-200 print:border-none print:shadow-none overflow-hidden"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '10mm',
        boxSizing: 'border-box',
        letterSpacing: 'normal',
        wordSpacing: 'normal',
      }}
    >
      {/* Subtle Background Watermark (Centered behind invoice content) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 print:flex">
        <img
          src="/assets/legal_success_watermark.png"
          alt=""
          className="w-[110mm] max-w-[55%] object-contain select-none pointer-events-none"
        />
      </div>

      <div className="relative z-10">
        {/* 1. Header Section */}
        <div className="flex justify-between items-start pb-2.5 border-b border-slate-200">
          {/* Company Identity with Official Logo */}
          <div className="flex items-start gap-3 max-w-[66%]">
            <img
              src="/assets/legal_success_logo.png"
              alt="Legal Success India"
              className="w-[18mm] h-auto shrink-0 object-contain mt-0.5"
            />
            <div className="space-y-0.5 min-w-0">
              <h1 className="text-[13.5px] font-bold text-slate-900 tracking-tight leading-tight uppercase">
                {invoice.supplier.legalName || 'KHALID LEGAL WORKS PRIVATE LIMITED'}
              </h1>
              <p className="text-xs font-semibold text-blue-700 leading-tight">
                {invoice.supplier.brandName || 'Legal Success India'}
              </p>
              <p className="text-[10px] text-slate-600 leading-tight">
                CIN: <span className="font-medium text-slate-800">{invoice.supplier.cin || 'U70200WB2024PTC270336'}</span>
              </p>
              <p className="text-[10px] text-slate-600 leading-tight">
                {invoice.supplier.address || '22/1 Mominpore Road, Kolkata, West Bengal – 700023, India'}
              </p>
              <p className="text-[10px] text-slate-600 leading-tight">
                Email: <span className="text-slate-800 font-medium">{invoice.supplier.email}</span> | Phone:{' '}
                <span className="text-slate-800 font-medium">{invoice.supplier.phone}</span>
              </p>
              <p className="text-[9.5px] text-slate-500 pt-0.5 leading-tight">
                Directors: {directorNames}
              </p>
            </div>
          </div>

          {/* Document Title & GSTIN Info Box */}
          <div className="text-right flex flex-col items-end">
            <div className="mb-1.5">
            <span
              className={`inline-block text-lg font-black tracking-tight leading-none ${
                isTaxInvoice ? 'text-slate-900' : 'text-rose-700'
              }`}
            >
              {docTitle}
            </span>
            <p className="text-[10px] text-slate-500 font-medium">{docSubTitle}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-1.5 text-left text-[10px] space-y-0.5 min-w-[195px]">
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 font-medium">GSTIN:</span>
              {isGstinVerified ? (
                <span className="font-bold text-slate-900 font-mono tracking-tight">{invoice.supplier.gstin}</span>
              ) : (
                <span className="font-semibold text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                  Pending Verification
                </span>
              )}
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 font-medium">PAN:</span>
              <span className="font-semibold text-slate-800 font-mono">As Applicable</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 font-medium">State / Code:</span>
              <span className="font-bold text-slate-900">
                {invoice.supplier.state} ({invoice.supplier.stateCode})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Unverified GSTIN Notice Banner */}
      {!isGstinVerified && (
        <div className="mt-2 bg-rose-50/80 border border-rose-200 text-rose-800 text-[10px] font-medium px-3 py-1 rounded text-center">
          <span className="font-bold">NOTICE:</span> Supplier GST registration details are pending formal CA verification. This document is issued as a Pro Forma / Quotation.
        </div>
      )}

      {/* 3. Invoice Details & Recipient Cards (Side-by-side) */}
      <div className="mt-2.5 grid grid-cols-2 gap-3">
        {/* Left: Invoice Details */}
        <div className="bg-slate-50/80 border border-slate-200 rounded p-2.5 text-xs space-y-1">
          <div className="font-bold text-slate-900 text-[11px] pb-1 border-b border-slate-200/80 flex items-center justify-between">
            <span>INVOICE DETAILS</span>
            <span className="text-[10px] font-semibold text-slate-500">{invoice.status}</span>
          </div>
          <div className="grid grid-cols-[90px_1fr] gap-1 text-[10.5px]">
            <span className="text-slate-500 font-medium">Invoice Number:</span>
            <span className="font-bold text-slate-900 font-mono">{invoice.invoiceNumber}</span>

            <span className="text-slate-500 font-medium">Invoice Date:</span>
            <span className="text-slate-800">{invoice.invoiceDate}</span>

            <span className="text-slate-500 font-medium">Due Date:</span>
            <span className="text-slate-800">{invoice.dueDate}</span>

            <span className="text-slate-500 font-medium">Place of Supply:</span>
            <span className="font-bold text-blue-700">
              {invoice.placeOfSupply} ({invoice.placeOfSupplyCode}) —{' '}
              {invoice.summary.isIntraState ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'}
            </span>
          </div>
        </div>

        {/* Right: Recipient (Billed To) */}
        <div className="bg-slate-50/80 border border-slate-200 rounded p-2.5 text-xs space-y-1">
          <div className="font-bold text-slate-900 text-[11px] pb-1 border-b border-slate-200/80">
            BILLED TO (CLIENT / RECIPIENT)
          </div>
          <div className="text-[10.5px] space-y-0.5">
            <p className="font-bold text-slate-900 leading-tight">
              {invoice.customer.companyName || invoice.customer.name}
            </p>
            <p className="text-slate-600 text-[10px] leading-tight">
              {invoice.customer.address}, {invoice.customer.city}, {invoice.customer.state} –{' '}
              {invoice.customer.pincode}
            </p>
            <p className="text-[10px] pt-0.5">
              <span className="text-slate-500 font-medium">Client GSTIN: </span>
              {invoice.customer.gstin ? (
                <span className="font-bold text-slate-900 font-mono">{invoice.customer.gstin}</span>
              ) : (
                <span className="text-slate-500 italic">Unregistered Consumer</span>
              )}
            </p>
            <p className="text-[10px] text-slate-500">
              Contact: {invoice.customer.phone || 'N/A'} | {invoice.customer.email || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Service Line Items Table */}
      <div className="mt-3 overflow-hidden rounded border border-slate-200">
        <table className="invoice-table w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[10px] font-bold">
              <th className="py-2 px-1.5 w-[5%] text-center">#</th>
              <th className="py-2 px-2 w-[40%]">Description of Legal Service / Matter</th>
              <th className="py-2 px-1.5 w-[10%] text-center">SAC</th>
              <th className="py-2 px-1.5 w-[9%] text-center">Qty</th>
              <th className="py-2 px-2 w-[11%] text-right font-medium">Rate ({currencySymbol})</th>
              <th className="py-2 px-1.5 w-[7%] text-right font-medium">Disc.</th>
              <th className="py-2 px-2 w-[11%] text-right font-medium">Taxable ({currencySymbol})</th>
              <th className="py-2 px-1.5 w-[7%] text-center font-medium">GST %</th>
              <th className="py-2 px-2 w-[12%] text-right">Total ({currencySymbol})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[10.5px]">
            {invoice.lineItems.map((item, idx) => (
              <tr
                key={item.id || idx}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
              >
                <td className="py-2 px-1.5 text-center text-slate-500 font-medium">{idx + 1}</td>
                <td className="py-2 px-2 text-slate-900">
                  <div className="font-semibold text-slate-900 leading-snug">{item.description}</div>
                  {item.detailedScope && (
                    <div className="text-[9.5px] text-slate-600 mt-0.5 leading-relaxed font-normal whitespace-pre-line">
                      {item.detailedScope}
                    </div>
                  )}
                </td>
                <td className="py-2 px-1.5 text-center font-mono text-[10px] text-slate-700">
                  {item.sacCode || '998213'}
                </td>
                <td className="py-2 px-1.5 text-center text-slate-700">
                  {item.quantity} {item.unit || 'unit'}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-800">
                  {formatIndianNumber(item.rate)}
                </td>
                <td className="py-2 px-1.5 text-right font-mono tabular-nums text-slate-500">
                  {item.discount && item.discount > 0
                    ? item.discountType === 'percentage'
                      ? `${item.discount}%`
                      : formatIndianNumber(item.discount)
                    : '-'}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums font-semibold text-slate-900">
                  {formatIndianNumber(item.taxableValue)}
                </td>
                <td className="py-2 px-1.5 text-center font-medium text-slate-700">
                  {item.gstRate}%
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums font-bold text-slate-900">
                  {formatIndianNumber(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. GST Breakdown & Invoice Summary (Side-by-side) */}
      <div className="mt-3 grid grid-cols-2 gap-3 invoice-totals">
        {/* Left: GST Tax Breakdown */}
        <div className="bg-slate-50/80 border border-slate-200 rounded p-2.5 text-xs flex flex-col justify-between">
          <div>
            <div className="font-bold text-slate-900 text-[11px] pb-1 border-b border-slate-200">
              GST TAX BREAKDOWN
            </div>
            <div className="space-y-1.5 pt-2 text-[10.5px]">
              {invoice.summary.isIntraState ? (
                <>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Central GST (CGST @ {(invoice.lineItems[0]?.cgstRate || 9).toFixed(0)}%):</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {formatAmount(invoice.summary.cgstTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span>State GST (SGST @ {(invoice.lineItems[0]?.sgstRate || 9).toFixed(0)}%):</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {formatAmount(invoice.summary.sgstTotal)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center text-slate-700">
                  <span>Integrated GST (IGST @ {(invoice.lineItems[0]?.igstRate || 18).toFixed(0)}%):</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {formatAmount(invoice.summary.igstTotal)}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center font-bold text-slate-900">
                <span>Total Applicable Tax:</span>
                <span className="font-mono tabular-nums text-slate-900">
                  {formatAmount(invoice.summary.totalGst)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[9.5px] italic text-slate-500 pt-2 border-t border-slate-100">
            Tax calculated as per Indian GST Act & Place of Supply Rules
          </p>
        </div>

        {/* Right: Invoice Summary */}
        <div className="bg-slate-50/80 border border-slate-200 rounded p-2.5 text-xs space-y-1.5">
          <div className="flex justify-between items-center text-[10.5px] text-slate-600">
            <span>Subtotal (Gross):</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {formatAmount(invoice.summary.taxableSubtotal + invoice.summary.totalDiscount)}
            </span>
          </div>

          {invoice.summary.totalDiscount > 0 && (
            <div className="flex justify-between items-center text-[10.5px] text-slate-600">
              <span>Total Discount:</span>
              <span className="font-mono tabular-nums font-semibold text-rose-600">
                -{formatAmount(invoice.summary.totalDiscount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-[10.5px] text-slate-600">
            <span>Total Taxable Value:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {formatAmount(invoice.summary.taxableSubtotal)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[10.5px] text-slate-600">
            <span>Total GST Tax:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {formatAmount(invoice.summary.totalGst)}
            </span>
          </div>

          {invoice.summary.roundOff !== 0 && (
            <div className="flex justify-between items-center text-[10.5px] text-slate-600">
              <span>Round-off:</span>
              <span className="font-mono tabular-nums text-slate-700">
                {invoice.summary.roundOff > 0 ? '+' : ''}
                {formatAmount(invoice.summary.roundOff)}
              </span>
            </div>
          )}

          {/* Grand Total Highlight Ribbon */}
          <div className="bg-slate-900 text-white rounded px-2.5 py-1.5 flex justify-between items-center font-bold text-xs mt-1">
            <span>Total Invoice Amount:</span>
            <span className="font-mono text-sm tracking-tight font-black tabular-nums">
              {formatAmount(invoice.summary.grandTotal)}
            </span>
          </div>

          {/* Amount Paid & Balance Due */}
          <div className="pt-1 flex justify-between items-center text-[11px] font-bold">
            <span className="text-emerald-700">
              Paid: <span className="font-mono tabular-nums">{formatAmount(invoice.amountPaid)}</span>
            </span>
            <span className="text-rose-700">
              Balance Due: <span className="font-mono tabular-nums">{formatAmount(invoice.balanceDue)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 6. Amount in Words Banner */}
      <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs flex items-center gap-2">
        <span className="text-slate-500 font-bold text-[10.5px] whitespace-nowrap">Amount in Words:</span>
        <span className="font-bold text-blue-800 text-[11px] italic tracking-tight">
          {invoice.amountInWords || 'Rupees Zero Only'}
        </span>
      </div>

      {/* 7. Bank Details & Signatory */}
      <div className="mt-2.5 grid grid-cols-2 gap-3 bank-details signature-block">
        {/* Bank Instructions */}
        <div className="bg-slate-50/80 border border-slate-200 rounded p-2.5 text-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="font-bold text-slate-900 text-[11px] pb-1 border-b border-slate-200">
              BANK SETTLEMENT INSTRUCTIONS
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1.5 pt-1.5 text-[10px]">
              <span className="text-slate-500 font-medium shrink-0">Account Name:</span>
              <span className="font-bold text-slate-900 break-words leading-tight">
                {invoice.supplier.bankDetails.accountName || 'KHALID LEGAL WORKS PRIVATE LIMITED'}
              </span>

              <span className="text-slate-500 font-medium shrink-0">Bank & Branch:</span>
              <span className="text-slate-800 break-words leading-tight">
                {invoice.supplier.bankDetails.bankName}, {invoice.supplier.bankDetails.branch}
              </span>

              <span className="text-slate-500 font-medium shrink-0">Account No:</span>
              <span className="font-mono font-bold text-slate-900 break-all">
                {invoice.supplier.bankDetails.accountNumber || '924020042522662'}
              </span>

              <span className="text-slate-500 font-medium shrink-0">IFSC Code:</span>
              <span className="font-mono font-bold text-slate-900">
                {invoice.supplier.bankDetails.ifscCode || 'UTIB0000351'}
              </span>
            </div>
          </div>
        </div>

        {/* Authorized Signatory */}
        <div className="bg-white border border-slate-200 rounded p-2.5 text-xs flex flex-col justify-between text-center">
          <div>
            <div className="font-bold text-slate-900 text-[11px]">
              For {invoice.supplier.legalName || 'KHALID LEGAL WORKS PRIVATE LIMITED'}
            </div>
            <div className="text-[9px] text-slate-500 pt-0.5">
              Directors: {directorNames}
            </div>
          </div>

          <div className="mt-4 pt-1 flex flex-col items-end pr-2">
            <span className="text-[10px] text-slate-400 italic">Authorised Signatory</span>
            <span className="font-bold text-slate-900 text-[11px] pt-1">Azsed Anwar</span>
            <span className="text-[9.5px] text-slate-600">Director</span>
          </div>
        </div>
      </div>

      {/* 8. Terms & Conditions */}
      <div className="mt-2.5 pt-1.5 border-t border-slate-200/80 text-[9px] text-slate-500 leading-tight">
        <span className="font-bold text-slate-700">Terms & Conditions: </span>
        <span>
          1. Payment is due within the stipulated credit terms. 2. In case of delayed payment beyond due date, interest @ 18% p.a. may be charged. 3. Official government statutory fees paid to regulatory bodies (IP India / MCA / FSSAI) are non-refundable. 4. Disputes subject to Kolkata jurisdiction only.
        </span>
      </div>

      {/* 9. Page Footnote */}
      <div className="mt-2 text-center text-[8.5px] text-slate-400">
        {invoice.supplier.brandName} — {invoice.supplier.legalName} | Generated: {new Date().toLocaleDateString('en-GB')} | Page 1 of 1
      </div>
      </div>
    </div>
  );
};
