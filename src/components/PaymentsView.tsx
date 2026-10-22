import React from 'react';
import { PaymentRecord, CompanyProfile } from '../types';
import { formatCurrency } from '../services/gstCalculationService';
import { CreditCard, CheckCircle2, ArrowDownLeft, FileText } from 'lucide-react';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  companyProfile: CompanyProfile;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  companyProfile,
}) => {
  const currency = companyProfile.currencySymbol;
  const totalCollections = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-sm text-slate-900">Collections & Settlement Register</h2>
          <p className="text-[11px] text-slate-500">
            Recorded receipts deposited into Axis Bank New Alipore Account (924020042522662)
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-right">
          <span className="text-[10px] text-emerald-600 block font-medium">Total Collected</span>
          <span className="font-mono font-black text-emerald-800 text-sm">
            {formatCurrency(totalCollections, currency)}
          </span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900 text-white text-[11px] font-bold">
              <tr>
                <th className="py-3 px-3">Receipt #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Invoice Ref</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">UTR / Ref #</th>
                <th className="py-3 px-3 text-right">Amount Received</th>
                <th className="py-3 px-3">Received By</th>
                <th className="py-3 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No payment collections recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {p.receiptNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{p.paymentDate}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block text-[10.5px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {p.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {p.transactionReference}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700 tabular-nums">
                      {formatCurrency(p.amount, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{p.receivedBy}</td>
                    <td className="py-2.5 px-3 text-slate-500 italic text-[11px]">
                      {p.notes || '-'}
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
