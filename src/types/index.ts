export interface CompanyProfile {
  brandName: string;
  legalEntityName: string;
  cin: string;
  address: string;
  state: string;
  stateCode: string;
  email: string;
  phone: string;
  website: string;
  directors: Array<{ name: string; din: string }>;
  authorisedSignatory: {
    name: string;
    designation: string;
  };
  bankDetails: {
    accountName: string;
    bankName: string;
    branch: string;
    accountNumber: string;
    ifscCode: string;
    isVerified: boolean;
  };
  gstDetails: {
    gstin: string;
    isVerified: boolean;
    pan: string;
    taxType: 'REGULAR' | 'COMPOSITION';
    verifiedDate?: string;
  };
  currencySymbol: '₹' | 'Rs.';
  termsAndConditions: string[];
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  type: 'BUSINESS' | 'INDIVIDUAL';
  gstin?: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  email: string;
  phone: string;
  clientReference?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  code: string;
  sacCode: string;
  category: 'TRADEMARK' | 'COPYRIGHT' | 'PATENT' | 'FSSAI' | 'CORPORATE' | 'GENERAL_LEGAL';
  description: string;
  defaultRate: number;
  unit: string;
  defaultGstRate: number;
}

export interface InvoiceLineItem {
  id: string;
  serviceId?: string;
  description: string;
  detailedScope?: string;
  sacCode: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxableValue: number;
  gstRate: number; // e.g. 18 for 18%
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  lineTotal: number;
}

export type InvoiceStatus = 
  | 'DRAFT'
  | 'AWAITING_APPROVAL'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'AXIS_BANK_TRANSFER' | 'NEFT_RTGS' | 'UPI' | 'CHEQUE' | 'CASH';
  transactionReference: string; // UTR or Ref number
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceTaxSummary {
  taxableSubtotal: number;
  totalDiscount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalGst: number;
  roundOff: number;
  grandTotal: number;
  isIntraState: boolean;
  rateBreakdowns: Array<{
    rate: number;
    taxable: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
  }>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  documentType: 'TAX_INVOICE' | 'DRAFT_INVOICE' | 'PRO_FORMA_INVOICE';
  status: InvoiceStatus;
  
  // Supplier snapshot
  supplier: {
    legalName: string;
    brandName: string;
    cin: string;
    gstin: string;
    isGstinVerified: boolean;
    state: string;
    stateCode: string;
    address: string;
    email: string;
    phone: string;
    directors: Array<{ name: string; din: string }>;
    bankDetails: {
      accountName: string;
      bankName: string;
      branch: string;
      accountNumber: string;
      ifscCode: string;
    };
  };

  // Recipient / Customer
  customer: Customer;

  // Place of supply
  placeOfSupply: string;
  placeOfSupplyCode: string;
  supplyClassification: 'INTRA_STATE' | 'INTER_STATE';

  // Items
  lineItems: InvoiceLineItem[];

  // Math summary
  summary: InvoiceTaxSummary;

  // Payment Tracking
  amountPaid: number;
  balanceDue: number;
  payments: PaymentRecord[];

  amountInWords: string;
  customerNotes?: string;
  terms: string[];
  clientReference?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
