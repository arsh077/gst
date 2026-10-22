import React, { useState, useEffect } from 'react';
import { Customer, Invoice, InvoiceLineItem, ServiceItem, CompanyProfile } from '../types';
import {
  calculateLineItem,
  calculateInvoiceSummary,
  INDIAN_STATES,
  formatCurrency,
} from '../services/gstCalculationService';
import { X, Plus, Trash2, Eye, Save, Send, Sparkles } from 'lucide-react';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice, shouldPreview?: boolean) => void;
  initialInvoice?: Invoice | null;
  customers: Customer[];
  services: ServiceItem[];
  companyProfile: CompanyProfile;
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialInvoice,
  customers,
  services,
  companyProfile,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialInvoice?.customer.id || customers[0]?.id || ''
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    initialInvoice?.invoiceNumber || `DRAFT-${Math.floor(100 + Math.random() * 900)}`
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(
    initialInvoice?.invoiceDate || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    initialInvoice?.dueDate ||
      new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [placeOfSupplyCode, setPlaceOfSupplyCode] = useState<string>(
    initialInvoice?.placeOfSupplyCode || '19'
  );
  const [amountPaid, setAmountPaid] = useState<number>(initialInvoice?.amountPaid || 0);

  // Line items state
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    initialInvoice?.lineItems || [
      {
        id: '1',
        description: 'Trademark Registration (Single Class) - Professional Legal Advisory',
        detailedScope:
          'Comprehensive trademark search, Vienna classification advisory, preparation of Form TM-A, affidavit drafting, and official filing representation.',
        sacCode: '998213',
        quantity: 1,
        unit: 'application',
        rate: 6500,
        discount: 0,
        discountType: 'fixed',
        gstRate: 18,
        ...calculateLineItem({ quantity: 1, rate: 6500, gstRate: 18 }, '19', '19'),
      },
    ]
  );

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const selectedStateObj =
    INDIAN_STATES.find((s) => s.code === placeOfSupplyCode) || {
      code: '19',
      name: 'West Bengal',
    };

  // Recalculate line items when place of supply changes
  useEffect(() => {
    setLineItems((prev) =>
      prev.map((item) => ({
        ...item,
        ...calculateLineItem(
          {
            quantity: item.quantity,
            rate: item.rate,
            discount: item.discount,
            discountType: item.discountType,
            gstRate: item.gstRate,
          },
          companyProfile.stateCode || '19',
          placeOfSupplyCode
        ),
      }))
    );
  }, [placeOfSupplyCode, companyProfile.stateCode]);

  if (!isOpen) return null;

  // Handle line item field change
  const handleItemChange = (
    index: number,
    field: keyof InvoiceLineItem,
    value: any
  ) => {
    setLineItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: value };

      const calculated = calculateLineItem(
        {
          quantity: Number(target.quantity) || 0,
          rate: Number(target.rate) || 0,
          discount: Number(target.discount) || 0,
          discountType: target.discountType,
          gstRate: Number(target.gstRate) || 0,
        },
        companyProfile.stateCode || '19',
        placeOfSupplyCode
      );

      copy[index] = { ...target, ...calculated };
      return copy;
    });
  };

  // Add line item from service catalogue
  const handleAddService = (serviceId: string) => {
    const s = services.find((srv) => srv.id === serviceId);
    if (!s) return;

    const newItem: InvoiceLineItem = {
      id: String(Date.now()),
      serviceId: s.id,
      description: s.name,
      detailedScope: s.description,
      sacCode: s.sacCode,
      quantity: 1,
      unit: s.unit || 'service',
      rate: s.defaultRate,
      discount: 0,
      discountType: 'fixed',
      gstRate: s.defaultGstRate || 18,
      ...calculateLineItem(
        { quantity: 1, rate: s.defaultRate, gstRate: s.defaultGstRate || 18 },
        companyProfile.stateCode || '19',
        placeOfSupplyCode
      ),
    };

    setLineItems((prev) => [...prev, newItem]);
  };

  const handleAddCustomLine = () => {
    const newItem: InvoiceLineItem = {
      id: String(Date.now()),
      description: 'Legal Consultancy & Advisory Services',
      detailedScope: 'Advisory and document examination.',
      sacCode: '998213',
      quantity: 1,
      unit: 'service',
      rate: 5000,
      discount: 0,
      discountType: 'fixed',
      gstRate: 18,
      ...calculateLineItem(
        { quantity: 1, rate: 5000, gstRate: 18 },
        companyProfile.stateCode || '19',
        placeOfSupplyCode
      ),
    };
    setLineItems((prev) => [...prev, newItem]);
  };

  const handleRemoveLine = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Compute overall summary
  const { summary, balanceDue, amountInWords } = calculateInvoiceSummary(
    lineItems,
    companyProfile.stateCode || '19',
    placeOfSupplyCode,
    amountPaid
  );

  const isIntraState = companyProfile.stateCode === placeOfSupplyCode;

  const buildInvoiceObject = (status: Invoice['status']): Invoice => {
    const isGstinVerified =
      companyProfile.gstDetails.isVerified && !!companyProfile.gstDetails.gstin;
    const documentType = isGstinVerified ? 'TAX_INVOICE' : 'DRAFT_INVOICE';

    return {
      id: initialInvoice?.id || `inv-${Date.now()}`,
      invoiceNumber,
      invoiceDate,
      dueDate,
      documentType,
      status,
      supplier: {
        legalName: companyProfile.legalEntityName,
        brandName: companyProfile.brandName,
        cin: companyProfile.cin,
        gstin: companyProfile.gstDetails.gstin,
        isGstinVerified: companyProfile.gstDetails.isVerified,
        state: companyProfile.state,
        stateCode: companyProfile.stateCode,
        address: companyProfile.address,
        email: companyProfile.email,
        phone: companyProfile.phone,
        directors: companyProfile.directors,
        bankDetails: {
          accountName: companyProfile.bankDetails.accountName,
          bankName: companyProfile.bankDetails.bankName,
          branch: companyProfile.bankDetails.branch,
          accountNumber: companyProfile.bankDetails.accountNumber,
          ifscCode: companyProfile.bankDetails.ifscCode,
        },
      },
      customer: selectedCustomer,
      placeOfSupply: selectedStateObj.name,
      placeOfSupplyCode: selectedStateObj.code,
      supplyClassification: isIntraState ? 'INTRA_STATE' : 'INTER_STATE',
      lineItems,
      summary,
      amountPaid,
      balanceDue,
      amountInWords,
      terms: companyProfile.termsAndConditions,
      createdBy: 'Azsed Anwar',
      createdAt: initialInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payments: initialInvoice?.payments || [],
    };
  };

  const handleSaveDraft = () => {
    const inv = buildInvoiceObject('DRAFT');
    onSave(inv, false);
    onClose();
  };

  const handleIssueInvoice = () => {
    const inv = buildInvoiceObject('ISSUED');
    onSave(inv, true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-scaleIn flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-tight">
              {initialInvoice ? `Edit Invoice: ${initialInvoice.invoiceNumber}` : 'Create New GST / Service Invoice'}
            </h2>
            <p className="text-[11px] text-slate-400">
              Tax rates, SAC classification, and Place of Supply rules will be applied automatically
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {/* Top Grid: Customer & Meta */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            {/* Customer Select */}
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Client / Recipient</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  const cust = customers.find((c) => c.id === e.target.value);
                  if (cust?.stateCode) {
                    setPlaceOfSupplyCode(cust.stateCode);
                  }
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-xs bg-white"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.name} {c.gstin ? `(${c.gstin})` : '(Unregistered)'}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state}
              </p>
            </div>

            {/* Invoice Number */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-xs"
              />
            </div>

            {/* Place of Supply */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Place of Supply</label>
              <select
                value={placeOfSupplyCode}
                onChange={(e) => setPlaceOfSupplyCode(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-xs bg-white"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              <p className="text-[10px] font-semibold text-blue-700 mt-1">
                {isIntraState ? 'Intra-State: CGST (9%) + SGST (9%)' : 'Inter-State: IGST (18%)'}
              </p>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between p-2 bg-white rounded border border-slate-200">
              <span className="text-slate-600 font-medium">Quick Service Presets:</span>
              <div className="flex gap-1.5">
                {services.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleAddService(s.id)}
                    className="text-[10.5px] px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded font-medium border border-slate-200 transition"
                  >
                    + {s.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-900 text-xs">Service Line Items</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddCustomLine}
                  className="flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 text-white text-[10px]">
                  <tr>
                    <th className="py-2 px-2.5 w-[38%]">Matter / Description</th>
                    <th className="py-2 px-2 w-[10%] text-center">SAC</th>
                    <th className="py-2 px-2 w-[10%] text-center">Qty</th>
                    <th className="py-2 px-2 w-[14%] text-right">Rate (₹)</th>
                    <th className="py-2 px-2 w-[10%] text-right">Disc. (₹)</th>
                    <th className="py-2 px-2 w-[8%] text-center">GST %</th>
                    <th className="py-2 px-2 w-[15%] text-right">Total (₹)</th>
                    <th className="py-2 px-1 text-center w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="p-2 space-y-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded font-semibold text-xs"
                          placeholder="Service title"
                        />
                        <textarea
                          rows={2}
                          value={item.detailedScope || ''}
                          onChange={(e) => handleItemChange(idx, 'detailedScope', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-[10px] text-slate-600"
                          placeholder="Detailed legal scope / filing breakdown"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="text"
                          value={item.sacCode}
                          onChange={(e) => handleItemChange(idx, 'sacCode', e.target.value)}
                          className="w-16 px-1.5 py-1 border border-slate-300 rounded text-center font-mono text-xs"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                          className="w-14 px-1.5 py-1 border border-slate-300 rounded text-center text-xs"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', Math.max(0, Number(e.target.value)))}
                          className="w-24 px-1.5 py-1 border border-slate-300 rounded text-right font-mono text-xs font-semibold"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.discount}
                          onChange={(e) => handleItemChange(idx, 'discount', Math.max(0, Number(e.target.value)))}
                          className="w-16 px-1.5 py-1 border border-slate-300 rounded text-right font-mono text-xs text-rose-600"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleItemChange(idx, 'gstRate', Number(e.target.value))}
                          className="px-1.5 py-1 border border-slate-300 rounded text-xs bg-white font-medium"
                        >
                          <option value={18}>18%</option>
                          <option value={12}>12%</option>
                          <option value={5}>5%</option>
                          <option value={0}>0%</option>
                        </select>
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(item.lineTotal, companyProfile.currencySymbol)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          disabled={lineItems.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Totals & Payment Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Payment & Notes */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-xs">Payment Settlement</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={summary.grandTotal}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-semibold text-emerald-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Remaining Balance (₹)</label>
                  <input
                    type="text"
                    disabled
                    value={formatCurrency(balanceDue, companyProfile.currencySymbol)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-slate-100 rounded font-mono font-bold text-rose-700 text-xs"
                  />
                </div>
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Amount in Words: </span>
                <span className="italic text-slate-800">{amountInWords}</span>
              </div>
            </div>

            {/* Calculations Summary Card */}
            <div className="bg-slate-900 text-white p-3.5 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Taxable Subtotal:</span>
                <span className="font-mono text-white font-semibold">
                  {formatCurrency(summary.taxableSubtotal, companyProfile.currencySymbol)}
                </span>
              </div>

              {isIntraState ? (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>Central GST (CGST @ 9%):</span>
                    <span className="font-mono text-white">
                      {formatCurrency(summary.cgstTotal, companyProfile.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>State GST (SGST @ 9%):</span>
                    <span className="font-mono text-white">
                      {formatCurrency(summary.sgstTotal, companyProfile.currencySymbol)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-400">
                  <span>Integrated GST (IGST @ 18%):</span>
                  <span className="font-mono text-white">
                    {formatCurrency(summary.igstTotal, companyProfile.currencySymbol)}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-sm">
                <span>Grand Total:</span>
                <span className="font-mono text-base font-black text-emerald-400">
                  {formatCurrency(summary.grandTotal, companyProfile.currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded transition"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={handleIssueInvoice}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded transition shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Issue & Preview Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
