import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  CreditCard,
  BarChart3,
  Settings,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export type ActiveTabType =
  | 'dashboard'
  | 'invoices'
  | 'customers'
  | 'services'
  | 'payments'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  invoiceCount: number;
  draftCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  invoiceCount,
  draftCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText, count: invoiceCount },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'services', label: 'Services Catalogue', icon: Briefcase },
    { id: 'payments', label: 'Payments & Receipts', icon: CreditCard },
    { id: 'reports', label: 'Reports & Tax', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];

  return (
    <aside className="no-print w-60 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between hidden md:flex">
      <div className="p-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Legal CRM Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTabType)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Info Banner */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 text-[10.5px] space-y-1 text-slate-500">
        <div className="font-semibold text-slate-700">Indian GST Compliant</div>
        <p className="text-[9.5px] leading-tight">
          A4 Print Engine • Multi-state POS • Axis Bank Settlement
        </p>
      </div>
    </aside>
  );
};
