import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Edit2, 
  Package, 
  Search, 
  X, 
  Boxes, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import CategoryBadge from '../../components/CategoryBadge';
import AdaptiveSheet from '../../components/mobile/AdaptiveSheet';
import { AuthContext } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { user } = React.useContext(AuthContext);
  const canManage = hasPermission(user?.role, 'products.manage');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: '',
    categoryId: '',
    unit: 'pcs',
    purchasePrice: '',
    mrp: '',
    minimumStock: '2'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data.data || []);
      setCategories(catRes.data.data || []);
      if (catRes.data.data?.length > 0 && !formData.categoryId) {
        setFormData(f => ({ ...f, categoryId: catRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      sku: '',
      brand: '',
      categoryId: categories[0]?._id || '',
      unit: 'pcs',
      purchasePrice: '',
      mrp: '',
      minimumStock: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (prod) => {
    setEditingId(prod._id);
    setFormData({
      name: prod.name || '',
      sku: prod.sku || '',
      brand: prod.brand || '',
      categoryId: prod.categoryId?._id || prod.categoryId || (categories[0]?._id || ''),
      unit: prod.unit || 'pcs',
      purchasePrice: prod.purchasePrice ?? '',
      mrp: prod.mrp ?? '',
      minimumStock: prod.minimumStock ?? '2'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Product name is required');
    if (!formData.sku.trim()) return toast.error('Product SKU is required');
    if (!formData.categoryId) return toast.error('Category is required');

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        purchasePrice: Number(formData.purchasePrice) || 0,
        mrp: Number(formData.mrp) || 0,
        minimumStock: Number(formData.minimumStock) || 0
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully');
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (categoryFilter !== 'ALL') {
        const catId = p.categoryId?._id || p.categoryId;
        if (catId !== categoryFilter) return false;
      }

      return true;
    });
  }, [products, searchTerm, categoryFilter]);

  // Quick Stats
  const totalProducts = products.length;
  const lowStockProducts = useMemo(() => 
    products.filter(p => (p.currentStock || 0) <= (p.minimumStock || 0)).length,
    [products]
  );
  const totalStockUnits = useMemo(() => 
    products.reduce((sum, p) => sum + (Number(p.currentStock) || 0), 0),
    [products]
  );
  const totalInventoryValue = useMemo(() => 
    products.reduce((sum, p) => sum + ((Number(p.currentStock) || 0) * (Number(p.purchasePrice) || 0)), 0),
    [products]
  );

  // Pagination calculations
  const totalFiltered = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // Auto-reset page when filter changes or if out of bounds
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 flex items-center gap-2">
            <Boxes className="text-indigo-600" size={26} />
            Products Catalog
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your product inventory, pricing, SKU codes, and reorder thresholds.
          </p>
        </div>

        {canManage && (
          <button 
            onClick={openAddModal}
            className="btn-primary inline-flex items-center justify-center gap-2 shadow-sm py-2.5 px-4 font-semibold text-sm"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Products Option / KPI */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Products</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              {totalProducts}
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              {categories.length} active {categories.length === 1 ? 'category' : 'categories'}
              {searchTerm || categoryFilter !== 'ALL' ? ` (${totalFiltered} matched)` : ''}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
            <Package size={24} />
          </div>
        </div>

        {/* In-Stock Units & Valuation */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Stock Units</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {totalStockUnits.toLocaleString()}
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              Value: {formatCurrency(totalInventoryValue)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
            <Layers size={24} />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Stock Health</span>
            <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${lowStockProducts > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {lowStockProducts}
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              {lowStockProducts > 0 ? `${lowStockProducts} item(s) low stock` : 'All inventory levels healthy'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-inner ${
            lowStockProducts > 0 
              ? 'bg-amber-50 border-amber-100 text-amber-600' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-600'
          }`}>
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      {canManage && (
        <button
          onClick={openAddModal}
          className="sm:hidden fixed bottom-20 right-4 z-40 bg-indigo-600 text-white rounded-full p-4 shadow-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[56px] min-w-[56px] flex items-center justify-center"
          title="Add New Product"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            aria-label="Search products by name, SKU, or brand"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories ({totalProducts})</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          )}

          {(searchTerm || categoryFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('ALL');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Products Full-Width Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <Package className="text-gray-400" size={24} />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {searchTerm || categoryFilter !== 'ALL' 
                ? 'No products match your search filter criteria.' 
                : 'Get started by creating your first product.'}
            </p>
            {canManage && (
              <button 
                onClick={openAddModal} 
                className="mt-4 btn-primary inline-flex items-center gap-2 text-xs py-2 px-3.5"
              >
                <Plus size={15} />
                <span>Add Product</span>
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Cost Price</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Selling MRP</th>
                    {canManage && (
                      <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedProducts.map((prod) => {
                    const isLow = (prod.currentStock || 0) <= (prod.minimumStock || 0);
                    return (
                      <tr key={prod._id} className="hover:bg-indigo-50/25 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{prod.name}</div>
                          {prod.brand && (
                            <div className="text-xs text-gray-400 font-medium">Brand: {prod.brand}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                            {prod.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {prod.categoryId ? <CategoryBadge category={prod.categoryId} /> : <span className="text-sm text-gray-400">-</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`inline-flex items-center gap-1 text-sm font-extrabold ${
                            isLow ? 'text-amber-600' : 'text-gray-900'
                          }`}>
                            {prod.currentStock || 0}
                            <span className="text-xs text-gray-400 font-normal ml-0.5">{prod.unit || 'pcs'}</span>
                          </span>
                          {isLow && (
                            <div className="text-[10px] font-bold text-amber-600">Low Stock (Min: {prod.minimumStock})</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 font-medium">
                          {formatCurrency(prod.purchasePrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-gray-900">
                          {formatCurrency(prod.mrp)}
                        </td>
                        {canManage && (
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button 
                              onClick={() => handleEdit(prod)} 
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedProducts.map((prod) => {
                const current = prod.currentStock || 0;
                const min = prod.minimumStock || 0;
                const isLow = current <= min && current > 0;
                const isOut = current === 0;

                return (
                  <div 
                    key={prod._id} 
                    onClick={() => canManage && handleEdit(prod)}
                    className="p-4 flex flex-col gap-3 hover:bg-slate-50 active:bg-slate-100/70 transition cursor-pointer select-none tap-highlight-transparent"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-sm truncate">{prod.name}</div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {prod.sku}
                          </span>
                          {prod.brand && (
                            <span className="text-[11px] text-slate-500 font-medium">{prod.brand}</span>
                          )}
                          {prod.categoryId && <CategoryBadge category={prod.categoryId} />}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isOut ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Low Stock ({min})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Available</span>
                        <span className={`font-black text-sm ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                          {current} <span className="text-[10px] font-normal text-slate-500">{prod.unit || 'pcs'}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Cost</span>
                        <span className="font-semibold text-slate-700">{formatCurrency(prod.purchasePrice)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">MRP</span>
                        <span className="font-bold text-slate-900">{formatCurrency(prod.mrp)}</span>
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400">Tap card to edit</span>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(prod);
                          }} 
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 active:bg-indigo-100 rounded-lg transition min-h-[36px]"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Mobile View More Products Button */}
              {endIndex < totalFiltered && (
                <div className="p-3 bg-gray-50/70 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <span>View More Products ({totalFiltered - endIndex} remaining)</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Pagination & Navigation Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
              {/* Count & Page Size */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <span className="font-medium">
                  Showing <span className="font-bold text-gray-900">{totalFiltered === 0 ? 0 : startIndex + 1}</span> to <span className="font-bold text-gray-900">{endIndex}</span> of <span className="font-bold text-gray-900">{totalFiltered}</span> products
                  {totalProducts !== totalFiltered && (
                    <span className="text-gray-400 ml-1">({totalProducts} total)</span>
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
                {endIndex < totalFiltered && (
                  <button
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
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition"
                    title="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first, last, and pages within 1 step of currentPage
                      if (totalPages <= 5) return true;
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
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
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
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

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT ADAPTIVE SHEET                                         */}
      {/* ========================================================================= */}
      <AdaptiveSheet
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Product' : 'Add New Product'}
        subtitle={
          editingId
            ? 'Update product details, pricing, and minimum stock'
            : 'Create a new catalog item for sales and inventory'
        }
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-edit-form"
              disabled={submitting}
              className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-bold shadow-sm rounded-xl min-h-[44px] disabled:opacity-50"
            >
              {submitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <span>{editingId ? 'Update Product' : 'Create Product'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="product-edit-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[44px]"
              placeholder="e.g. Premium Cotton T-Shirt"
            />
          </div>

          {/* SKU & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                SKU Code *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[44px]"
                placeholder="e.g. SKU-1001"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Brand (Optional)
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[44px]"
                placeholder="e.g. WeAlll Standard"
              />
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[44px]"
              >
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl text-center focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[44px]"
              />
            </div>
          </div>

          {/* Prices: Purchase Cost & MRP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Purchase Cost (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                inputMode="decimal"
                value={formData.purchasePrice}
                onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Selling MRP (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                inputMode="decimal"
                value={formData.mrp}
                onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[44px]"
              />
            </div>
          </div>

          {/* Minimum Stock Alert */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Min Stock Alert Threshold *
            </label>
            <input
              type="number"
              required
              min="0"
              inputMode="numeric"
              value={formData.minimumStock}
              onChange={e => setFormData({ ...formData, minimumStock: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[44px]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              You will receive a "Low Stock" alert when inventory falls to or below this quantity.
            </p>
          </div>
        </form>
      </AdaptiveSheet>
    </div>
  );
};

export default Products;
