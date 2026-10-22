import React from 'react';
import { CompanyProfile } from '../types';
import { Building2, ShieldCheck, AlertTriangle, Plus, Settings, FileText, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  companyProfile: CompanyProfile;
  onOpenSettings: () => void;
  onOpenNewInvoice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  companyProfile,
  onOpenSettings,
  onOpenNewInvoice,
}) => {
  const isGstinVerified = companyProfile.gstDetails.isVerified && !!companyProfile.gstDetails.gstin;

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Entity Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-0.5 shadow-sm overflow-hidden shrink-0">
            <img
              src="/assets/legal_success_logo.png"
              alt="Legal Success India Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">
                {companyProfile.brandName || 'Legal Success India'}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                GST Billing CRM
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[280px] sm:max-w-none">
              {companyProfile.legalEntityName || 'KHALID LEGAL WORKS PRIVATE LIMITED'}
            </p>
          </div>
        </div>

        {/* Center / Status Pill */}
        <div className="hidden md:flex items-center gap-2">
          {isGstinVerified ? (
            <div
              onClick={onOpenSettings}
              className="cursor-pointer flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full text-xs hover:bg-emerald-500/20 transition"
              title="Click to view GST configuration"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tax Invoice Mode: {companyProfile.gstDetails.gstin}</span>
            </div>
          ) : (
            <div
              onClick={onOpenSettings}
              className="cursor-pointer flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-full text-xs hover:bg-amber-500/20 transition"
              title="GSTIN is pending formal verification. Click to configure."
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Pro Forma / Draft Mode (GSTIN Pending Verification)</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
            title="Company Settings & GST Profile"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>
    </header>
  );
};
