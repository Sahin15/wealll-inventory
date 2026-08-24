import React from 'react';
import { formatCurrency } from '../utils/currency';

const InvoicePrint = ({ sale, settings }) => {
  if (!sale || !settings) return null;

  // Calculate Subtotal, Tax, and Grand Total
  // Using the new schema: sellingPrice and total are in item, but discount is in sale
  const subtotal = sale.subtotal || sale.items.reduce((acc, item) => acc + item.total, 0);
  const totalDiscount = sale.discount || 0;
  
  // Tax logic (if taxRate exists, we calculate tax based on subtotal)
  const taxRate = settings.taxRate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = sale.total || (subtotal - totalDiscount + taxAmount);

  return (
    <div className="hidden print:block absolute inset-0 bg-white z-[9999] p-8 text-black font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
        <div>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Business Logo" className="h-24 w-auto max-w-[300px] object-contain mb-4 mix-blend-multiply" />
          ) : (
            <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-wider">INVOICE</h1>
          )}
          {settings.logoUrl && <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wider">INVOICE</h2>}
          <p className="text-sm text-gray-600"><span className="font-semibold">Invoice No:</span> {sale.invoiceNumber}</p>
          <p className="text-sm text-gray-600"><span className="font-semibold">Date:</span> {formatDate(sale.saleDate)}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900">{settings.businessName || 'Your Business Name'}</h2>
          <p className="text-sm text-gray-600 mt-1">{settings.ownerName || ''}</p>
          {settings.businessPhone && <p className="text-sm text-gray-600 mt-1">{settings.businessPhone}</p>}
          {settings.businessAddress && (
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
              {settings.businessAddress}
            </p>
          )}
          {settings.invoiceHeaderText && (
            <p className="text-sm text-gray-800 mt-2 font-medium whitespace-pre-line">
              {settings.invoiceHeaderText}
            </p>
          )}
          {taxRate > 0 && <p className="text-sm text-gray-600 mt-1 font-medium">GST/Tax Rate: {taxRate}%</p>}
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 uppercase border-b border-gray-200 pb-2 mb-3">Bill To</h3>
        <p className="text-base text-gray-800">{sale.customerName || 'Walk-in Customer'}</p>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 font-semibold text-sm text-gray-900 border-b border-gray-300">Description</th>
            <th className="py-3 px-4 font-semibold text-sm text-gray-900 border-b border-gray-300 text-center">Qty</th>
            <th className="py-3 px-4 font-semibold text-sm text-gray-900 border-b border-gray-300 text-right">Unit Price</th>
            <th className="py-3 px-4 font-semibold text-sm text-gray-900 border-b border-gray-300 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, index) => {
            return (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 px-4 text-sm text-gray-800">{item.productId?.name || item.product?.name || 'Unknown Product'}</td>
                <td className="py-3 px-4 text-sm text-gray-800 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-sm text-gray-800 text-right">{formatCurrency(item.sellingPrice)}</td>
                <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">{formatCurrency(item.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-1/2 md:w-1/3">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Subtotal</span>
            <span className="text-sm text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Discount</span>
              <span className="text-sm text-gray-900">-{formatCurrency(totalDiscount)}</span>
            </div>
          )}
          {taxRate > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Tax ({taxRate}%)</span>
              <span className="text-sm text-gray-900">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-b-2 border-gray-800">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p className="italic">{settings.invoiceFooterText || 'Thank you for your business!'}</p>
      </div>
    </div>
  );
};

export default InvoicePrint;
