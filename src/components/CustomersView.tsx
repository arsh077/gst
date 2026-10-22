import React, { useState } from 'react';
import { Customer } from '../types';
import { INDIAN_STATES } from '../services/gstCalculationService';
import { Users, Plus, Building, Phone, Mail, MapPin, X, Check } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onSelectCustomerForInvoice: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onAddCustomer,
  onSelectCustomerForInvoice,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    companyName: '',
    type: 'BUSINESS',
    gstin: '',
    address: '',
    city: 'Kolkata',
    state: 'West Bengal',
    stateCode: '19',
    pincode: '',
    email: '',
    phone: '',
  });

  const handleStateChange = (code: string) => {
    const s = INDIAN_STATES.find((st) => st.code === code);
    if (s) {
      setFormData((prev) => ({ ...prev, state: s.name, stateCode: s.code }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name && !formData.companyName) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: formData.name || formData.companyName || '',
      companyName: formData.companyName || formData.name || '',
      type: formData.type || 'BUSINESS',
      gstin: formData.gstin || '',
      address: formData.address || '',
      city: formData.city || 'Kolkata',
      state: formData.state || 'West Bengal',
      stateCode: formData.stateCode || '19',
      pincode: formData.pincode || '',
      email: formData.email || '',
      phone: formData.phone || '',
    };

    onAddCustomer(newCust);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm text-slate-900">Clients & Corporate Customers</h2>
          <p className="text-[11px] text-slate-500">
            Manage legal service clients, verified GSTINs, and billing addresses
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Grid of Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-slate-900 text-xs">
                  {c.companyName || c.name}
                </div>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                  {c.type}
                </span>
              </div>

              {c.gstin ? (
                <div className="mt-1 font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                  GSTIN: {c.gstin}
                </div>
              ) : (
                <div className="mt-1 text-[10px] text-slate-400 italic">Unregistered Client</div>
              )}

              <div className="mt-2.5 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {c.address}, {c.city}, {c.state} – {c.pincode}
                  </span>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-500">
                State: {c.state} ({c.stateCode})
              </span>
              <button
                onClick={() => onSelectCustomerForInvoice(c)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Create Invoice →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Client Record</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 text-xs space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Apex BioTech Solutions Pvt Ltd"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Client GSTIN (Optional)</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="e.g. 19AAACB1234D1ZP"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Billing Address</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Building, street, block..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State & GST Code</label>
                  <select
                    value={formData.stateCode}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-xs"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
