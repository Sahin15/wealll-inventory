import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Edit2, 
  Package, 
  Search, 
  X, 
  Boxes, 
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import CategoryBadge from '../../components/CategoryBadge';
import { AuthContext } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  const lowStockProducts = products.filter(p => (p.currentStock || 0) <= (p.minimumStock || 0)).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 flex items-center gap-2">
            <Boxes className="text-indigo-600" size={26} />
            Products
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
            placeholder="Search products by name, SKU, brand..."
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
                  {filteredProducts.map((prod) => {
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
            <div className="md:hidden divide-y divide-gray-100">
              {filteredProducts.map((prod) => {
                const isLow = (prod.currentStock || 0) <= (prod.minimumStock || 0);
                return (
                  <div key={prod._id} className="p-4 flex flex-col gap-2.5 hover:bg-gray-50">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{prod.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                            SKU: {prod.sku}
                          </span>
                          {prod.brand && (
                            <span className="text-xs text-gray-400">{prod.brand}</span>
                          )}
                        </div>
                      </div>
                      {prod.categoryId && <CategoryBadge category={prod.categoryId} />}
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-lg text-center text-xs border border-gray-100">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Stock</span>
                        <span className={`font-extrabold ${isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                          {prod.currentStock || 0} {prod.unit || 'pcs'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Cost</span>
                        <span className="font-medium text-gray-700">{formatCurrency(prod.purchasePrice)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">MRP</span>
                        <span className="font-bold text-gray-900">{formatCurrency(prod.mrp)}</span>
                      </div>
                    </div>

                    {canManage && (
                      <div className="pt-1 flex justify-end">
                        <button 
                          onClick={() => handleEdit(prod)} 
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                        >
                          <Edit2 size={12} />
                          <span>Edit Product</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Showing {filteredProducts.length} of {products.length} products</span>
              {lowStockProducts > 0 && (
                <span className="text-amber-600 font-bold">
                  ⚠️ {lowStockProducts} product(s) low in stock
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL                                                  */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {editingId ? 'Update product details and pricing' : 'Create a new catalog item for sales and inventory'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
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
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
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
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
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
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
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
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Prices: Purchase Cost & MRP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Purchase Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.purchasePrice}
                    onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
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
                    value={formData.mrp}
                    onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
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
                  value={formData.minimumStock}
                  onChange={e => setFormData({ ...formData, minimumStock: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  You will receive a "Low Stock" warning when inventory falls to or below this quantity.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold shadow-sm"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-1">⏳</span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>{editingId ? 'Update Product' : 'Create Product'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
