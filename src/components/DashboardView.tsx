import React from 'react';
import { Invoice, CompanyProfile } from '../types';
import { formatCurrency } from '../services/gstCalculationService';
import {
  FileText,
  DollarSign,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Eye,
  Download,
  Printer,
  ShieldCheck,
  CreditCard,
  Building2,
} from 'lucide-react';

interface DashboardViewProps {
  invoices: Invoice[];
  companyProfile: CompanyProfile;
  onOpenNewInvoice: () => void;
  onPreviewInvoice: (invoice: Invoice) => void;
  onDownloadPDF: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onOpenSettings: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  companyProfile,
  onOpenNewInvoice,
  onPreviewInvoice,
  onDownloadPDF,
  onRecordPayment,
  onOpenSettings,
}) => {
  const currency = companyProfile.currencySymbol;

  // Compute metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.summary.grandTotal, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const totalOverdue = invoices
    .filter((inv) => inv.balanceDue > 0 && inv.dueDate < todayStr)
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const draftCount = invoices.filter((inv) => inv.status === 'DRAFT').length;

  const totalCgst = invoices.reduce((sum, inv) => sum + inv.summary.cgstTotal, 0);
  const totalSgst = invoices.reduce((sum, inv) => sum + inv.summary.sgstTotal, 0);
  const totalIgst = invoices.reduce((sum, inv) => sum + inv.summary.igstTotal, 0);
  const totalGst = invoices.reduce((sum, inv) => sum + inv.summary.totalGst, 0);

  const isGstinPending = !companyProfile.gstDetails.isVerified || !companyProfile.gstDetails.gstin;

  return (
    <div className="space-y-6">
      {/* Alert Header if GSTIN Pending */}
      {isGstinPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-amber-900">
                Supplier GST Details Pending Formal CA Verification
              </h3>
              <p className="text-[11px] text-amber-700">
                All generated documents are currently issued as <span className="font-bold">DRAFT INVOICE</span> or{' '}
                <span className="font-bold">PRO FORMA INVOICE</span>. Once your CA approves the GST registration, update it in Settings to issue Tax Invoices.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg transition shrink-0"
          >
            Configure GST Details
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Invoiced */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Total Invoiced</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-bold text-xl text-slate-900 tracking-tight font-mono">
            {formatCurrency(totalInvoiced, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {invoices.length} total invoice{invoices.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Collected */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-bold text-xl text-emerald-700 tracking-tight font-mono">
            {formatCurrency(totalCollected, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Direct Axis Bank settlement</div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Receivables</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-bold text-xl text-amber-700 tracking-tight font-mono">
            {formatCurrency(totalOutstanding, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Pending client clearance</div>
        </div>

        {/* Overdue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-bold text-xl text-rose-700 tracking-tight font-mono">
            {formatCurrency(totalOverdue, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Past due date</div>
        </div>

        {/* Drafts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Draft Documents</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-bold text-xl text-blue-700 tracking-tight font-mono">
            {draftCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Pending issue or approval</div>
        </div>
      </div>

      {/* Quick Action & Tax Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Recent Invoices Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Recent Invoices & Drafts</h3>
              <span className="text-[11px] font-mono text-slate-400">({invoices.length})</span>
            </div>
            <button
              onClick={onOpenNewInvoice}
              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Invoice</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Client / Recipient</th>
                  <th className="py-2.5 px-3 text-center">Place of Supply</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                        {inv.customer.companyName || inv.customer.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{inv.invoiceDate}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {inv.placeOfSupply} ({inv.placeOfSupplyCode})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(inv.summary.grandTotal, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {inv.balanceDue > 0 ? (
                        <span className="font-bold text-rose-700">
                          {formatCurrency(inv.balanceDue, currency)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">Settled</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : inv.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onPreviewInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Preview A4 Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDownloadPDF(inv)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => onRecordPayment(inv)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: GST Tax Summary & Bank Profile */}
        <div className="space-y-4">
          {/* Tax Summary Widget */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-xs">GST Tax Reconciliation</h3>
              <span className="text-[10px] text-slate-400">Total Billed Taxes</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Central GST (CGST):</span>
                <span className="font-mono font-semibold text-white">
                  {formatCurrency(totalCgst, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>State GST (SGST):</span>
                <span className="font-mono font-semibold text-white">
                  {formatCurrency(totalSgst, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Integrated GST (IGST):</span>
                <span className="font-mono font-semibold text-white">
                  {formatCurrency(totalIgst, currency)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold">
                <span className="text-slate-200">Total GST Liability:</span>
                <span className="font-mono text-sm text-emerald-400 font-bold">
                  {formatCurrency(totalGst, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Verification Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Settlement Account Details</span>
            </div>
            <div className="text-[11px] space-y-1 text-slate-600">
              <div>
                <span className="text-slate-400">Bank:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {companyProfile.bankDetails.bankName}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Branch:</span>{' '}
                <span className="text-slate-800">{companyProfile.bankDetails.branch}</span>
              </div>
              <div>
                <span className="text-slate-400">A/C:</span>{' '}
                <span className="font-mono font-bold text-slate-900">
                  {companyProfile.bankDetails.accountNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400">IFSC:</span>{' '}
                <span className="font-mono font-bold text-slate-900">
                  {companyProfile.bankDetails.ifscCode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
