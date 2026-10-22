import React, { useState } from 'react';
import { Invoice } from '../types';
import { InvoiceDocument } from './InvoiceDocument';
import { generateInvoicePDF } from '../services/pdfGenerator';
import { Download, Printer, X, Copy, Check, Share2, CreditCard, Edit3, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../services/gstCalculationService';

interface InvoicePreviewModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (invoice: Invoice) => void;
  onRecordPayment?: (invoice: Invoice) => void;
  currencySymbol?: '₹' | 'Rs.';
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onEdit,
  onRecordPayment,
  currencySymbol = '₹',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.95);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen || !invoice) return null;

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const doc = generateInvoicePDF(invoice, {
        currencyFormat: currencySymbol,
      });
      const filename = `${invoice.invoiceNumber}_${invoice.supplier.legalName.replace(/\s+/g, '_')}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summaryText = `Invoice: ${invoice.invoiceNumber}\nClient: ${invoice.customer.companyName || invoice.customer.name}\nTotal Amount: ${formatCurrency(invoice.summary.grandTotal, currencySymbol)}\nBalance Due: ${formatCurrency(invoice.balanceDue, currencySymbol)}\nDue Date: ${invoice.dueDate}\nBank: ${invoice.supplier.bankDetails.bankName}\nA/C: ${invoice.supplier.bankDetails.accountNumber}\nIFSC: ${invoice.supplier.bankDetails.ifscCode}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isGstinPending = !invoice.supplier.isGstinVerified || !invoice.supplier.gstin;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-between overflow-hidden animate-fadeIn">
      {/* Top Modal Toolbar (no-print) */}
      <div className="no-print bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight">{invoice.invoiceNumber}</span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                invoice.status === 'PAID'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : invoice.status === 'PARTIALLY_PAID'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : invoice.status === 'OVERDUE'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}
            >
              {invoice.status}
            </span>
          </div>

          {isGstinPending && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Pro Forma / Draft (GSTIN verification pending)</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden lg:flex items-center bg-slate-800 border border-slate-700 rounded p-0.5 mr-2 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(0.95)}
              className="px-2 py-1 hover:bg-slate-700 rounded text-[10px] text-slate-400"
            >
              Reset
            </button>
          </div>

          {/* Record Payment (if balance due) */}
          {invoice.balanceDue > 0 && onRecordPayment && (
            <button
              onClick={() => onRecordPayment(invoice)}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          )}

          {/* Edit Draft */}
          {invoice.status === 'DRAFT' && onEdit && (
            <button
              onClick={() => onEdit(invoice)}
              className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded transition border border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Draft</span>
            </button>
          )}

          {/* Copy Summary */}
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded transition border border-slate-700"
            title="Copy invoice details to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="print-button flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded transition border border-slate-700"
            title="Print invoice on A4 paper"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="download-button flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="ml-2 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* A4 Scrollable Viewport */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start bg-slate-800/40">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="shadow-2xl rounded-sm print:transform-none"
        >
          <InvoiceDocument invoice={invoice} currencySymbol={currencySymbol} />
        </div>
      </div>
    </div>
  );
};
