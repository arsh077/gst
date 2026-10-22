import React, { useState } from 'react';
import { Invoice, PaymentRecord } from '../types';
import { formatCurrency } from '../services/gstCalculationService';
import { X, CreditCard, Check, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment: (payment: PaymentRecord) => void;
  currencySymbol?: '₹' | 'Rs.';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onRecordPayment,
  currencySymbol = '₹',
}) => {
  if (!isOpen || !invoice) return null;

  const [amount, setAmount] = useState<number>(invoice.balanceDue);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['paymentMethod']>(
    'AXIS_BANK_TRANSFER'
  );
  const [transactionReference, setTransactionReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      receiptNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      paymentDate,
      amount,
      paymentMethod,
      transactionReference: transactionReference || 'N/A',
      receivedBy: 'Azsed Anwar (Director)',
      notes,
      createdAt: new Date().toISOString(),
    };

    onRecordPayment(newPayment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scaleIn flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Record Payment Settlement</h2>
              <p className="text-[11px] text-slate-400">
                Invoice {invoice.invoiceNumber} • {invoice.customer.companyName || invoice.customer.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 text-xs space-y-3.5">
          {/* Outstanding Balance Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
            <div>
              <span className="text-slate-500 text-[10.5px] block font-medium">Outstanding Balance</span>
              <span className="font-mono text-base font-black text-rose-700">
                {formatCurrency(invoice.balanceDue, currencySymbol)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[10.5px] block font-medium">Total Billed</span>
              <span className="font-mono text-xs font-bold text-slate-800">
                {formatCurrency(invoice.summary.grandTotal, currencySymbol)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Payment Amount ({currencySymbol})
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={invoice.balanceDue}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-sm focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
            {amount < invoice.balanceDue && (
              <span className="text-[10px] text-amber-600 font-medium mt-0.5 block">
                Partial Payment: New balance will be {formatCurrency(invoice.balanceDue - amount, currencySymbol)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white font-medium"
              >
                <option value="AXIS_BANK_TRANSFER">Axis Bank Transfer</option>
                <option value="NEFT_RTGS">NEFT / RTGS / IMPS</option>
                <option value="UPI">UPI / QR Payment</option>
                <option value="CHEQUE">Cheque / Demand Draft</option>
                <option value="CASH">Cash Settlement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              UTR / Transaction Reference Number
            </label>
            <input
              type="text"
              placeholder="e.g. AXIS9832712984 / UTR12345"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Internal Note / Remarks</label>
            <textarea
              rows={2}
              placeholder="Received in Axis Bank New Alipore account..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-medium rounded hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded transition shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
