import React, { useState, useEffect } from 'react';
import { CompanyProfile, Customer, ServiceItem, Invoice, PaymentRecord } from './types';
import {
  calculateLineItem,
  calculateInvoiceSummary,
} from './services/gstCalculationService';
import { generateInvoicePDF } from './services/pdfGenerator';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InvoicesListView } from './components/InvoicesListView';
import { CustomersView } from './components/CustomersView';
import { ServicesView } from './components/ServicesView';
import { PaymentsView } from './components/PaymentsView';
import { ReportsView } from './components/ReportsView';
import { InvoicePreviewModal } from './components/InvoicePreviewModal';
import { InvoiceFormModal } from './components/InvoiceFormModal';
import { PaymentModal } from './components/PaymentModal';
import { CompanyProfileModal } from './components/CompanyProfileModal';

// Initial Company Profile (Exact details requested by user)
const INITIAL_COMPANY_PROFILE: CompanyProfile = {
  brandName: 'Legal Success India',
  legalEntityName: 'KHALID LEGAL WORKS PRIVATE LIMITED',
  cin: 'U70200WB2024PTC270336',
  address: '22/1 Mominpore Road, Kolkata, West Bengal – 700023, India',
  state: 'West Bengal',
  stateCode: '19',
  email: 'info@legalsuccessindia.com',
  phone: '+91 6290634766',
  website: 'https://legalsuccessindia.com',
  directors: [
    { name: 'Azsed Anwar', din: '10614233' },
    { name: 'Arshed Anwar', din: '10614234' },
  ],
  authorisedSignatory: {
    name: 'Azsed Anwar',
    designation: 'Director',
  },
  bankDetails: {
    accountName: 'KHALID LEGAL WORKS PRIVATE LIMITED',
    bankName: 'Axis Bank, subject to verification against bank records',
    branch: 'New Alipore, Kolkata, West Bengal',
    accountNumber: '924020042522662',
    ifscCode: 'UTIB0000351',
    isVerified: true,
  },
  gstDetails: {
    gstin: '', // Unverified as instructed; do not invent
    isVerified: false,
    pan: 'As Applicable',
    taxType: 'REGULAR',
  },
  currencySymbol: '₹',
  termsAndConditions: [
    '1. Payment is due within the stipulated credit terms.',
    '2. In case of delayed payment beyond due date, interest @ 18% p.a. may be charged.',
    '3. Official government statutory fees paid to regulatory bodies (IP India / MCA / FSSAI) are non-refundable.',
    '4. Disputes subject to Kolkata jurisdiction only.',
  ],
};

// Initial Customers
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c-1',
    name: 'Bengal BioTech Solutions Private Limited',
    companyName: 'Bengal BioTech Solutions Private Limited',
    type: 'BUSINESS',
    gstin: '19AAACB1234D1ZP',
    address: 'Sector V, Salt Lake City, Electronics Complex',
    city: 'Kolkata',
    state: 'West Bengal',
    stateCode: '19',
    pincode: '700091',
    email: 'finance@bengalbiotech.in',
    phone: '+91 98301 22334',
    clientReference: 'BBS-LEGAL-2026',
  },
  {
    id: 'c-2',
    name: 'Apex Innovations Labs LLP',
    companyName: 'Apex Innovations Labs LLP',
    type: 'BUSINESS',
    gstin: '27AABCA4321E1Z3',
    address: 'Bandra Kurla Complex, Bandra East',
    city: 'Mumbai',
    state: 'Maharashtra',
    stateCode: '27',
    pincode: '400051',
    email: 'accounts@apexinnovations.in',
    phone: '+91 98200 45678',
    clientReference: 'APEX-IP-99',
  },
  {
    id: 'c-3',
    name: 'Calcutta Sweets & Confectionery Private Limited',
    companyName: 'Calcutta Sweets & Confectionery Private Limited',
    type: 'BUSINESS',
    gstin: '19AABCC9988D1Z2',
    address: '44 Park Street',
    city: 'Kolkata',
    state: 'West Bengal',
    stateCode: '19',
    pincode: '700016',
    email: 'billing@calcuttasweets.com',
    phone: '+91 98311 88990',
  },
];

// Initial Service Catalogue
const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Trademark Registration (Single Class) - Professional Legal Advisory',
    code: 'TM-REG-01',
    sacCode: '998213',
    category: 'TRADEMARK',
    description:
      'Comprehensive trademark search, Vienna classification advisory, preparation of Form TM-A, affidavit drafting, and official filing representation.',
    defaultRate: 6500,
    unit: 'application',
    defaultGstRate: 18,
  },
  {
    id: 'srv-2',
    name: 'Copyright Registration (Literary / Artistic Work)',
    code: 'CR-REG-01',
    sacCode: '998213',
    category: 'COPYRIGHT',
    description:
      'Preparation of Form XIV, Statement of Particulars, Statement of Further Particulars, NOC drafting, and submission to the Copyright Office.',
    defaultRate: 8500,
    unit: 'work',
    defaultGstRate: 18,
  },
  {
    id: 'srv-3',
    name: 'FSSAI State / Central Food Business License Filing',
    code: 'FSSAI-01',
    sacCode: '998213',
    category: 'FSSAI',
    description:
      'Preparation of Food Safety Management System (FSMS) plan, layout blueprint, water test review, and submission on FoSCoS portal.',
    defaultRate: 5000,
    unit: 'license',
    defaultGstRate: 18,
  },
  {
    id: 'srv-4',
    name: 'Patent Search & Prior Art Examination Advisory',
    code: 'PAT-01',
    sacCode: '998213',
    category: 'PATENT',
    description:
      'Patentability opinion, prior art search across global patent databases, and drafting provisional/complete specification claims.',
    defaultRate: 12000,
    unit: 'invention',
    defaultGstRate: 18,
  },
  {
    id: 'srv-5',
    name: 'Private Limited Company Incorporation Advisory',
    code: 'CORP-01',
    sacCode: '998213',
    category: 'CORPORATE',
    description:
      'SPICe+ Part A & B filings, name reservation, MOA & AOA drafting, director DIN & DSC assistance, and Certificate of Incorporation issuance.',
    defaultRate: 9500,
    unit: 'entity',
    defaultGstRate: 18,
  },
];

export default function App() {
  // Persistence state
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('ls_company_profile');
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_PROFILE;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('ls_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [services] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('ls_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  // Seed Invoice: DRAFT-247 matching user requirement exactly
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('ls_invoices');
    if (saved) return JSON.parse(saved);

    // Initial draft matching DRAFT-247
    const line1 = {
      id: 'l-1',
      description: 'Trademark Registration (Single Class) - Professional Legal Advisory',
      detailedScope:
        'Comprehensive trademark search, Vienna classification advisory, preparation of Form TM-A, affidavit drafting, and official filing representation.',
      sacCode: '998213',
      quantity: 1,
      unit: 'application',
      rate: 6500,
      discount: 0,
      discountType: 'fixed' as const,
      gstRate: 18,
      ...calculateLineItem({ quantity: 1, rate: 6500, gstRate: 18 }, '19', '19'),
    };

    const { summary, balanceDue, amountInWords } = calculateInvoiceSummary(
      [line1],
      '19',
      '19',
      0
    );

    const initialDraft247: Invoice = {
      id: 'inv-247',
      invoiceNumber: 'DRAFT-247',
      invoiceDate: '2026-10-21',
      dueDate: '2026-11-05',
      documentType: 'DRAFT_INVOICE',
      status: 'DRAFT',
      supplier: {
        legalName: INITIAL_COMPANY_PROFILE.legalEntityName,
        brandName: INITIAL_COMPANY_PROFILE.brandName,
        cin: INITIAL_COMPANY_PROFILE.cin,
        gstin: INITIAL_COMPANY_PROFILE.gstDetails.gstin,
        isGstinVerified: INITIAL_COMPANY_PROFILE.gstDetails.isVerified,
        state: INITIAL_COMPANY_PROFILE.state,
        stateCode: INITIAL_COMPANY_PROFILE.stateCode,
        address: INITIAL_COMPANY_PROFILE.address,
        email: INITIAL_COMPANY_PROFILE.email,
        phone: INITIAL_COMPANY_PROFILE.phone,
        directors: INITIAL_COMPANY_PROFILE.directors,
        bankDetails: INITIAL_COMPANY_PROFILE.bankDetails,
      },
      customer: INITIAL_CUSTOMERS[0],
      placeOfSupply: 'West Bengal',
      placeOfSupplyCode: '19',
      supplyClassification: 'INTRA_STATE',
      lineItems: [line1],
      summary,
      amountPaid: 0,
      balanceDue,
      amountInWords,
      terms: INITIAL_COMPANY_PROFILE.termsAndConditions,
      clientReference: 'BBS-LEGAL-2026',
      createdBy: 'Azsed Anwar',
      createdAt: '2026-10-21T09:30:00Z',
      updatedAt: '2026-10-21T09:30:00Z',
      payments: [],
    };

    // Second test invoice: Inter-state with partial payment (PRD Acceptance test P0-11)
    const line2 = {
      id: 'l-2',
      description: 'Copyright Registration (Literary / Artistic Work)',
      detailedScope: 'Preparation of Form XIV, NOC drafting, and filing representation.',
      sacCode: '998213',
      quantity: 1,
      unit: 'work',
      rate: 10000,
      discount: 0,
      discountType: 'fixed' as const,
      gstRate: 18,
      ...calculateLineItem({ quantity: 1, rate: 10000, gstRate: 18 }, '19', '27'), // 27 = MH (Inter-state)
    };

    const math2 = calculateInvoiceSummary([line2], '19', '27', 4000);

    const invoice248: Invoice = {
      id: 'inv-248',
      invoiceNumber: 'DRAFT-248',
      invoiceDate: '2026-10-20',
      dueDate: '2026-11-04',
      documentType: 'DRAFT_INVOICE',
      status: 'PARTIALLY_PAID',
      supplier: {
        legalName: INITIAL_COMPANY_PROFILE.legalEntityName,
        brandName: INITIAL_COMPANY_PROFILE.brandName,
        cin: INITIAL_COMPANY_PROFILE.cin,
        gstin: INITIAL_COMPANY_PROFILE.gstDetails.gstin,
        isGstinVerified: INITIAL_COMPANY_PROFILE.gstDetails.isVerified,
        state: INITIAL_COMPANY_PROFILE.state,
        stateCode: INITIAL_COMPANY_PROFILE.stateCode,
        address: INITIAL_COMPANY_PROFILE.address,
        email: INITIAL_COMPANY_PROFILE.email,
        phone: INITIAL_COMPANY_PROFILE.phone,
        directors: INITIAL_COMPANY_PROFILE.directors,
        bankDetails: INITIAL_COMPANY_PROFILE.bankDetails,
      },
      customer: INITIAL_CUSTOMERS[1],
      placeOfSupply: 'Maharashtra',
      placeOfSupplyCode: '27',
      supplyClassification: 'INTER_STATE',
      lineItems: [line2],
      summary: math2.summary,
      amountPaid: 4000,
      balanceDue: math2.balanceDue,
      amountInWords: math2.amountInWords,
      terms: INITIAL_COMPANY_PROFILE.termsAndConditions,
      createdBy: 'Azsed Anwar',
      createdAt: '2026-10-20T11:00:00Z',
      updatedAt: '2026-10-20T11:00:00Z',
      payments: [
        {
          id: 'pay-seed-1',
          receiptNumber: 'REC-1001',
          invoiceId: 'inv-248',
          invoiceNumber: 'DRAFT-248',
          paymentDate: '2026-10-20',
          amount: 4000,
          paymentMethod: 'AXIS_BANK_TRANSFER',
          transactionReference: 'AXIS98217349182',
          receivedBy: 'Azsed Anwar',
          notes: 'Advance retainer fee',
          createdAt: '2026-10-20T12:00:00Z',
        },
      ],
    };

    return [initialDraft247, invoice248];
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const list: PaymentRecord[] = [];
    invoices.forEach((inv) => {
      if (inv.payments && inv.payments.length > 0) {
        list.push(...inv.payments);
      }
    });
    return list;
  });

  // UI Navigation & Modals state
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<Invoice | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [targetInvoiceForPayment, setTargetInvoiceForPayment] = useState<Invoice | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ls_company_profile', JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem('ls_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('ls_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Handlers
  const handleOpenPreview = (inv: Invoice) => {
    setSelectedInvoiceForPreview(inv);
    setIsPreviewOpen(true);
  };

  const handleDownloadPDF = (inv: Invoice) => {
    const doc = generateInvoicePDF(inv, {
      currencyFormat: companyProfile.currencySymbol,
    });
    doc.save(`${inv.invoiceNumber}_${inv.supplier.legalName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleOpenNewInvoice = () => {
    setEditingInvoice(null);
    setIsFormOpen(true);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setIsFormOpen(true);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveInvoice = (savedInvoice: Invoice, shouldPreview: boolean = false) => {
    setInvoices((prev) => {
      const exists = prev.some((i) => i.id === savedInvoice.id);
      if (exists) {
        return prev.map((i) => (i.id === savedInvoice.id ? savedInvoice : i));
      }
      return [savedInvoice, ...prev];
    });

    if (shouldPreview) {
      setSelectedInvoiceForPreview(savedInvoice);
      setIsPreviewOpen(true);
    }
  };

  const handleOpenPayment = (inv: Invoice) => {
    setTargetInvoiceForPayment(inv);
    setIsPaymentOpen(true);
  };

  const handleRecordPayment = (payment: PaymentRecord) => {
    setPayments((prev) => [payment, ...prev]);

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== payment.invoiceId) return inv;

        const newPaid = inv.amountPaid + payment.amount;
        const newBalance = Math.max(0, inv.summary.grandTotal - newPaid);
        const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

        return {
          ...inv,
          amountPaid: newPaid,
          balanceDue: newBalance,
          status: newStatus,
          payments: [payment, ...(inv.payments || [])],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleSaveCompanyProfile = (updated: CompanyProfile) => {
    setCompanyProfile(updated);

    // Update all invoices' supplier snapshot and document types
    const isVerified = updated.gstDetails.isVerified && !!updated.gstDetails.gstin;
    setInvoices((prev) =>
      prev.map((inv) => ({
        ...inv,
        documentType: isVerified ? 'TAX_INVOICE' : 'DRAFT_INVOICE',
        supplier: {
          legalName: updated.legalEntityName,
          brandName: updated.brandName,
          cin: updated.cin,
          gstin: updated.gstDetails.gstin,
          isGstinVerified: updated.gstDetails.isVerified,
          state: updated.state,
          stateCode: updated.stateCode,
          address: updated.address,
          email: updated.email,
          phone: updated.phone,
          directors: updated.directors,
          bankDetails: updated.bankDetails,
        },
      }))
    );
  };

  const handleAddCustomer = (c: Customer) => {
    setCustomers((prev) => [c, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Global Top Navbar */}
      <Navbar
        companyProfile={companyProfile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewInvoice={handleOpenNewInvoice}
      />

      {/* Main Shell */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'settings') {
              setIsSettingsOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          invoiceCount={invoices.length}
          draftCount={invoices.filter((i) => i.status === 'DRAFT').length}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              invoices={invoices}
              companyProfile={companyProfile}
              onOpenNewInvoice={handleOpenNewInvoice}
              onPreviewInvoice={handleOpenPreview}
              onDownloadPDF={handleDownloadPDF}
              onRecordPayment={handleOpenPayment}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesListView
              invoices={invoices}
              companyProfile={companyProfile}
              onOpenNewInvoice={handleOpenNewInvoice}
              onPreviewInvoice={handleOpenPreview}
              onDownloadPDF={handleDownloadPDF}
              onRecordPayment={handleOpenPayment}
              onEditInvoice={handleEditInvoice}
              onDeleteInvoice={handleDeleteInvoice}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onSelectCustomerForInvoice={(cust) => {
                setEditingInvoice(null);
                setIsFormOpen(true);
              }}
            />
          )}

          {activeTab === 'services' && (
            <ServicesView
              services={services}
              companyProfile={companyProfile}
              onSelectService={(srv) => {
                setEditingInvoice(null);
                setIsFormOpen(true);
              }}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              companyProfile={companyProfile}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              invoices={invoices}
              companyProfile={companyProfile}
            />
          )}
        </main>
      </div>

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        invoice={selectedInvoiceForPreview}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onEdit={(inv) => {
          setIsPreviewOpen(false);
          handleEditInvoice(inv);
        }}
        onRecordPayment={(inv) => {
          setIsPreviewOpen(false);
          handleOpenPayment(inv);
        }}
        currencySymbol={companyProfile.currencySymbol}
      />

      {/* Invoice Form Modal */}
      <InvoiceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveInvoice}
        initialInvoice={editingInvoice}
        customers={customers}
        services={services}
        companyProfile={companyProfile}
      />

      {/* Record Payment Modal */}
      <PaymentModal
        invoice={targetInvoiceForPayment}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onRecordPayment={handleRecordPayment}
        currencySymbol={companyProfile.currencySymbol}
      />

      {/* Company Profile & Settings Modal */}
      <CompanyProfileModal
        profile={companyProfile}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveCompanyProfile}
      />
    </div>
  );
}
