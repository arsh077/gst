import React from 'react';
import { Invoice, CompanyProfile } from '../types';
import { formatCurrency } from '../services/gstCalculationService';
import { BarChart3, TrendingUp, ShieldCheck, MapPin } from 'lucide-react';

interface ReportsViewProps {
  invoices: Invoice[];
  companyProfile: CompanyProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  invoices,
  companyProfile,
}) => {
  const currency = companyProfile.currencySymbol;

  // Tax Totals
  const taxableTotal = invoices.reduce((s, i) => s + i.summary.taxableSubtotal, 0);
  const cgstTotal = invoices.reduce((s, i) => s + i.summary.cgstTotal, 0);
  const sgstTotal = invoices.reduce((s, i) => s + i.summary.sgstTotal, 0);
  const igstTotal = invoices.reduce((s, i) => s + i.summary.igstTotal, 0);
  const totalTax = invoices.reduce((s, i) => s + i.summary.totalGst, 0);
  const grandTotal = invoices.reduce((s, i) => s + i.summary.grandTotal, 0);

  // Intra vs Inter-State
  const intraStateInvoices = invoices.filter((i) => i.summary.isIntraState);
  const interStateInvoices = invoices.filter((i) => !i.summary.isIntraState);

  const intraTaxable = intraStateInvoices.reduce((s, i) => s + i.summary.taxableSubtotal, 0);
  const interTaxable = interStateInvoices.reduce((s, i) => s + i.summary.taxableSubtotal, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm text-slate-900">GST Filing & Management Tax Summary</h2>
          <p className="text-[11px] text-slate-500">
            Reconciles GSTR-1 outward supplies and tax liability for Legal Success India
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-medium">Supplier State</span>
          <span className="text-xs font-bold text-slate-800">
            {companyProfile.state} (State Code {companyProfile.stateCode})
          </span>
        </div>
      </div>

      {/* 4 Cards: Tax Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Taxable Turnover</span>
          <span className="font-mono font-bold text-lg text-slate-900 mt-1 block">
            {formatCurrency(taxableTotal, currency)}
          </span>
          <span className="text-[10.5px] text-slate-400 mt-1 block">Gross services billed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Central GST (CGST)</span>
          <span className="font-mono font-bold text-lg text-blue-700 mt-1 block">
            {formatCurrency(cgstTotal, currency)}
          </span>
          <span className="text-[10.5px] text-slate-400 mt-1 block">Intra-State West Bengal</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">State GST (SGST)</span>
          <span className="font-mono font-bold text-lg text-blue-700 mt-1 block">
            {formatCurrency(sgstTotal, currency)}
          </span>
          <span className="text-[10.5px] text-slate-400 mt-1 block">West Bengal State Tax</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Integrated GST (IGST)</span>
          <span className="font-mono font-bold text-lg text-indigo-700 mt-1 block">
            {formatCurrency(igstTotal, currency)}
          </span>
          <span className="text-[10.5px] text-slate-400 mt-1 block">Inter-State Outward Supply</span>
        </div>
      </div>

      {/* Place of Supply Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="font-bold text-xs text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Intra-State Supplies (West Bengal 19)</span>
            <span className="text-xs font-mono text-blue-700">{intraStateInvoices.length} invoices</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Turnover:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(intraTaxable, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CGST (9%):</span>
              <span className="font-mono text-slate-800">{formatCurrency(cgstTotal, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SGST (9%):</span>
              <span className="font-mono text-slate-800">{formatCurrency(sgstTotal, currency)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
              <span>Total Intra-State Taxes:</span>
              <span className="font-mono text-emerald-700">{formatCurrency(cgstTotal + sgstTotal, currency)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="font-bold text-xs text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Inter-State Supplies (Other States / IGST)</span>
            <span className="text-xs font-mono text-indigo-700">{interStateInvoices.length} invoices</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Turnover:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(interTaxable, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IGST (18%):</span>
              <span className="font-mono text-slate-800">{formatCurrency(igstTotal, currency)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
              <span>Total Inter-State Taxes:</span>
              <span className="font-mono text-indigo-700">{formatCurrency(igstTotal, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
