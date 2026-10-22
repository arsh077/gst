import React, { useState } from 'react';
import { CompanyProfile } from '../types';
import { X, Building2, ShieldCheck, CreditCard, Check, AlertTriangle, FileText, Info } from 'lucide-react';

interface CompanyProfileModalProps {
  profile: CompanyProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: CompanyProfile) => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'gst' | 'bank' | 'preferences'>('gst');
  const [formData, setFormData] = useState<CompanyProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Settings & Company Profile</h2>
              <p className="text-[11px] text-slate-400">
                Configure GST details, entity information, and bank accounts for Legal Success India
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('gst')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition ${
              activeTab === 'gst'
                ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GST Details & Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Entity & Directors</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition ${
              activeTab === 'bank'
                ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Bank Settlement</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition ${
              activeTab === 'preferences'
                ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Invoice Format & Currency</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {/* TAB: GST Details */}
          {activeTab === 'gst' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <p className="font-bold">GST Compliance & Document Labelling Rules</p>
                  <p className="text-amber-700 mt-0.5">
                    As per Indian GST statutes and project policy, documents will remain strictly labelled as{' '}
                    <span className="font-bold">DRAFT INVOICE</span> or <span className="font-bold">PRO FORMA INVOICE</span>{' '}
                    until an authorized administrator verifies the actual GSTIN registration. No invoice will be marked as{' '}
                    <span className="font-bold">TAX INVOICE</span> without verified registration details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    GSTIN (Goods and Services Tax Identification Number)
                  </label>
                  <input
                    type="text"
                    value={formData.gstDetails.gstin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gstDetails: { ...formData.gstDetails, gstin: e.target.value.toUpperCase() },
                      })
                    }
                    placeholder="Pending CA Verification (e.g. 19AAACK1234F1Z5)"
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                  <span className="text-[10px] text-slate-500">
                    West Bengal registration code begins with &apos;19&apos;.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Registered Address State</label>
                  <input
                    type="text"
                    disabled
                    value={`${formData.state} (State Code ${formData.stateCode})`}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded text-xs text-slate-600 font-medium"
                  />
                  <span className="text-[10px] text-slate-500">
                    Governs intra-state (CGST+SGST 18%) vs inter-state (IGST 18%) place-of-supply rules.
                  </span>
                </div>
              </div>

              {/* Verification Toggle */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      GSTIN Verified by CA / Authorized Administrator
                    </span>
                    <span className="text-[11px] text-slate-500">
                      When checked, issued documents will automatically be designated as official TAX INVOICE.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.gstDetails.isVerified}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gstDetails: {
                            ...formData.gstDetails,
                            isVerified: e.target.checked,
                            verifiedDate: e.target.checked ? new Date().toISOString() : undefined,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Current Invoicing Mode:</span>
                  {formData.gstDetails.isVerified && formData.gstDetails.gstin ? (
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Official TAX INVOICE Enabled
                    </span>
                  ) : (
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> DRAFT / PRO FORMA Mode
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Company Profile & Directors */}
          {activeTab === 'profile' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Legal Entity Name</label>
                  <input
                    type="text"
                    value={formData.legalEntityName}
                    onChange={(e) => setFormData({ ...formData, legalEntityName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-xs text-blue-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Corporate Identification Number (CIN)</label>
                  <input
                    type="text"
                    value={formData.cin}
                    onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Registered Office Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Directors & Signatories</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="font-bold text-slate-800">Director 1: Azsed Anwar</span>
                    <p className="text-slate-500 font-mono text-[10px]">DIN: 10614233</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="font-bold text-slate-800">Director 2: Arshed Anwar</span>
                    <p className="text-slate-500 font-mono text-[10px]">DIN: 10614234</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Bank Settlement */}
          {activeTab === 'bank' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded p-2.5 text-blue-900 text-[11px]">
                <span className="font-bold">Axis Bank Corporate Current Account</span>
                <p className="text-blue-700 mt-0.5">
                  These verified settlement details are printed on every customer invoice for direct NEFT/RTGS/IMPS payments.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Beneficiary Account Name</label>
                <input
                  type="text"
                  value={formData.bankDetails.accountName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, accountName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankDetails.bankName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Branch</label>
                  <input
                    type="text"
                    value={formData.bankDetails.branch}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, branch: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.bankDetails.ifscCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Invoice Format & Currency */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Currency Symbol Display</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, currencySymbol: '₹' })}
                    className={`p-3 border rounded-lg text-left transition flex items-center justify-between ${
                      formData.currencySymbol === '₹'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-base font-bold text-slate-900">₹ (Indian Rupee Symbol)</span>
                      <p className="text-[10px] text-slate-500 font-normal">Modern standard symbol for on-screen & documents</p>
                    </div>
                    {formData.currencySymbol === '₹' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, currencySymbol: 'Rs.' })}
                    className={`p-3 border rounded-lg text-left transition flex items-center justify-between ${
                      formData.currencySymbol === 'Rs.'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-base font-bold text-slate-900">Rs. (Classic Text Prefix)</span>
                      <p className="text-[10px] text-slate-500 font-normal">Traditional standard text prefix for invoices</p>
                    </div>
                    {formData.currencySymbol === 'Rs.' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Standard Terms & Conditions</span>
                <div className="space-y-1.5">
                  {formData.termsAndConditions.map((t, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={t}
                      onChange={(e) => {
                        const next = [...formData.termsAndConditions];
                        next[idx] = e.target.value;
                        setFormData({ ...formData, termsAndConditions: next });
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded transition shadow-sm"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
