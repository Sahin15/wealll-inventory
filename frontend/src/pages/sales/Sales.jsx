import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Eye, 
  X, 
  Search, 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  Printer, 
  Trash2, 
  ShoppingBag, 
  Calendar, 
  GraduationCap,
  ArrowRight,
  IndianRupee,
  Check,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import InvoicePrint from '../../components/InvoicePrint';
import { formatDate } from '../../utils/dateFormatter';
import CategoryBadge from '../../components/CategoryBadge';
import { AuthContext } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { toast } from 'react-hot-toast';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [students, setStudents] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [printSale, setPrintSale] = useState(null);

  const { user } = React.useContext(AuthContext);
  const canVoid = hasPermission(user?.role, 'void_sale');

  // Modals
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [voidModalSale, setVoidModalSale] = useState(null);
  const [viewModalSale, setViewModalSale] = useState(null);
  const [voidReason, setVoidReason] = useState('');

  // Collect Payment Modal State
  const [collectPaymentSale, setCollectPaymentSale] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().substring(0, 10),
    notes: ''
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // New Sale Form State
  const [isStudentPurchase, setIsStudentPurchase] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerName: '',
    studentId: '',
    classBatchId: '',
    saleDate: new Date().toISOString().substring(0, 10),
    paymentStatus: 'PAID',
    paymentMethod: 'CASH',
    paidAmount: '',
    notes: '',
    items: []
  });

  // Filters
  const [filterMonth, setFilterMonth] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('ALL'); // 'ALL' | 'PAID' | 'DUE'

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, prodRes, settingsRes, studentsRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products'),
        api.get('/tenants/settings').catch(() => ({ data: { data: {} } })),
        api.get('/classes/students/all').catch(() => ({ data: { data: [] } }))
      ]);
      setSales(salesRes.data.data || []);
      setProducts(prodRes.data.data || []);
      setSettings(settingsRes.data.data || {});
      setStudents(studentsRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const today = new Date();
    setFilterMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  }, []);

  // Open modal without pre-selected products
  const handleOpenSaleModal = () => {
    setFormData({
      invoiceNumber: '',
      customerName: '',
      studentId: '',
      classBatchId: '',
      saleDate: new Date().toISOString().substring(0, 10),
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      paidAmount: '',
      notes: '',
      items: [
        {
          productId: '',
          quantity: 1,
          mrp: '',
          discount: '0',
          discountType: 'FLAT'
        }
      ]
    });
    setIsStudentPurchase(false);
    setShowSaleModal(true);
  };

  // Add another product row
  const handleAddItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          quantity: 1,
          mrp: '',
          discount: '0',
          discountType: 'FLAT'
        }
      ]
    }));
  };

  // Remove a product row
  const handleRemoveItemRow = (index) => {
    if (formData.items.length === 1) {
      return toast.error('Sale must contain at least one product row');
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.items];
      const current = { ...updated[index], [field]: value };

      if (field === 'productId') {
        const prod = products.find(p => p._id === value);
        if (prod) {
          current.mrp = typeof prod.mrp === 'number' ? prod.mrp : (prod.sellingPrice ?? 0);
          current.discount = '0';
          current.discountType = 'FLAT';
        } else {
          current.mrp = '';
        }
      }

      updated[index] = current;
      return { ...prev, items: updated };
    });
  };

  // Handle student selection
  const handleStudentChange = (e) => {
    const sId = e.target.value;
    const student = students.find(s => s._id === sId);
    if (student) {
      setFormData(prev => ({
        ...prev,
        studentId: sId,
        customerName: student.name,
        classBatchId: student.batchId || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        studentId: '',
        customerName: '',
        classBatchId: ''
      }));
    }
  };

  // Live row calculations
  const calculateRowTotal = (item) => {
    const qty = Number(item.quantity) || 0;
    const mrp = Number(item.mrp) || 0;
    const disc = Number(item.discount) || 0;
    
    let discountedPrice = mrp;
    if (item.discountType === 'PERCENT') {
      discountedPrice = mrp - (mrp * (disc / 100));
    } else {
      discountedPrice = mrp - disc;
    }
    discountedPrice = Math.max(0, discountedPrice);
    return Math.round(discountedPrice * qty);
  };

  // Modal summary totals
  const modalCalculations = () => {
    let grandTotal = 0;
    let totalUnits = 0;

    const computedItems = formData.items.map(item => {
      const rowTotal = calculateRowTotal(item);
      const qty = Number(item.quantity) || 0;
      grandTotal += rowTotal;
      totalUnits += qty;

      const mrp = Number(item.mrp) || 0;
      const sellingPrice = qty > 0 ? rowTotal / qty : mrp;

      return {
        productId: item.productId,
        quantity: qty,
        mrp,
        sellingPrice,
        total: rowTotal
      };
    });

    return { computedItems, grandTotal, totalUnits };
  };

  const { grandTotal: formGrandTotal, totalUnits: formTotalUnits } = modalCalculations();

  // Calculated upfront paid and due balance for new sale modal
  const formPaymentCalculations = useMemo(() => {
    if (formData.paymentStatus === 'PAID') {
      return { paid: formGrandTotal, due: 0 };
    }
    if (formData.paymentStatus === 'PENDING') {
      return { paid: 0, due: formGrandTotal };
    }
    // PARTIAL
    const entered = Number(formData.paidAmount) || 0;
    const paid = Math.max(0, Math.min(formGrandTotal, entered));
    const due = Math.max(0, formGrandTotal - paid);
    return { paid, due };
  }, [formData.paymentStatus, formData.paidAmount, formGrandTotal]);

  const handleSubmitSale = async (e) => {
    e.preventDefault();

    if (!formData.invoiceNumber.trim()) {
      return toast.error('Invoice Number is required');
    }
    if (!isStudentPurchase && !formData.customerName.trim()) {
      return toast.error('Customer Name is required');
    }
    if (isStudentPurchase && !formData.studentId) {
      return toast.error('Please select an enrolled student');
    }
    if (formData.items.length === 0) {
      return toast.error('Please add at least one product');
    }

    // Validate each row
    for (let i = 0; i < formData.items.length; i++) {
      const itm = formData.items[i];
      if (!itm.productId) {
        return toast.error(`Item #${i + 1}: Please select a product`);
      }
      const prod = products.find(p => p._id === itm.productId);
      if (prod && prod.currentStock < itm.quantity) {
        return toast.error(`Item #${i + 1} (${prod.name}): Only ${prod.currentStock} available in stock`);
      }
    }

    const { computedItems, grandTotal } = modalCalculations();

    // Validate Partial Payment input
    let finalPaidAmount = 0;
    if (formData.paymentStatus === 'PAID') {
      finalPaidAmount = grandTotal;
    } else if (formData.paymentStatus === 'PARTIAL') {
      const entered = Number(formData.paidAmount);
      if (isNaN(entered) || entered <= 0) {
        return toast.error('Please enter the upfront amount received for partial payment');
      }
      if (entered > grandTotal) {
        return toast.error(`Amount paid cannot exceed grand total of ${formatCurrency(grandTotal)}`);
      }
      finalPaidAmount = entered;
    }

    setSubmitting(true);
    try {
      const payload = {
        invoiceNumber: formData.invoiceNumber.trim(),
        customerName: formData.customerName.trim(),
        studentId: isStudentPurchase ? formData.studentId : undefined,
        classBatchId: isStudentPurchase ? formData.classBatchId : undefined,
        saleDate: formData.saleDate || new Date(),
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        paidAmount: finalPaidAmount,
        notes: formData.notes,
        subtotal: grandTotal,
        discount: 0,
        total: grandTotal,
        items: computedItems
      };

      await api.post('/sales', payload);
      setShowSaleModal(false);
      fetchData();
      toast.success('Sale recorded and inventory updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Collect Payment Modal
  const handleOpenCollectPayment = (sale) => {
    const currentPaid = typeof sale.paidAmount === 'number' ? sale.paidAmount : (sale.paymentStatus === 'PAID' ? sale.total : 0);
    const currentDue = typeof sale.dueAmount === 'number' ? sale.dueAmount : Math.max(0, sale.total - currentPaid);
    
    setCollectPaymentSale(sale);
    setPaymentForm({
      amount: currentDue > 0 ? String(currentDue) : '',
      paymentMethod: 'CASH',
      paymentDate: new Date().toISOString().substring(0, 10),
      notes: ''
    });
  };

  // Submit Collect Payment Installment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const payAmt = Number(paymentForm.amount);
    if (!payAmt || payAmt <= 0) {
      return toast.error('Payment amount must be greater than 0');
    }

    const currentPaid = typeof collectPaymentSale.paidAmount === 'number' ? collectPaymentSale.paidAmount : (collectPaymentSale.paymentStatus === 'PAID' ? collectPaymentSale.total : 0);
    const currentDue = typeof collectPaymentSale.dueAmount === 'number' ? collectPaymentSale.dueAmount : Math.max(0, collectPaymentSale.total - currentPaid);

    if (payAmt > currentDue) {
      return toast.error(`Payment amount cannot exceed balance due of ${formatCurrency(currentDue)}`);
    }

    setSubmittingPayment(true);
    try {
      const res = await api.post(`/sales/${collectPaymentSale._id}/payments`, paymentForm);
      toast.success('Payment recorded successfully!');
      setCollectPaymentSale(null);
      fetchData();
      if (viewModalSale && viewModalSale._id === collectPaymentSale._id) {
        setViewModalSale(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleVoid = async (e) => {
    e.preventDefault();
    if (!voidReason.trim()) return toast.error('Void reason is required');
    try {
      await api.post(`/sales/${voidModalSale._id}/void`, { voidReason: voidReason.trim() });
      setVoidModalSale(null);
      setVoidReason('');
      fetchData();
      toast.success('Sale transaction voided and stock restored!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to void sale');
    }
  };

  // Filtered sales list
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      // Payment Status Filter
      if (filterPaymentStatus === 'PAID') {
        const isPaid = (s.dueAmount === 0) || (s.dueAmount === undefined && s.paymentStatus === 'PAID');
        if (!isPaid || s.status === 'VOIDED') return false;
      }
      if (filterPaymentStatus === 'DUE') {
        const isDue = (s.dueAmount > 0) || (s.dueAmount === undefined && s.paymentStatus !== 'PAID');
        if (!isDue || s.status === 'VOIDED') return false;
      }

      // Month
      if (filterMonth) {
        const sMonth = new Date(s.saleDate).toISOString().substring(0, 7);
        if (sMonth !== filterMonth) return false;
      }
      // Invoice or customer search
      if (filterSearch) {
        const q = filterSearch.toLowerCase();
        const matchesInvoice = s.invoiceNumber.toLowerCase().includes(q);
        const matchesCustomer = (s.customerName || '').toLowerCase().includes(q);
        if (!matchesInvoice && !matchesCustomer) return false;
      }
      // Product search
      if (filterProduct) {
        const q = filterProduct.toLowerCase();
        const hasProd = s.items.some(itm => {
          const name = itm.productId?.name || itm.product?.name || '';
          return name.toLowerCase().includes(q);
        });
        if (!hasProd) return false;
      }
      return true;
    });
  }, [sales, filterMonth, filterSearch, filterProduct, filterPaymentStatus]);

  // Metrics
  const summaryMonth = filterMonth || new Date().toISOString().substring(0, 7);
  const monthlyTotal = useMemo(() => {
    return sales.reduce((acc, s) => {
      if (s.status === 'VOIDED') return acc;
      const sMonth = new Date(s.saleDate).toISOString().substring(0, 7);
      if (sMonth === summaryMonth) {
        return acc + (s.total || 0);
      }
      return acc;
    }, 0);
  }, [sales, summaryMonth]);

  // Outstanding Credit / Due Total across all active sales
  const totalOutstandingDue = useMemo(() => {
    return sales.reduce((acc, s) => {
      if (s.status === 'VOIDED') return acc;
      const due = typeof s.dueAmount === 'number' ? s.dueAmount : (s.paymentStatus === 'PAID' ? 0 : s.total);
      return acc + (due || 0);
    }, 0);
  }, [sales]);

  const unpaidCount = useMemo(() => {
    return sales.filter(s => s.status !== 'VOIDED' && (s.dueAmount > 0 || (s.dueAmount === undefined && s.paymentStatus !== 'PAID'))).length;
  }, [sales]);

  const displayMonthName = new Date(summaryMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto print:hidden">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-emerald-600" size={26} />
              Sales & Invoices
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Record point-of-sale orders, manage partial payments, and track credit sales dues.
            </p>
          </div>

          <button 
            onClick={handleOpenSaleModal} 
            className="btn-primary inline-flex items-center justify-center gap-2 shadow-sm py-2.5 px-4 font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
          >
            <Plus size={18} />
            <span>Record New Sale</span>
          </button>
        </div>

        {/* Floating Action Button for Mobile */}
        <button
          onClick={handleOpenSaleModal}
          className="sm:hidden fixed bottom-20 right-4 z-40 bg-emerald-600 text-white rounded-full p-4 shadow-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 min-h-[56px] min-w-[56px] flex items-center justify-center"
          title="Record New Sale"
        >
          <Plus size={24} />
        </button>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Revenue KPI */}
          <div className="bg-white shadow-xs border border-gray-200/80 rounded-2xl p-5 flex items-center border-l-4 border-emerald-600">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 mr-4 shrink-0">
              <TrendingUp size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sales</p>
              <p className="text-xs text-gray-400 mb-0.5">{displayMonthName}</p>
              <p className="text-2xl font-extrabold text-gray-900 truncate">{formatCurrency(monthlyTotal)}</p>
            </div>
          </div>

          {/* Card 2: Total Invoices */}
          <div className="bg-white shadow-xs border border-gray-200/80 rounded-2xl p-5 flex items-center border-l-4 border-indigo-600">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 mr-4 shrink-0">
              <FileText size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Invoices</p>
              <p className="text-xs text-gray-400 mb-0.5">Completed Transactions</p>
              <p className="text-2xl font-extrabold text-gray-900 truncate">
                {sales.filter(s => s.status !== 'VOIDED').length}
              </p>
            </div>
          </div>

          {/* Card 3: Outstanding Credit & Dues */}
          <div className="bg-white shadow-xs border border-amber-200/80 rounded-2xl p-5 flex items-center border-l-4 border-amber-500 bg-gradient-to-br from-white to-amber-50/30">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-700 mr-4 shrink-0">
              <IndianRupee size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Outstanding Dues / Credit</p>
              <p className="text-xs text-amber-700/80 mb-0.5">{unpaidCount} Pending Credit Sales</p>
              <p className="text-2xl font-black text-rose-600 truncate">{formatCurrency(totalOutstandingDue)}</p>
            </div>
          </div>
        </div>

        {/* Filters & Status Tabs */}
        <div className="bg-white shadow-xs border border-gray-200/80 rounded-2xl p-5 space-y-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterPaymentStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterPaymentStatus === 'ALL'
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Sales ({sales.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPaymentStatus('PAID')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterPaymentStatus === 'PAID'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                }`}
              >
                Fully Paid
              </button>
              <button
                type="button"
                onClick={() => setFilterPaymentStatus('DUE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterPaymentStatus === 'DUE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100'
                }`}
              >
                Unpaid / Credit (Dues: {unpaidCount})
              </button>
            </div>

            <span className="text-xs text-gray-400">
              Showing {filteredSales.length} of {sales.length} transactions
            </span>
          </div>

          {/* Filter Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" /> Filter by Month
              </label>
              <input 
                type="month" 
                value={filterMonth} 
                onChange={e => setFilterMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Search size={13} className="text-gray-400" /> Search Invoice or Customer
              </label>
              <input 
                type="text" 
                value={filterSearch} 
                onChange={e => setFilterSearch(e.target.value)} 
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <ShoppingBag size={13} className="text-gray-400" /> Filter by Product Name
              </label>
              <input 
                type="text" 
                value={filterProduct} 
                onChange={e => setFilterProduct(e.target.value)} 
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Sales Table / Content */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium">Loading sales invoices...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingBag className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-base font-semibold text-gray-700">No sales transactions found</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                No orders match your selected filters. Try changing month, search term, or click "Record New Sale".
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Invoice #</th>
                      <th className="px-6 py-3.5">Customer</th>
                      <th className="px-6 py-3.5">Items Purchased</th>
                      <th className="px-6 py-3.5 text-right">Total Amount</th>
                      <th className="px-6 py-3.5 text-center">Payment & Dues</th>
                      <th className="px-6 py-3.5 text-center">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-sm">
                    {filteredSales.map((sale) => {
                      const currentPaid = typeof sale.paidAmount === 'number' ? sale.paidAmount : (sale.paymentStatus === 'PAID' ? sale.total : 0);
                      const currentDue = typeof sale.dueAmount === 'number' ? sale.dueAmount : Math.max(0, sale.total - currentPaid);
                      const isUnpaidOrPartial = currentDue > 0;

                      return (
                        <tr key={sale._id} className="hover:bg-gray-50/80 transition-colors">
                          {/* Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                            {formatDate(sale.saleDate)}
                          </td>

                          {/* Invoice # */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                            {sale.invoiceNumber}
                          </td>

                          {/* Customer */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                            <div className="flex items-center gap-1.5">
                              <span>{sale.customerName || 'Walk-in Customer'}</span>
                              {sale.studentId && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  <GraduationCap size={12} /> Student
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Items */}
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex flex-col gap-1.5 max-w-xs">
                              {sale.items.map((item, idx) => {
                                const prod = item.productId || item.product;
                                return (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                      {item.quantity} {prod?.unit || 'pcs'}
                                    </span>
                                    <span className="text-gray-800 font-medium truncate">
                                      {prod?.name || 'Unknown Product'}
                                    </span>
                                    {prod?.categoryId && <CategoryBadge category={prod.categoryId} />}
                                  </div>
                                );
                              })}
                            </div>
                          </td>

                          {/* Total Amount */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-gray-900">
                            {formatCurrency(sale.total)}
                          </td>

                          {/* Payment & Dues Status */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {sale.status === 'VOIDED' ? (
                              <span className="text-xs text-gray-400 font-medium">—</span>
                            ) : currentDue === 0 ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check size={12} className="text-emerald-600" />
                                <span>Paid</span>
                              </div>
                            ) : sale.paymentStatus === 'PARTIAL' ? (
                              <div className="flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock size={11} className="text-amber-600" /> Partial
                                </span>
                                <span className="text-[11px] font-black text-rose-600 mt-0.5">
                                  Due: {formatCurrency(currentDue)}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <Clock size={11} className="text-rose-600" /> Unpaid / Credit
                                </span>
                                <span className="text-[11px] font-black text-rose-600 mt-0.5">
                                  Due: {formatCurrency(currentDue)}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              sale.status === 'VOIDED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {sale.status || 'COMPLETED'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Collect Payment Button */}
                              {sale.status !== 'VOIDED' && isUnpaidOrPartial && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCollectPayment(sale)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition shadow-2xs cursor-pointer"
                                  title="Record installment payment"
                                >
                                  <IndianRupee size={12} />
                                  <span>Collect</span>
                                </button>
                              )}

                              {/* View Details */}
                              <button
                                onClick={() => setViewModalSale(sale)}
                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                title="View sale details"
                              >
                                <Eye size={17} />
                              </button>

                              {/* Print Invoice */}
                              <button
                                onClick={() => {
                                  setPrintSale(sale);
                                  setTimeout(() => window.print(), 100);
                                }}
                                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                title="Print Invoice"
                              >
                                <Printer size={17} />
                              </button>

                              {/* Void Sale */}
                              {canVoid && sale.status !== 'VOIDED' && (
                                <button
                                  onClick={() => setVoidModalSale(sale)}
                                  className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-rose-100 transition cursor-pointer"
                                  title="Void sale transaction"
                                >
                                  Void
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredSales.map((sale) => {
                  const currentPaid = typeof sale.paidAmount === 'number' ? sale.paidAmount : (sale.paymentStatus === 'PAID' ? sale.total : 0);
                  const currentDue = typeof sale.dueAmount === 'number' ? sale.dueAmount : Math.max(0, sale.total - currentPaid);
                  const isUnpaidOrPartial = currentDue > 0;

                  return (
                    <div key={sale._id} className="p-4 flex flex-col gap-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-emerald-600 text-sm">{sale.invoiceNumber}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{formatDate(sale.saleDate)}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {sale.status === 'VOIDED' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              VOIDED
                            </span>
                          ) : currentDue === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Due: {formatCurrency(currentDue)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1.5">
                          Customer: <span className="text-gray-900 font-bold">{sale.customerName || 'Walk-in'}</span>
                          {sale.studentId && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                              Student
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-700 space-y-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          {sale.items.map((item, idx) => {
                            const prod = item.productId || item.product;
                            return (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="font-medium text-gray-800 truncate">
                                  {prod?.name || 'Unknown Product'}
                                </span>
                                <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                                  {item.quantity} {prod?.unit || 'pcs'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-1">
                        <div>
                          <div className="font-extrabold text-gray-900 text-base">{formatCurrency(sale.total)}</div>
                          {isUnpaidOrPartial && sale.status !== 'VOIDED' && (
                            <div className="text-[11px] font-bold text-rose-600">Balance: {formatCurrency(currentDue)}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {sale.status !== 'VOIDED' && isUnpaidOrPartial && (
                            <button 
                              type="button"
                              onClick={() => handleOpenCollectPayment(sale)}
                              className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1"
                            >
                              <IndianRupee size={12} /> Collect
                            </button>
                          )}
                          <button 
                            onClick={() => setViewModalSale(sale)}
                            className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg flex items-center gap-1"
                          >
                            <Eye size={14} /> Details
                          </button>
                          <button 
                            onClick={() => {
                              setPrintSale(sale);
                              setTimeout(() => window.print(), 100);
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg flex items-center gap-1"
                          >
                            <Printer size={14} /> Print
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RECORD NEW SALE MODAL                                                     */}
        {/* ========================================================================= */}
        {showSaleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Record New Sale</h3>
                    <p className="text-xs text-gray-500">Create customer order, apply discounts, and deduct stock</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSaleModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmitSale} className="flex-1 overflow-y-auto flex flex-col justify-between">
                <div className="p-6 space-y-5">
                  {/* Student Switcher Banner */}
                  <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <GraduationCap className="text-emerald-700" size={18} />
                      <span>Is this purchase for an Enrolled Student?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isStudentPurchase} 
                        onChange={(e) => {
                          setIsStudentPurchase(e.target.checked);
                          if (!e.target.checked) {
                            setFormData(prev => ({ ...prev, studentId: '', customerName: '', classBatchId: '' }));
                          }
                        }} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Customer / Invoice Details */}
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
                        className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                      />
                    </div>

                    {isStudentPurchase ? (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Select Enrolled Student *
                        </label>
                        <select
                          required
                          value={formData.studentId}
                          onChange={handleStudentChange}
                          className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                        >
                          <option value="">-- Choose Student --</option>
                          {students.map(s => (
                            <option key={s._id} value={s._id}>
                              {s.name} (Batch: {s.batchNumber})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.customerName}
                          onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Sale Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.saleDate}
                        onChange={e => setFormData({ ...formData, saleDate: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Sale Products & Items</h4>
                        <p className="text-xs text-gray-500">Add products to be sold and adjust quantity/discounts</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddItemRow}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Another Product</span>
                      </button>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-2xs">
                      <table className="w-full text-left text-xs min-w-[600px]">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3 w-5/12">Product</th>
                            <th className="py-2.5 px-3 w-2/12 text-center">Qty</th>
                            <th className="py-2.5 px-3 w-2/12 text-right">MRP (₹)</th>
                            <th className="py-2.5 px-3 w-3/12 text-center">Discount</th>
                            <th className="py-2.5 px-3 w-2/12 text-right">Subtotal</th>
                            <th className="py-2.5 px-2 w-1/12 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {formData.items.map((item, idx) => {
                            const selectedProd = products.find(p => p._id === item.productId);
                            const rowSubtotal = calculateRowTotal(item);

                            return (
                              <tr key={idx} className="hover:bg-gray-50/50">
                                {/* Product Select */}
                                <td className="py-2 px-3">
                                  <select
                                    required
                                    value={item.productId}
                                    onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                  >
                                    <option value="">-- Select a product --</option>
                                    {products.map(p => {
                                      const price = typeof p.mrp === 'number' ? p.mrp : (p.sellingPrice ?? 0);
                                      return (
                                        <option key={p._id} value={p._id} disabled={p.currentStock <= 0}>
                                          {p.name} (Stock: {p.currentStock} {p.unit}) - ₹{price}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </td>

                                {/* Quantity */}
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    min="1"
                                    max={selectedProd ? selectedProd.currentStock : 9999}
                                    required
                                    value={item.quantity}
                                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                    className="w-16 p-2 mx-auto block text-center bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                  />
                                </td>

                                {/* MRP */}
                                <td className="py-2 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <span className="text-gray-400 font-medium">₹</span>
                                    <input
                                      type="number"
                                      min="0"
                                      required
                                      value={item.mrp}
                                      onChange={e => handleItemChange(idx, 'mrp', e.target.value)}
                                      className="w-20 p-1.5 bg-white border border-gray-300 rounded text-xs text-right font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                  </div>
                                </td>

                                {/* Discount */}
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-1 justify-center">
                                    <select
                                      value={item.discountType}
                                      onChange={e => handleItemChange(idx, 'discountType', e.target.value)}
                                      className="p-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-bold"
                                    >
                                      <option value="FLAT">₹</option>
                                      <option value="PERCENT">%</option>
                                    </select>
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.discount}
                                      onChange={e => handleItemChange(idx, 'discount', e.target.value)}
                                      className="w-16 p-1.5 bg-white border border-gray-300 rounded text-xs text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                  </div>
                                </td>

                                {/* Row Total */}
                                <td className="py-2 px-3 text-right font-extrabold text-gray-900 text-sm">
                                  {formatCurrency(rowSubtotal)}
                                </td>

                                {/* Delete Row */}
                                <td className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItemRow(idx)}
                                    className="text-gray-400 hover:text-rose-600 p-1 transition cursor-pointer"
                                    title="Remove line"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Items Cards View */}
                    <div className="sm:hidden space-y-3">
                      {formData.items.map((item, idx) => {
                        const selectedProd = products.find(p => p._id === item.productId);
                        const rowSubtotal = calculateRowTotal(item);

                        return (
                          <div key={idx} className="bg-gray-50/80 border border-gray-200 rounded-xl p-3.5 space-y-3">
                            {/* Product Selection */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                  Item #{idx + 1}
                                </label>
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
                              <select
                                required
                                value={item.productId}
                                onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              >
                                <option value="">-- Select a product --</option>
                                {products.map(p => {
                                  const price = typeof p.mrp === 'number' ? p.mrp : (p.sellingPrice ?? 0);
                                  return (
                                    <option key={p._id} value={p._id} disabled={p.currentStock <= 0}>
                                      {p.name} (Stock: {p.currentStock} {p.unit}) - ₹{price}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* Qty and MRP Inputs Row */}
                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max={selectedProd ? selectedProd.currentStock : 9999}
                                  required
                                  value={item.quantity}
                                  onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                  className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                  Price / MRP (₹)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  required
                                  value={item.mrp}
                                  onChange={e => handleItemChange(idx, 'mrp', e.target.value)}
                                  className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Discount & Row Total */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                              <div className="flex items-center gap-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Disc:</label>
                                <select
                                  value={item.discountType}
                                  onChange={e => handleItemChange(idx, 'discountType', e.target.value)}
                                  className="p-1.5 bg-white border border-gray-300 rounded text-xs font-bold"
                                >
                                  <option value="FLAT">₹</option>
                                  <option value="PERCENT">%</option>
                                </select>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.discount}
                                  onChange={e => handleItemChange(idx, 'discount', e.target.value)}
                                  className="w-14 p-1.5 bg-white border border-gray-300 rounded text-xs text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                                />
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-gray-400 block">Subtotal</span>
                                <span className="text-sm font-black text-emerald-700">
                                  {formatCurrency(rowSubtotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Status, Methods & Partial Calculation Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-3">
                      {/* Payment Status */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Payment Status *
                        </label>
                        <select
                          value={formData.paymentStatus}
                          onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-medium"
                        >
                          <option value="PAID">PAID (Full payment received)</option>
                          <option value="PARTIAL">PARTIAL (Advance / Part payment received)</option>
                          <option value="PENDING">PENDING (Unpaid / Full Credit Sale)</option>
                        </select>
                      </div>

                      {/* Payment Method & Upfront Amount (when applicable) */}
                      {formData.paymentStatus !== 'PENDING' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                              Payment Method
                            </label>
                            <select
                              value={formData.paymentMethod}
                              onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                            >
                              <option value="CASH">Cash</option>
                              <option value="UPI">UPI / GPay / PhonePe</option>
                              <option value="CARD">Debit / Credit Card</option>
                              <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>

                          {formData.paymentStatus === 'PARTIAL' && (
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Amount Paid Upfront (₹) *
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={formGrandTotal}
                                required
                                value={formData.paidAmount}
                                onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
                                className="w-full px-3 py-2 text-sm bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-800"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes / Remarks */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Notes / Remarks (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={formData.notes}
                          onChange={e => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Summary & Live Calculation Box */}
                    <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 flex flex-col justify-between">
                      <div className="space-y-1.5 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Total Product Lines:</span>
                          <span className="font-semibold text-gray-900">{formData.items.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Units Sold:</span>
                          <span className="font-semibold text-gray-900">{formTotalUnits} units</span>
                        </div>
                        <div className="flex justify-between border-t border-emerald-100/80 pt-2">
                          <span>Payment Mode:</span>
                          <span className="font-bold text-gray-800">
                            {formData.paymentStatus === 'PAID' && 'Full Settlement'}
                            {formData.paymentStatus === 'PARTIAL' && 'Partial Advance'}
                            {formData.paymentStatus === 'PENDING' && 'Credit / Unpaid Sale'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount Received:</span>
                          <span className="font-bold text-emerald-700">
                            {formatCurrency(formPaymentCalculations.paid)}
                          </span>
                        </div>
                        {formPaymentCalculations.due > 0 && (
                          <div className="flex justify-between text-rose-600 font-bold">
                            <span>Balance Due (Credit):</span>
                            <span>{formatCurrency(formPaymentCalculations.due)}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-emerald-100 pt-3 mt-2 flex justify-between items-baseline">
                        <span className="text-xs font-bold uppercase text-emerald-900">Grand Total:</span>
                        <span className="text-2xl font-extrabold text-emerald-700">{formatCurrency(formGrandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSaleModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Sale & Deduct Stock</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* COLLECT PAYMENT MODAL                                                     */}
        {/* ========================================================================= */}
        {collectPaymentSale && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Record Installment Payment</h3>
                    <p className="text-xs text-gray-500">
                      Invoice #{collectPaymentSale.invoiceNumber} • {collectPaymentSale.customerName || 'Walk-in'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setCollectPaymentSale(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleRecordPayment} className="p-6 overflow-y-auto space-y-4 flex-1">
                {/* Balance Summary Card */}
                {(() => {
                  const currentPaid = typeof collectPaymentSale.paidAmount === 'number' ? collectPaymentSale.paidAmount : (collectPaymentSale.paymentStatus === 'PAID' ? collectPaymentSale.total : 0);
                  const currentDue = typeof collectPaymentSale.dueAmount === 'number' ? collectPaymentSale.dueAmount : Math.max(0, collectPaymentSale.total - currentPaid);

                  return (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Invoice Grand Total:</span>
                        <span className="font-bold text-gray-900">{formatCurrency(collectPaymentSale.total)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Total Paid Till Date:</span>
                        <span className="font-bold text-emerald-700">{formatCurrency(currentPaid)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-amber-200/80">
                        <span className="font-bold text-gray-800">Remaining Balance Due:</span>
                        <span className="font-black text-rose-600 text-base">{formatCurrency(currentDue)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Amount to Collect */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Amount Received Now (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-base font-black text-emerald-800 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Method & Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Payment Method *
                    </label>
                    <select
                      value={paymentForm.paymentMethod}
                      onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-medium"
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="CARD">Debit / Credit Card</option>
                      <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentForm.paymentDate}
                      onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Payment Notes / Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentForm.notes}
                    onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Past Payments History */}
                {collectPaymentSale.payments && collectPaymentSale.payments.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Previous Payments Log</h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {collectPaymentSale.payments.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <div>
                            <span className="font-bold text-gray-800">{formatCurrency(p.amount)}</span>
                            <span className="text-gray-400 ml-1.5">via {p.paymentMethod}</span>
                            {p.notes && <span className="text-gray-500 italic ml-1">({p.notes})</span>}
                          </div>
                          <span className="text-gray-400">{formatDate(p.paymentDate)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCollectPaymentSale(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {submittingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Record Payment ({formatCurrency(Number(paymentForm.amount) || 0)})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VOID SALE MODAL                                                           */}
        {/* ========================================================================= */}
        {voidModalSale && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-full bg-rose-100 text-rose-600">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Void Sale Transaction?</h3>
                  <p className="text-xs text-gray-500">Invoice #{voidModalSale.invoiceNumber}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                ⚠️ Warning: Voiding this sale will return the sold quantities back into your product inventory.
              </p>
              <form onSubmit={handleVoid}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Reason for Voiding *
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={voidReason} 
                    onChange={e => setVoidReason(e.target.value)} 
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none" 
                  />
                </div>
                <div className="flex justify-end gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => setVoidModalSale(null)} 
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition cursor-pointer"
                  >
                    Confirm Void
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW DETAILS MODAL                                                        */}
        {/* ========================================================================= */}
        {viewModalSale && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-emerald-600" size={20} />
                  <h3 className="text-base font-bold text-gray-900">Sale Invoice Details</h3>
                </div>
                <button 
                  onClick={() => setViewModalSale(null)} 
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">Invoice Number</span>
                    <span className="font-bold text-emerald-700 text-sm">{viewModalSale.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Sale Date</span>
                    <span className="font-semibold text-gray-800">{formatDate(viewModalSale.saleDate, true)}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-400 block font-medium">Customer</span>
                    <span className="font-semibold text-gray-800">{viewModalSale.customerName || 'Walk-in'}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-400 block font-medium">Order Status</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      viewModalSale.status === 'VOIDED' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {viewModalSale.status || 'COMPLETED'}
                    </span>
                  </div>
                </div>

                {/* Financial / Payment Breakdown Box */}
                {(() => {
                  const currentPaid = typeof viewModalSale.paidAmount === 'number' ? viewModalSale.paidAmount : (viewModalSale.paymentStatus === 'PAID' ? viewModalSale.total : 0);
                  const currentDue = typeof viewModalSale.dueAmount === 'number' ? viewModalSale.dueAmount : Math.max(0, viewModalSale.total - currentPaid);

                  return (
                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-600">Payment Status:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          currentDue === 0 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {currentDue === 0 ? 'Fully Settled' : viewModalSale.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Invoice Total:</span>
                        <span className="font-bold text-gray-900">{formatCurrency(viewModalSale.total)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Amount Paid:</span>
                        <span className="font-bold text-emerald-700">{formatCurrency(currentPaid)}</span>
                      </div>
                      {currentDue > 0 && (
                        <div className="flex justify-between text-xs text-rose-600 font-bold pt-1 border-t border-emerald-200/60">
                          <span>Balance Due:</span>
                          <span>{formatCurrency(currentDue)}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Payments Timeline / History */}
                {viewModalSale.payments && viewModalSale.payments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Installments</h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {viewModalSale.payments.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <div>
                            <span className="font-bold text-emerald-700">{formatCurrency(p.amount)}</span>
                            <span className="text-gray-500 ml-1.5">via {p.paymentMethod}</span>
                            {p.notes && <span className="text-gray-400 italic ml-1">({p.notes})</span>}
                          </div>
                          <span className="text-gray-400">{formatDate(p.paymentDate)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewModalSale.voidReason && (
                  <div className="bg-rose-50 p-2.5 rounded-lg text-xs text-rose-800 border border-rose-200">
                    <strong>Void Reason:</strong> {viewModalSale.voidReason}
                  </div>
                )}

                {/* Purchased Items */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Purchased Items</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {viewModalSale.items.map((item, idx) => {
                      const prod = item.productId || item.product;
                      return (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                              {item.quantity} {prod?.unit || 'pcs'}
                            </span>
                            <span className="font-medium text-gray-900">
                              {prod?.name || 'Unknown Product'}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-400 font-normal">{formatCurrency(item.sellingPrice)} / ea</div>
                            <div className="font-bold text-gray-900">{formatCurrency(item.total)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-700">Total Invoice Amount:</span>
                  <span className="text-xl font-extrabold text-gray-900">{formatCurrency(viewModalSale.total)}</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-5 flex justify-between items-center gap-2.5 border-t border-gray-100 pt-3">
                {viewModalSale.status !== 'VOIDED' && (viewModalSale.dueAmount > 0 || (viewModalSale.dueAmount === undefined && viewModalSale.paymentStatus !== 'PAID')) && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewModalSale;
                      setViewModalSale(null);
                      handleOpenCollectPayment(target);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition cursor-pointer"
                  >
                    <IndianRupee size={14} /> Collect Payment
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button 
                    onClick={() => {
                      setPrintSale(viewModalSale);
                      setTimeout(() => window.print(), 100);
                    }} 
                    className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                  >
                    <Printer size={15} />
                    <span>Print Invoice</span>
                  </button>
                  <button 
                    onClick={() => setViewModalSale(null)} 
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Printable Invoice Component for Browser Print */}
      {printSale && (
        <InvoicePrint sale={printSale} settings={settings} />
      )}
    </>
  );
};

export default Sales;
