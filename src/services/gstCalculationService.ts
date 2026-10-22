import { InvoiceLineItem, InvoiceTaxSummary } from '../types';

/**
 * Rounds a number safely to 2 decimal places to avoid binary floating-point drift.
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a number in standard Indian numbering format (Lakhs, Crores).
 * e.g., 6500 -> "6,500.00", 17670 -> "17,670.00", 1234567.8 -> "12,34,567.80"
 * Strictly removes any unnatural character spacing or digit separation.
 */
export function formatIndianNumber(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0.00';
  }
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const rounded = round2(absAmount).toFixed(2);
  const [integerPart, decimalPart] = rounded.split('.');

  // Indian numbering regex: last 3 digits, then groups of 2
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}${formattedInt}.${decimalPart}`;
}

/**
 * Formats an amount with the currency symbol.
 * Clean string with NO spaces between digits and NO non-breaking space issues.
 */
export function formatCurrency(amount: number, symbol: '₹' | 'Rs.' = '₹'): string {
  const formatted = formatIndianNumber(amount);
  if (symbol === 'Rs.') {
    return `Rs. ${formatted}`;
  }
  return `₹${formatted}`;
}

/**
 * Calculate line item tax components based on Place of Supply.
 */
export function calculateLineItem(
  item: {
    quantity: number;
    rate: number;
    discount?: number;
    discountType?: 'percentage' | 'fixed';
    gstRate: number;
  },
  supplierStateCode: string = '19',
  placeOfSupplyCode: string = '19'
): {
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  lineTotal: number;
} {
  const qty = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  const gross = round2(qty * rate);

  let discountVal = 0;
  if (item.discount && item.discount > 0) {
    if (item.discountType === 'percentage') {
      discountVal = round2((gross * item.discount) / 100);
    } else {
      discountVal = round2(item.discount);
    }
  }
  const taxableValue = Math.max(0, round2(gross - discountVal));
  const gstRate = Number(item.gstRate) || 0;

  // Determine intra-state vs inter-state
  const isIntraState = supplierStateCode.trim() === placeOfSupplyCode.trim();

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (isIntraState) {
    cgstRate = gstRate / 2;
    sgstRate = gstRate / 2;
    cgstAmount = round2(taxableValue * (cgstRate / 100));
    sgstAmount = round2(taxableValue * (sgstRate / 100));
  } else {
    igstRate = gstRate;
    igstAmount = round2(taxableValue * (igstRate / 100));
  }

  const totalTax = round2(cgstAmount + sgstAmount + igstAmount);
  const lineTotal = round2(taxableValue + totalTax);

  return {
    taxableValue,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalTax,
    lineTotal,
  };
}

/**
 * Calculates complete invoice totals, reconciling subtotal, taxable, CGST, SGST, IGST,
 * total GST, and balance due.
 */
export function calculateInvoiceSummary(
  lineItems: InvoiceLineItem[],
  supplierStateCode: string = '19',
  placeOfSupplyCode: string = '19',
  amountPaid: number = 0
): {
  summary: InvoiceTaxSummary;
  amountPaid: number;
  balanceDue: number;
  amountInWords: string;
} {
  const isIntraState = supplierStateCode.trim() === placeOfSupplyCode.trim();

  let taxableSubtotal = 0;
  let totalDiscount = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  const rateMap = new Map<number, { taxable: number; cgst: number; sgst: number; igst: number; totalTax: number }>();

  lineItems.forEach((item) => {
    taxableSubtotal = round2(taxableSubtotal + item.taxableValue);
    
    // Line discount
    const gross = round2(item.quantity * item.rate);
    const disc = Math.max(0, round2(gross - item.taxableValue));
    totalDiscount = round2(totalDiscount + disc);

    cgstTotal = round2(cgstTotal + item.cgstAmount);
    sgstTotal = round2(sgstTotal + item.sgstAmount);
    igstTotal = round2(igstTotal + item.igstAmount);

    const r = item.gstRate;
    const existing = rateMap.get(r) || { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
    existing.taxable = round2(existing.taxable + item.taxableValue);
    existing.cgst = round2(existing.cgst + item.cgstAmount);
    existing.sgst = round2(existing.sgst + item.sgstAmount);
    existing.igst = round2(existing.igst + item.igstAmount);
    existing.totalTax = round2(existing.cgst + existing.sgst + existing.igst);
    rateMap.set(r, existing);
  });

  const totalGst = round2(cgstTotal + sgstTotal + igstTotal);
  const unroundedTotal = round2(taxableSubtotal + totalGst);
  
  // Clean round-off
  const grandTotal = Math.round(unroundedTotal);
  const roundOff = round2(grandTotal - unroundedTotal);

  const cleanPaid = round2(Math.max(0, amountPaid));
  const balanceDue = round2(Math.max(0, grandTotal - cleanPaid));

  const rateBreakdowns = Array.from(rateMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([rate, vals]) => ({
      rate,
      ...vals,
    }));

  const summary: InvoiceTaxSummary = {
    taxableSubtotal,
    totalDiscount,
    cgstTotal,
    sgstTotal,
    igstTotal,
    totalGst,
    roundOff,
    grandTotal,
    isIntraState,
    rateBreakdowns,
  };

  const amountInWords = convertNumberToIndianWords(grandTotal);

  return {
    summary,
    amountPaid: cleanPaid,
    balanceDue,
    amountInWords,
  };
}

/**
 * Converts a numeric amount to Indian English words.
 * Handles Lakhs, Crores, Thousands, and Paise.
 * e.g., 7670 -> "Rupees Seven Thousand Six Hundred Seventy Only"
 */
export function convertNumberToIndianWords(amount: number): string {
  if (amount === 0) return 'Rupees Zero Only';

  const singleDigits = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return singleDigits[n];
    const t = Math.floor(n / 10);
    const d = n % 10;
    return `${tens[t]}${d ? ' ' + singleDigits[d] : ''}`;
  }

  function convertThreeDigits(n: number): string {
    let str = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h > 0) {
      str += `${singleDigits[h]} Hundred`;
      if (rem > 0) str += ' ';
    }
    if (rem > 0) {
      str += convertTwoDigits(rem);
    }
    return str;
  }

  const absAmount = Math.abs(amount);
  const integerPart = Math.floor(absAmount);
  const paise = Math.round((absAmount - integerPart) * 100);

  let num = integerPart;
  let words = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const remainder = num;

  if (crore > 0) {
    words += `${convertTwoDigits(crore)} Crore `;
  }
  if (lakh > 0) {
    words += `${convertTwoDigits(lakh)} Lakh `;
  }
  if (thousand > 0) {
    words += `${convertTwoDigits(thousand)} Thousand `;
  }
  if (remainder > 0) {
    words += `${convertThreeDigits(remainder)} `;
  }

  words = words.trim();
  let result = `Rupees ${words}`;

  if (paise > 0) {
    result += ` and ${convertTwoDigits(paise)} Paise`;
  }

  result += ' Only';
  return result;
}

/**
 * Comprehensive list of Indian States and Union Territories with standard GST State Codes.
 */
export const INDIAN_STATES: Array<{ code: string; name: string }> = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '28', name: 'Andhra Pradesh' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman and Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh (New)' },
  { code: '38', name: 'Ladakh' },
];
