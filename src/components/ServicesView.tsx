import React from 'react';
import { ServiceItem, CompanyProfile } from '../types';
import { formatCurrency } from '../services/gstCalculationService';
import { Briefcase, Check, Shield, FileCheck } from 'lucide-react';

interface ServicesViewProps {
  services: ServiceItem[];
  companyProfile: CompanyProfile;
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  companyProfile,
  onSelectService,
}) => {
  const currency = companyProfile.currencySymbol;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm text-slate-900">Legal Services & Matters Catalogue</h2>
          <p className="text-[11px] text-slate-500">
            Standard legal advisory rates, SAC code classifications, and GST tax defaults
          </p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md">
          SAC 998213 • Legal Advisory & Representation
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-900 text-xs">{s.name}</span>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                  SAC {s.sacCode}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                {s.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Standard Rate</span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  {formatCurrency(s.defaultRate, currency)}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">/ {s.unit}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Default GST</span>
                <span className="font-semibold text-blue-700 text-xs">{s.defaultGstRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
