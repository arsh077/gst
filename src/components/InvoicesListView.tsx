import React, { useState } from 'react';
import { Invoice, CompanyProfile, InvoiceStatus } from '../types';
import { formatCurrency } from '../services/gstCalculationService';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  Printer,
  CreditCard,
  Edit3,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

interface InvoicesListViewProps {
  invoices: Invoice[];
  companyProfile: CompanyProfile;
  onOpenNewInvoice: () => void;
  onPreviewInvoice: (invoice: Invoice) => void;
  onDownloadPDF: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
}

export const InvoicesListView: React.FC<InvoicesListViewProps> = ({
  invoices,
  companyProfile,
  onOpenNewInvoice,
  onPreviewInvoice,
  onDownloadPDF,
  onRecordPayment,
  onEditInvoice,
  onDeleteInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const currency = companyProfile.currencySymbol;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customer.gstin && inv.customer.gstin.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = [
      'Invoice Number',
      'Document Type',
      'Status',
      'Invoice Date',
      'Due Date',
      'Customer',
      'Customer GSTIN',
      'Place of Supply',
      'Taxable Subtotal',
      'CGST Total',
      'SGST Total',
      'IGST Total',
      'Total GST',
      'Grand Total',
      'Amount Paid',
      'Balance Due',
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.documentType,
      inv.status,
      inv.invoiceDate,
      inv.dueDate,
      `"${inv.customer.companyName || inv.customer.name}"`,
      inv.customer.gstin || 'Unregistered',
      `${inv.placeOfSupply} (${inv.placeOfSupplyCode})`,
      inv.summary.taxableSubtotal,
      inv.summary.cgstTotal,
      inv.summary.sgstTotal,
      inv.summary.igstTotal,
      inv.summary.totalGst,
      inv.summary.grandTotal,
      inv.amountPaid,
      inv.balanceDue,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Invoice_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, client, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium border-none focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            title="Export filtered invoices to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900 text-white text-[11px] font-bold">
              <tr>
                <th className="py-3 px-3">Invoice Number</th>
                <th className="py-3 px-3">Customer / Entity</th>
                <th className="py-3 px-3 text-center">Place of Supply</th>
                <th className="py-3 px-3 text-right">Taxable</th>
                <th className="py-3 px-3 text-right">Total GST</th>
                <th className="py-3 px-3 text-right">Invoice Total</th>
                <th className="py-3 px-3 text-right">Balance Due</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400">{inv.invoiceDate}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">
                        {inv.customer.companyName || inv.customer.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {inv.customer.gstin || 'Unregistered'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {inv.placeOfSupply} ({inv.placeOfSupplyCode})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                      {formatCurrency(inv.summary.taxableSubtotal, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                      {formatCurrency(inv.summary.totalGst, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(inv.summary.grandTotal, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {inv.balanceDue > 0 ? (
                        <span className="font-bold text-rose-700">
                          {formatCurrency(inv.balanceDue, currency)}
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-700">₹0.00</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
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
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onPreviewInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Preview A4 Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDownloadPDF(inv)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Download Genuine PDF"
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
                        {inv.status === 'DRAFT' && (
                          <button
                            onClick={() => onEditInvoice(inv)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                            title="Edit Draft"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {inv.status === 'DRAFT' && (
                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Delete Draft"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
