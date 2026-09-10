import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCw, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  IndianRupee,
  SlidersHorizontal,
  X,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';
import CategoryBadge from '../../components/CategoryBadge';

const Stock = () => {
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'ledger'
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Available Stock
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'LOW' | 'OUT' | 'HEALTHY'
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Filters for Stock Ledger
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('ALL'); // 'ALL' | 'IN' | 'OUT' | 'ADJUSTMENT'

  // Pagination for Available Stock
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Pagination for Stock Ledger
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(15);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stockRes, prodRes] = await Promise.all([
        api.get('/stock'),
        api.get('/products')
      ]);
      setMovements(stockRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch stock data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
    const outOfStock = products.filter(p => (p.currentStock || 0) === 0).length;
    const lowStock = products.filter(p => (p.currentStock || 0) > 0 && p.currentStock <= p.minimumStock).length;
    const healthy = products.filter(p => (p.currentStock || 0) > p.minimumStock).length;
    const totalValuation = products.reduce((acc, p) => acc + ((p.currentStock || 0) * (p.purchasePrice || 0)), 0);

    return { totalProducts, totalUnits, outOfStock, lowStock, healthy, totalValuation };
  }, [products]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const map = new Map();
    products.forEach(p => {
      if (p.categoryId && typeof p.categoryId === 'object' && p.categoryId._id) {
        map.set(p.categoryId._id, p.categoryId.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      const matchSearch = 
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      // Status
      const current = p.currentStock || 0;
      const min = p.minimumStock || 0;
      if (statusFilter === 'OUT' && current !== 0) return false;
      if (statusFilter === 'LOW' && (current === 0 || current > min)) return false;
      if (statusFilter === 'HEALTHY' && current <= min) return false;

      // Category
      if (categoryFilter !== 'ALL') {
        const catId = p.categoryId?._id || p.categoryId;
        if (catId !== categoryFilter) return false;
      }

      return true;
    });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const prodName = m.productId?.name || '';
      const ref = m.referenceType || '';
      const note = m.note || '';

      const matchSearch = 
        !ledgerSearch.trim() ||
        prodName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        ref.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        note.toLowerCase().includes(ledgerSearch.toLowerCase());

      if (!matchSearch) return false;

      if (ledgerTypeFilter !== 'ALL' && m.type !== ledgerTypeFilter) return false;

      return true;
    });
  }, [movements, ledgerSearch, ledgerTypeFilter]);

  // Reset page when Available Stock filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter]);

  // Reset ledger page when Ledger filters change
  useEffect(() => {
    setLedgerPage(1);
  }, [ledgerSearch, ledgerTypeFilter]);

  // Available Stock Pagination calculations
  const totalStockFiltered = filteredProducts.length;
  const totalStockPages = Math.max(1, Math.ceil(totalStockFiltered / pageSize));

  useEffect(() => {
    if (currentPage > totalStockPages) {
      setCurrentPage(totalStockPages);
    }
  }, [totalStockPages, currentPage]);

  const stockStartIndex = (currentPage - 1) * pageSize;
  const stockEndIndex = Math.min(stockStartIndex + pageSize, totalStockFiltered);
  const paginatedStockProducts = useMemo(() => {
    return filteredProducts.slice(stockStartIndex, stockEndIndex);
  }, [filteredProducts, stockStartIndex, stockEndIndex]);

  // Stock Ledger Pagination calculations
  const totalLedgerFiltered = filteredMovements.length;
  const totalLedgerPages = Math.max(1, Math.ceil(totalLedgerFiltered / ledgerPageSize));

  useEffect(() => {
    if (ledgerPage > totalLedgerPages) {
      setLedgerPage(totalLedgerPages);
    }
  }, [totalLedgerPages, ledgerPage]);

  const ledgerStartIndex = (ledgerPage - 1) * ledgerPageSize;
  const ledgerEndIndex = Math.min(ledgerStartIndex + ledgerPageSize, totalLedgerFiltered);
  const paginatedLedgerMovements = useMemo(() => {
    return filteredMovements.slice(ledgerStartIndex, ledgerEndIndex);
  }, [filteredMovements, ledgerStartIndex, ledgerEndIndex]);

  // Helper to switch to ledger for a specific product
  const handleViewProductHistory = (productName) => {
    setLedgerSearch(productName);
    setLedgerTypeFilter('ALL');
    setActiveTab('ledger');
  };

  const getStockStatusBadge = (current, min) => {
    if (current === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertOctagon size={13} className="text-rose-600" />
          Out of Stock
        </span>
      );
    }
    if (current <= min) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle size={13} className="text-amber-600" />
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={13} className="text-emerald-600" />
        In Stock
      </span>
    );
  };

  const getLedgerTypeBadge = (type) => {
    switch (type) {
      case 'IN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ArrowDownLeft size={13} className="text-indigo-600" />
            Purchase (IN)
          </span>
        );
      case 'OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowUpRight size={13} className="text-emerald-600" />
            Sale (OUT)
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <SlidersHorizontal size={13} className="text-amber-600" />
            Adjustment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Boxes className="text-indigo-600" size={28} />
            Stock Management
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor real-time inventory levels, stock health indicators, and movement history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
            title="Refresh stock levels"
          >
            <RefreshCw size={15} className={`${loading ? 'animate-spin text-indigo-600' : 'text-gray-500'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Modern Segmented Tab Switcher */}
      <div className="flex items-center p-1.5 bg-gray-100 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'available'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package size={16} />
          <span>Available Stock</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            activeTab === 'available' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-200 text-gray-700'
          }`}>
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'ledger'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <History size={16} />
          <span>Stock Ledger</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            activeTab === 'ledger' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-200 text-gray-700'
          }`}>
            {movements.length}
          </span>
        </button>
      </div>

      {/* Content for Available Stock */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Quick Metrics KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Items */}
            <div 
              onClick={() => setStatusFilter('ALL')}
              className={`cursor-pointer bg-white rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow-md ${
                statusFilter === 'ALL' ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Products</span>
                <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Package size={18} />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</span>
                <span className="text-xs text-gray-500">({metrics.totalUnits} units total)</span>
              </div>
              <p className="mt-1 text-xs text-indigo-600 font-medium">Click to show all</p>
            </div>

            {/* In Stock / Healthy */}
            <div 
              onClick={() => setStatusFilter(statusFilter === 'HEALTHY' ? 'ALL' : 'HEALTHY')}
              className={`cursor-pointer bg-white rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow-md ${
                statusFilter === 'HEALTHY' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Stock</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={18} />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-700">{metrics.healthy}</span>
                <span className="text-xs text-emerald-600 font-medium">Adequate</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">Above minimum threshold</p>
            </div>

            {/* Low Stock Alerts */}
            <div 
              onClick={() => setStatusFilter(statusFilter === 'LOW' ? 'ALL' : 'LOW')}
              className={`cursor-pointer bg-white rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow-md ${
                statusFilter === 'LOW' ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/20' : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Stock</span>
                <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle size={18} />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-700">{metrics.lowStock}</span>
                <span className="text-xs font-semibold text-amber-600 px-1.5 py-0.5 rounded bg-amber-100">
                  Needs Reorder
                </span>
              </div>
              <p className="mt-1 text-xs text-amber-700 font-medium">Click to filter</p>
            </div>

            {/* Out of Stock & Inventory Valuation */}
            <div 
              onClick={() => {
                if (metrics.outOfStock > 0) {
                  setStatusFilter(statusFilter === 'OUT' ? 'ALL' : 'OUT');
                }
              }}
              className={`cursor-pointer bg-white rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow-md ${
                metrics.outOfStock > 0 
                  ? (statusFilter === 'OUT' ? 'border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' : 'border-rose-200 hover:border-rose-300')
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Valuation</span>
                <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <IndianRupee size={18} />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">{formatCurrency(metrics.totalValuation)}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {metrics.outOfStock > 0 ? (
                  <span className="text-rose-600 font-bold">{metrics.outOfStock} items out of stock!</span>
                ) : (
                  <span>0 out of stock items</span>
                )}
              </p>
            </div>
          </div>

          {/* Search, Filter & Quick-action Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search by product name or SKU"
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Category Filter */}
              {categories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}

              {/* Status Filter Buttons */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-md transition ${
                    statusFilter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setStatusFilter('LOW')}
                  className={`px-3 py-1 rounded-md transition ${
                    statusFilter === 'LOW' ? 'bg-amber-100 text-amber-900 shadow-sm font-bold' : 'text-gray-600 hover:text-amber-800'
                  }`}
                >
                  Low Stock ({metrics.lowStock})
                </button>
                <button
                  onClick={() => setStatusFilter('HEALTHY')}
                  className={`px-3 py-1 rounded-md transition ${
                    statusFilter === 'HEALTHY' ? 'bg-emerald-100 text-emerald-900 shadow-sm' : 'text-gray-600 hover:text-emerald-800'
                  }`}
                >
                  In Stock ({metrics.healthy})
                </button>
                {metrics.outOfStock > 0 && (
                  <button
                    onClick={() => setStatusFilter('OUT')}
                    className={`px-3 py-1 rounded-md transition ${
                      statusFilter === 'OUT' ? 'bg-rose-100 text-rose-900 shadow-sm' : 'text-gray-600 hover:text-rose-800'
                    }`}
                  >
                    Out of Stock ({metrics.outOfStock})
                  </button>
                )}
              </div>

              {/* Reset button if filtered */}
              {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setCategoryFilter('ALL');
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Table / Card Container */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center">
                <RefreshCw size={28} className="animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">Loading inventory data...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center">
                <Package size={40} className="text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-800">No products match your criteria</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query or reset the filters to see all available stock.
                </p>
                {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                      setCategoryFilter('ALL');
                    }}
                    className="mt-4 inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              <div>
                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="bg-gray-50/80">
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Health</th>
                        <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Available Units</th>
                        <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Selling Price (MRP)</th>
                        <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Est. Stock Value</th>
                        <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {paginatedStockProducts.map((p) => {
                        const current = p.currentStock || 0;
                        const min = p.minimumStock || 0;
                        const isLow = current <= min && current > 0;
                        const isOut = current === 0;
                        const estValue = current * (p.purchasePrice || 0);

                        // Calculate visual health bar percentage (max out at 200% of min stock)
                        const safeTarget = Math.max(min * 2, 5);
                        const progressPercent = Math.min(Math.round((current / safeTarget) * 100), 100);

                        return (
                          <tr 
                            key={p._id}
                            className={`hover:bg-indigo-50/30 transition-colors ${
                              isOut ? 'bg-rose-50/20' : isLow ? 'bg-amber-50/20' : ''
                            }`}
                          >
                            {/* Product Info */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 text-sm">{p.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  {p.brand && (
                                    <span className="text-xs text-gray-400 font-medium">Brand: {p.brand}</span>
                                  )}
                                  {p.categoryId && (
                                    <CategoryBadge category={p.categoryId} />
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* SKU */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                                {p.sku || 'N/A'}
                              </span>
                            </td>

                            {/* Stock Health & Visual Bar */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                {getStockStatusBadge(current, min)}
                                <div className="w-28 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isOut ? 'bg-rose-500 w-0' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.max(progressPercent, 4)}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Available Stock */}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`text-base font-extrabold ${
                                isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-gray-900'
                              }`}>
                                {current}
                              </span>
                              <span className="text-xs text-gray-400 ml-1 font-medium">{p.unit || 'pcs'}</span>
                            </td>

                            {/* Selling Price (MRP) & Margin */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <span className="font-bold text-gray-900">{formatCurrency(p.mrp || 0)}</span>
                              {p.purchasePrice > 0 && p.mrp > p.purchasePrice && (
                                <div className="text-[11px] text-emerald-600 font-semibold">
                                  +{Math.round(((p.mrp - p.purchasePrice) / p.mrp) * 100)}% margin
                                </div>
                              )}
                            </td>

                            {/* Estimated Value */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <span className="font-semibold text-gray-800">{formatCurrency(estValue)}</span>
                              <div className="text-[11px] text-gray-400 font-normal">
                                @ {formatCurrency(p.purchasePrice || 0)}/unit
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleViewProductHistory(p.name)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition"
                                title="View stock ledger history for this product"
                              >
                                <History size={13} />
                                <span>History</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile / Tablet Card View */}
                <div className="lg:hidden divide-y divide-gray-100">
                  {paginatedStockProducts.map((p) => {
                    const current = p.currentStock || 0;
                    const min = p.minimumStock || 0;
                    const isLow = current <= min && current > 0;
                    const isOut = current === 0;
                    const estValue = current * (p.purchasePrice || 0);

                    return (
                      <div 
                        key={p._id} 
                        className={`p-4 flex flex-col gap-3 ${
                          isOut ? 'bg-rose-50/25' : isLow ? 'bg-amber-50/25' : 'bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{p.name}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                SKU: {p.sku}
                              </span>
                              {p.categoryId && <CategoryBadge category={p.categoryId} />}
                            </div>
                          </div>
                          <div>{getStockStatusBadge(current, min)}</div>
                        </div>

                        {/* Numbers Grid */}
                        <div className="grid grid-cols-3 gap-2 bg-gray-50/80 p-3 rounded-lg text-center border border-gray-100">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Available</span>
                            <span className={`text-base font-extrabold ${
                              isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-gray-900'
                            }`}>
                              {current} {p.unit || 'pcs'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Selling MRP</span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(p.mrp || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Value</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(estValue)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-gray-400">
                            Cost: {formatCurrency(p.purchasePrice || 0)} / {p.unit || 'pcs'}
                          </span>
                          <button
                            onClick={() => handleViewProductHistory(p.name)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md transition"
                          >
                            <History size={12} />
                            <span>View History</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Mobile View More Items Button */}
                  {stockEndIndex < totalStockFiltered && (
                    <div className="p-3 bg-gray-50/70 border-t border-gray-100">
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalStockPages, p + 1))}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <span>View More Items ({totalStockFiltered - stockEndIndex} remaining)</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Available Stock Pagination & Navigation Footer */}
                <div className="bg-gray-50 px-4 sm:px-6 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                  {/* Count & Page Size */}
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <span className="font-medium">
                      Showing <span className="font-bold text-gray-900">{totalStockFiltered === 0 ? 0 : stockStartIndex + 1}</span> to <span className="font-bold text-gray-900">{stockEndIndex}</span> of <span className="font-bold text-gray-900">{totalStockFiltered}</span> items
                      {products.length !== totalStockFiltered && (
                        <span className="text-gray-400 ml-1">({products.length} total)</span>
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
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  {/* View More Button + Page Controls */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    {stockEndIndex < totalStockFiltered && (
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalStockPages, p + 1))}
                        className="hidden lg:inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition"
                      >
                        <span>View More (+{Math.min(pageSize, totalStockFiltered - stockEndIndex)})</span>
                        <ArrowRight size={13} />
                      </button>
                    )}

                    <div className="inline-flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                      {/* Previous Page */}
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* Page numbers */}
                      {Array.from({ length: totalStockPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (totalStockPages <= 5) return true;
                          return page === 1 || page === totalStockPages || Math.abs(page - currentPage) <= 1;
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
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-[28px] h-7 px-2 text-xs font-bold rounded transition ${
                                  currentPage === page
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
                        onClick={() => setCurrentPage(p => Math.min(totalStockPages, p + 1))}
                        disabled={currentPage === totalStockPages}
                        className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition"
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
        </div>
      )}

      {/* Content for Stock Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Ledger Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                aria-label="Search product, invoice, or note"
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              {ledgerSearch && (
                <button
                  onClick={() => setLedgerSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Movement Type Filter */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-semibold w-full md:w-auto">
              <button
                onClick={() => setLedgerTypeFilter('ALL')}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-md transition ${
                  ledgerTypeFilter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Movements
              </button>
              <button
                onClick={() => setLedgerTypeFilter('IN')}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-md transition ${
                  ledgerTypeFilter === 'IN' ? 'bg-indigo-100 text-indigo-900 shadow-sm' : 'text-gray-600 hover:text-indigo-900'
                }`}
              >
                Purchases (IN)
              </button>
              <button
                onClick={() => setLedgerTypeFilter('OUT')}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-md transition ${
                  ledgerTypeFilter === 'OUT' ? 'bg-emerald-100 text-emerald-900 shadow-sm' : 'text-gray-600 hover:text-emerald-900'
                }`}
              >
                Sales (OUT)
              </button>
              <button
                onClick={() => setLedgerTypeFilter('ADJUSTMENT')}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-md transition ${
                  ledgerTypeFilter === 'ADJUSTMENT' ? 'bg-amber-100 text-amber-900 shadow-sm' : 'text-gray-600 hover:text-amber-900'
                }`}
              >
                Adjustments
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center">
                <RefreshCw size={28} className="animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">Loading ledger records...</p>
              </div>
            ) : filteredMovements.length === 0 ? (
              <div className="py-16 text-center">
                <History size={40} className="text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-800">No stock movements found</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  There are no recorded transactions matching your search filters.
                </p>
                {(ledgerSearch || ledgerTypeFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setLedgerSearch('');
                      setLedgerTypeFilter('ALL');
                    }}
                    className="mt-4 inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                  >
                    Reset ledger filters
                  </button>
                )}
              </div>
            ) : (
              <div>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="bg-gray-50/80">
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action Type</th>
                        <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity Change</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reference (Invoice)</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {paginatedLedgerMovements.map((m) => (
                        <tr key={m._id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                            {formatDate(m.createdAt, true)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {m.productId?.name || 'Unknown Product'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getLedgerTypeBadge(m.type)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold ${
                            m.type === 'IN' ? 'text-indigo-600' : m.type === 'OUT' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {m.type === 'IN' ? `+${m.quantity}` : (m.type === 'OUT' ? `-${m.quantity}` : m.quantity)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                            {m.referenceType ? (
                              <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                {m.referenceType}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                            {m.note || <span className="text-gray-300">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                  {paginatedLedgerMovements.map((m) => (
                    <div key={m._id} className="p-4 flex flex-col gap-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{m.productId?.name || 'Unknown Product'}</h4>
                          <span className="text-[11px] text-gray-400">{formatDate(m.createdAt, true)}</span>
                        </div>
                        <div>{getLedgerTypeBadge(m.type)}</div>
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg text-xs">
                        <div>
                          <span className="text-gray-400">Ref: </span>
                          <span className="font-mono text-gray-700 font-medium">{m.referenceType || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Qty: </span>
                          <span className={`font-extrabold ${
                            m.type === 'IN' ? 'text-indigo-600' : m.type === 'OUT' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {m.type === 'IN' ? `+${m.quantity}` : (m.type === 'OUT' ? `-${m.quantity}` : m.quantity)}
                          </span>
                        </div>
                      </div>

                      {m.note && (
                        <div className="text-xs text-gray-500 italic bg-amber-50/50 px-2 py-1 rounded border border-amber-100">
                          {m.note}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Mobile View More Movements */}
                  {ledgerEndIndex < totalLedgerFiltered && (
                    <div className="p-3 bg-gray-50/70 border-t border-gray-100">
                      <button
                        onClick={() => setLedgerPage(p => Math.min(totalLedgerPages, p + 1))}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <span>View More Movements ({totalLedgerFiltered - ledgerEndIndex} remaining)</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Ledger Pagination Footer */}
                <div className="bg-gray-50 px-4 sm:px-6 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                  {/* Count & Page Size */}
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <span className="font-medium">
                      Showing <span className="font-bold text-gray-900">{totalLedgerFiltered === 0 ? 0 : ledgerStartIndex + 1}</span> to <span className="font-bold text-gray-900">{ledgerEndIndex}</span> of <span className="font-bold text-gray-900">{totalLedgerFiltered}</span> transactions
                      {movements.length !== totalLedgerFiltered && (
                        <span className="text-gray-400 ml-1">({movements.length} total)</span>
                      )}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 font-medium">Per page:</span>
                      <select
                        value={ledgerPageSize}
                        onChange={(e) => {
                          setLedgerPageSize(Number(e.target.value));
                          setLedgerPage(1);
                        }}
                        className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  {/* View More Button + Page Controls */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    {ledgerEndIndex < totalLedgerFiltered && (
                      <button
                        onClick={() => setLedgerPage(p => Math.min(totalLedgerPages, p + 1))}
                        className="hidden lg:inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition"
                      >
                        <span>View More (+{Math.min(ledgerPageSize, totalLedgerFiltered - ledgerEndIndex)})</span>
                        <ArrowRight size={13} />
                      </button>
                    )}

                    <div className="inline-flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                      {/* Previous Page */}
                      <button
                        onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                        disabled={ledgerPage === 1}
                        className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* Page numbers */}
                      {Array.from({ length: totalLedgerPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (totalLedgerPages <= 5) return true;
                          return page === 1 || page === totalLedgerPages || Math.abs(page - ledgerPage) <= 1;
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
                                onClick={() => setLedgerPage(page)}
                                className={`min-w-[28px] h-7 px-2 text-xs font-bold rounded transition ${
                                  ledgerPage === page
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
                        onClick={() => setLedgerPage(p => Math.min(totalLedgerPages, p + 1))}
                        disabled={ledgerPage === totalLedgerPages}
                        className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition"
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
        </div>
      )}
    </div>
  );
};

export default Stock;
