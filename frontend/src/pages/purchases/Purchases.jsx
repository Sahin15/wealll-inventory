import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Search, 
  FileText, 
  AlertCircle, 
  TrendingDown, 
  Eye, 
  Trash2, 
  Receipt, 
  Calendar, 
  PackagePlus,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';
import AdaptiveSheet from '../../components/mobile/AdaptiveSheet';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Void State
  const [voidModalPurchase, setVoidModalPurchase] = useState(null);
  const [viewModalPurchase, setViewModalPurchase] = useState(null);
  const [voidReason, setVoidReason] = useState('');

  // Modal Form State for New Purchase
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierName: '',
    purchaseDate: new Date().toISOString().substring(0, 10),
    notes: '',
    items: []
  });

  // Filter States
  const [filterMonth, setFilterMonth] = useState(''); // format: YYYY-MM
  const [filterProductName, setFilterProductName] = useState('');
  const [filterInvoiceNumber, setFilterInvoiceNumber] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purchRes, prodRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/products')
      ]);
      setPurchases(purchRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load purchases data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set default month to current month
    const today = new Date();
    setFilterMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  }, []);

  // Reset pagination when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterMonth, filterProductName, filterInvoiceNumber]);

  // Initialize a clean new purchase modal form without preselecting any product
  const handleOpenPurchaseModal = () => {
    setFormData({
      invoiceNumber: '',
      supplierName: '',
      purchaseDate: new Date().toISOString().substring(0, 10),
      notes: '',
      items: [
        {
          productId: '',
          quantity: 1,
          unitCost: ''
        }
      ]
    });
    setShowPurchaseModal(true);
  };

  // Add another product row in the purchase modal
  const handleAddItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          quantity: 1,
          unitCost: ''
        }
      ]
    }));
  };

  // Remove a product row
  const handleRemoveItemRow = (index) => {
    if (formData.items.length <= 1) {
      toast.error('At least one item is required in the purchase');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update a field in a specific item row
  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const targetItem = { ...newItems[index] };

      if (field === 'productId') {
        targetItem.productId = value;
        const selectedProd = products.find(p => p._id === value);
        if (selectedProd) {
          targetItem.unitCost = selectedProd.purchasePrice || 0;
        } else {
          targetItem.unitCost = '';
        }
      } else if (field === 'quantity') {
        targetItem.quantity = Math.max(1, Number(value) || 1);
      } else if (field === 'unitCost') {
        targetItem.unitCost = value === '' ? '' : Math.max(0, Number(value) || 0);
      }

      newItems[index] = targetItem;
      return { ...prev, items: newItems };
    });
  };

  // Calculate totals for modal form
  const modalCalculations = () => {
    let grandTotal = 0;
    let totalUnits = 0;
    const computedItems = formData.items.map(item => {
      const qty = Number(item.quantity) || 0;
      const cost = Number(item.unitCost) || 0;
      const itemTotal = qty * cost;
      grandTotal += itemTotal;
      totalUnits += qty;
      return {
        ...item,
        quantity: qty,
        unitCost: cost,
        total: itemTotal
      };
    });
    return { computedItems, grandTotal, totalUnits };
  };

  const handleCreatePurchase = async (e) => {
    e.preventDefault();

    if (!formData.invoiceNumber.trim()) {
      return toast.error('Please enter an Invoice Number');
    }
    if (!formData.supplierName.trim()) {
      return toast.error('Please enter a Supplier Name');
    }
    if (formData.items.length === 0) {
      return toast.error('Please add at least one product item');
    }

    // Validate items
    for (let i = 0; i < formData.items.length; i++) {
      const itm = formData.items[i];
      if (!itm.productId) {
        return toast.error(`Item #${i + 1}: Please select a product`);
      }
      if (!itm.quantity || itm.quantity < 1) {
        return toast.error(`Item #${i + 1}: Quantity must be at least 1`);
      }
    }

    const { computedItems, grandTotal } = modalCalculations();

    setSubmitting(true);
    try {
      const payload = {
        invoiceNumber: formData.invoiceNumber.trim(),
        supplierName: formData.supplierName.trim(),
        purchaseDate: formData.purchaseDate || new Date(),
        subtotal: grandTotal,
        discount: 0,
        total: grandTotal,
        notes: formData.notes,
        items: computedItems
      };

      await api.post('/purchases', payload);
      
      setShowPurchaseModal(false);
      fetchData();
      toast.success('Purchase recorded and stock updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoid = async (e) => {
    e.preventDefault();
    if (!voidReason.trim()) return toast.error('Void reason is required');
    try {
      await api.post(`/purchases/${voidModalPurchase._id}/void`, { voidReason });
      setVoidModalPurchase(null);
      setVoidReason('');
      fetchData();
      toast.success('Purchase voided successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to void purchase');
    }
  };

  // Filtering Logic
  const filteredPurchases = purchases.filter(p => {
    // Month Filter
    if (filterMonth) {
      const pMonth = new Date(p.purchaseDate).toISOString().substring(0, 7);
      if (pMonth !== filterMonth) return false;
    }
    // Invoice Filter
    if (filterInvoiceNumber && !p.invoiceNumber.toLowerCase().includes(filterInvoiceNumber.toLowerCase())) {
      return false;
    }
    // Product Filter
    if (filterProductName) {
      const hasProduct = p.items.some(item => {
        const prodName = item.productId?.name || item.product?.name || '';
        return prodName.toLowerCase().includes(filterProductName.toLowerCase());
      });
      if (!hasProduct) return false;
    }
    return true;
  });

  // Calculate Monthly Summary based on selected month (or current month if none)
  const summaryMonth = filterMonth || new Date().toISOString().substring(0, 7);
  const monthlyTotal = purchases.reduce((acc, p) => {
    if (p.status === 'VOIDED') return acc;
    const pMonth = new Date(p.purchaseDate).toISOString().substring(0, 7);
    if (pMonth === summaryMonth) {
      return acc + (p.total || 0);
    }
    return acc;
  }, 0);

  const displayMonthName = new Date(summaryMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

  // Pagination Calculations
  const totalFiltered = filteredPurchases.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex);

  const { grandTotal: formGrandTotal, totalUnits: formTotalUnits } = modalCalculations();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 flex items-center gap-2">
            <Receipt className="text-indigo-600" size={26} />
            Purchases
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage supplier purchase invoices and record incoming stock.
          </p>
        </div>
        <button 
          onClick={handleOpenPurchaseModal} 
          className="btn-primary inline-flex items-center justify-center gap-2 shadow-sm py-2.5 px-4 font-semibold text-sm"
        >
          <Plus size={18} />
          <span>Record New Purchase</span>
        </button>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={handleOpenPurchaseModal}
        className="sm:hidden fixed bottom-20 right-4 z-40 bg-indigo-600 text-white rounded-full p-4 shadow-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[56px] min-w-[56px] flex items-center justify-center"
        title="Record New Purchase"
      >
        <Plus size={24} />
      </button>

      {/* Monthly Summary & Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Summary Card */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-5 flex items-center col-span-1 lg:col-span-1 border-l-4 border-indigo-600">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 mr-4">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Purchases</p>
            <p className="text-xs text-gray-400 mb-1">{displayMonthName}</p>
            <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(monthlyTotal)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 col-span-1 lg:col-span-3 flex flex-col md:flex-row gap-3 items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <Calendar size={13} className="text-gray-400" /> Filter by Month
            </label>
            <input 
              type="month" 
              value={filterMonth} 
              onChange={e => setFilterMonth(e.target.value)} 
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" 
            />
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <Search size={13} className="text-gray-400" /> Search Product
            </label>
            <input 
              type="text" 
              value={filterProductName} 
              onChange={e => setFilterProductName(e.target.value)} 
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" 
            />
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <Search size={13} className="text-gray-400" /> Search Invoice
            </label>
            <input 
              type="text" 
              value={filterInvoiceNumber} 
              onChange={e => setFilterInvoiceNumber(e.target.value)} 
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition" 
            />
          </div>
          {(filterMonth || filterProductName || filterInvoiceNumber) && (
            <div className="w-full md:w-auto">
              <button 
                onClick={() => { setFilterMonth(''); setFilterProductName(''); setFilterInvoiceNumber(''); }}
                className="w-full md:w-auto px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors whitespace-nowrap"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Purchases List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading purchases...</div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <FileText className="text-gray-400" size={24} />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No purchases found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              Try adjusting your search criteria or click "Record New Purchase" to log a supplier invoice.
            </p>
            <button 
              onClick={handleOpenPurchaseModal} 
              className="mt-4 btn-primary inline-flex items-center gap-2 text-xs py-2 px-3.5"
            >
              <Plus size={15} />
              <span>Record New Purchase</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Purchased Items</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedPurchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                        {formatDate(purchase.purchaseDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                        {purchase.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                        {purchase.supplierName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-col gap-1.5 max-w-xs">
                          {purchase.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex-shrink-0">
                                {item.quantity} {item.productId?.unit || 'pcs'}
                              </span>
                              <span className="text-gray-800 font-medium truncate max-w-[200px]" title={item.productId?.name || item.product?.name}>
                                {item.productId?.name || item.product?.name || 'Unknown Product'}
                              </span>
                            </div>
                          ))}
                          {purchase.items.length > 3 && (
                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50/70 border border-indigo-100/80 px-2 py-0.5 rounded-md w-fit">
                              +{purchase.items.length - 3} more items
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-gray-900">
                        {formatCurrency(purchase.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          purchase.status === 'VOIDED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {purchase.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewModalPurchase(purchase)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="View invoice details"
                          >
                            <Eye size={17} />
                          </button>
                          {purchase.status !== 'VOIDED' && (
                            <button
                              onClick={() => setVoidModalPurchase(purchase)}
                              className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-rose-100 transition"
                              title="Void purchase transaction"
                            >
                              Void
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedPurchases.map((purchase) => (
                <div 
                  key={purchase._id} 
                  onClick={() => setViewModalPurchase(purchase)}
                  className="p-4 flex flex-col gap-3 hover:bg-slate-50 active:bg-slate-100/70 transition cursor-pointer select-none tap-highlight-transparent"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-indigo-600 text-sm">{purchase.invoiceNumber}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{formatDate(purchase.purchaseDate)}</div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      purchase.status === 'VOIDED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {purchase.status || 'COMPLETED'}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 font-semibold mb-1">
                      Supplier: <span className="text-slate-900 font-bold">{purchase.supplierName}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-700 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {purchase.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-800 truncate" title={item.productId?.name || item.product?.name}>
                            {item.productId?.name || item.product?.name || 'Unknown Product'}
                          </span>
                          <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 flex-shrink-0">
                            {item.quantity} {item.productId?.unit || 'pcs'}
                          </span>
                        </div>
                      ))}
                      {purchase.items.length > 3 && (
                        <div className="text-[11px] font-bold text-indigo-600 pt-0.5 text-center">
                          +{purchase.items.length - 3} more products (tap Details to view all)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1">
                    <div className="font-extrabold text-slate-900 text-base">{formatCurrency(purchase.total)}</div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewModalPurchase(purchase);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 active:bg-indigo-100 rounded-lg flex items-center gap-1 transition min-h-[36px]"
                      >
                        <Eye size={14} /> Details
                      </button>
                      {purchase.status !== 'VOIDED' && (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVoidModalPurchase(purchase);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 active:bg-rose-100 rounded-lg transition min-h-[36px]"
                        >
                          Void
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View More Purchases Button */}
            {endIndex < totalFiltered && (
              <div className="p-3 bg-gray-50/70 border-t border-gray-100 md:hidden">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <span>View More Invoices ({totalFiltered - endIndex} remaining)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Pagination & Navigation Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
              {/* Count & Page Size */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <span className="font-medium">
                  Showing <span className="font-bold text-gray-900">{totalFiltered === 0 ? 0 : startIndex + 1}</span> to <span className="font-bold text-gray-900">{endIndex}</span> of <span className="font-bold text-gray-900">{totalFiltered}</span> invoices
                  {purchases.length !== totalFiltered && (
                    <span className="text-gray-400 ml-1">({purchases.length} total)</span>
                  )}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-medium">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <span className="hidden lg:inline-block text-gray-300">|</span>
                <span className="hidden lg:inline-block font-medium">Month Total: <strong className="text-gray-900">{formatCurrency(monthlyTotal)}</strong></span>
              </div>

              {/* View More Button + Page Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {endIndex < totalFiltered && (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="hidden lg:inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition"
                  >
                    <span>View More (+{Math.min(pageSize, totalFiltered - endIndex)})</span>
                    <ArrowRight size={13} />
                  </button>
                )}

                <div className="inline-flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                  {/* Previous Page */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                    className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 5) return true;
                      return page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 1;
                    })
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && page - prev > 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-1 text-gray-400 select-none">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[28px] h-7 px-2 text-xs font-bold rounded transition cursor-pointer ${
                              safeCurrentPage === page
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  {/* Next Page */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RECORD NEW PURCHASE MODAL DIALOG (AdaptiveSheet)                         */}
      {/* ========================================================================= */}
      <AdaptiveSheet
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Record New Purchase"
        subtitle="Log incoming stock and supplier invoice details"
        maxWidth="max-w-3xl"
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <div className="w-full sm:w-auto flex items-baseline justify-between sm:justify-start gap-2 text-xs">
              <span className="font-bold text-gray-500 uppercase tracking-wider">Grand Total:</span>
              <span className="text-xl font-extrabold text-indigo-600">{formatCurrency(formGrandTotal)}</span>
              <span className="text-gray-400">({formTotalUnits} units)</span>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="purchase-create-form"
                disabled={submitting}
                className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm rounded-xl min-h-[44px] cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Recording...</span>
                ) : (
                  <>
                    <span>Record Purchase</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        }
      >
        <form id="purchase-create-form" onSubmit={handleCreatePurchase} className="space-y-6 p-4 sm:p-6">
          {/* Invoice Primary Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Invoice Number *
              </label>
              <input
                type="text"
                required
                value={formData.invoiceNumber}
                onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[42px]"
                placeholder="e.g. INV-9021"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Supplier Name *
              </label>
              <input
                type="text"
                required
                value={formData.supplierName}
                onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[42px]"
                placeholder="Vendor or Distributor"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Purchase Date
              </label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[42px]"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Purchased Products & Stock</h4>
                <p className="text-xs text-gray-500">Add all products included in this invoice</p>
              </div>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition min-h-[40px] cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Product</span>
              </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Cost (₹)</div>
                <div className="col-span-2 text-right pr-3">Subtotal</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              <div className="divide-y divide-gray-100 bg-white max-h-72 overflow-y-auto">
                {formData.items.map((item, idx) => {
                  const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);
                  return (
                    <div key={idx} className="px-4 py-3 grid grid-cols-12 gap-2.5 items-center">
                      <div className="col-span-5">
                        <select
                          required
                          value={item.productId}
                          onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                        >
                          <option value="">-- Select a product --</option>
                          {products.map(p => (
                            <option key={p._id} value={p._id}>
                              {p.name} {p.sku ? `(SKU: ${p.sku})` : ''} - Stock: {p.currentStock} {p.unit || 'pcs'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-center font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={item.unitCost}
                          onChange={e => handleItemChange(idx, 'unitCost', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-right font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2 text-right pr-3">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(lineTotal)}</span>
                      </div>

                      <div className="col-span-1 text-center flex justify-center">
                        <button
                          type="button"
                          disabled={formData.items.length <= 1}
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-gray-400 hover:text-rose-600 disabled:opacity-20 disabled:hover:text-gray-400 p-1 rounded-md transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Card List View */}
            <div className="sm:hidden space-y-3 max-h-96 overflow-y-auto pr-1">
              {formData.items.map((item, idx) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);
                return (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700">Item #{idx + 1}</span>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Product *
                      </label>
                      <select
                        required
                        value={item.productId}
                        onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                      >
                        <option value="">-- Select a product --</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} {p.sku ? `(${p.sku})` : ''} - Stock: {p.currentStock} {p.unit || 'pcs'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                          Unit Cost (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={item.unitCost}
                          onChange={e => handleItemChange(idx, 'unitCost', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-right font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="font-semibold text-slate-500">Line Subtotal:</span>
                      <span className="font-bold text-slate-900 text-sm">{formatCurrency(lineTotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes & Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Notes / Remarks (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                placeholder="Payment terms, delivery notes, etc."
              />
            </div>

            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex flex-col justify-between">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Total Product Lines:</span>
                  <span className="font-semibold text-gray-900">{formData.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Units Received:</span>
                  <span className="font-semibold text-gray-900">{formTotalUnits} units</span>
                </div>
              </div>
              <div className="border-t border-indigo-100 pt-3 mt-2 flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase text-indigo-900">Grand Total:</span>
                <span className="text-2xl font-extrabold text-indigo-700">{formatCurrency(formGrandTotal)}</span>
              </div>
            </div>
          </div>
        </form>
      </AdaptiveSheet>

      {/* ========================================================================= */}
      {/* VOID PURCHASE MODAL (AdaptiveSheet)                                       */}
      {/* ========================================================================= */}
      <AdaptiveSheet
        isOpen={Boolean(voidModalPurchase)}
        onClose={() => setVoidModalPurchase(null)}
        title="Void Purchase Invoice?"
        subtitle={voidModalPurchase ? `Invoice #${voidModalPurchase.invoiceNumber}` : ''}
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setVoidModalPurchase(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition min-h-[44px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="void-purchase-form"
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition min-h-[44px] cursor-pointer"
            >
              Confirm Void
            </button>
          </div>
        }
      >
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-rose-100 text-rose-600 shrink-0">
              <AlertCircle size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Irreversible Action</h4>
              <p className="text-xs text-gray-500">Deducts stock added by this purchase</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 bg-rose-50/70 p-3 rounded-xl border border-rose-100 leading-relaxed">
            ⚠️ Warning: Voiding this invoice will deduct the received quantities from the current product stock levels in your inventory.
          </p>
          <form id="void-purchase-form" onSubmit={handleVoid}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Reason for Voiding *
              </label>
              <input
                type="text"
                required
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder="e.g. Order cancelled by supplier"
                className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none min-h-[44px]"
              />
            </div>
          </form>
        </div>
      </AdaptiveSheet>

      {/* ========================================================================= */}
      {/* VIEW DETAILS MODAL (AdaptiveSheet)                                        */}
      {/* ========================================================================= */}
      <AdaptiveSheet
        isOpen={Boolean(viewModalPurchase)}
        onClose={() => setViewModalPurchase(null)}
        title="Purchase Invoice Details"
        subtitle={viewModalPurchase ? `Invoice #${viewModalPurchase.invoiceNumber}` : ''}
        maxWidth="max-w-lg"
        footer={
          <div className="flex justify-end w-full">
            <button
              onClick={() => setViewModalPurchase(null)}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition min-h-[44px] cursor-pointer"
            >
              Close
            </button>
          </div>
        }
      >
        {viewModalPurchase && (
          <div className="p-4 sm:p-6 space-y-4 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Invoice Number</span>
                <span className="font-bold text-indigo-700 text-sm">{viewModalPurchase.invoiceNumber}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Purchase Date</span>
                <span className="font-semibold text-gray-800">{formatDate(viewModalPurchase.purchaseDate, true)}</span>
              </div>
              <div className="mt-1">
                <span className="text-gray-400 block font-medium">Supplier</span>
                <span className="font-semibold text-gray-800">{viewModalPurchase.supplierName}</span>
              </div>
              <div className="mt-1">
                <span className="text-gray-400 block font-medium">Status</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  viewModalPurchase.status === 'VOIDED' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {viewModalPurchase.status || 'COMPLETED'}
                </span>
              </div>
            </div>

            {viewModalPurchase.voidReason && (
              <div className="bg-rose-50 p-3 rounded-xl text-xs text-rose-800 border border-rose-200">
                <strong>Void Reason:</strong> {viewModalPurchase.voidReason}
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Purchased Items</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {viewModalPurchase.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                        {item.quantity} {item.productId?.unit || 'pcs'}
                      </span>
                      <span className="font-medium text-gray-900">
                        {item.productId?.name || item.product?.name || 'Unknown Product'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 font-normal">{formatCurrency(item.unitCost)} / ea</div>
                      <div className="font-bold text-gray-900">{formatCurrency(item.total)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-700">Total Invoice Amount:</span>
              <span className="text-xl font-extrabold text-gray-900">{formatCurrency(viewModalPurchase.total)}</span>
            </div>
          </div>
        )}
      </AdaptiveSheet>
    </div>
  );
};

export default Purchases;
