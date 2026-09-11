import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Edit2, 
  Search, 
  X, 
  Tag, 
  Palette, 
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import CategoryBadge from '../../components/CategoryBadge';
import { AuthContext } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';
import AdaptiveSheet from '../../components/mobile/AdaptiveSheet';

const CATEGORY_COLORS = [
  { name: 'Gray', hex: '#e5e7eb' },
  { name: 'Pink', hex: '#fbcfe8' },
  { name: 'Rose', hex: '#fecdd3' },
  { name: 'Peach', hex: '#ffedd5' },
  { name: 'Orange', hex: '#fed7aa' },
  { name: 'Yellow', hex: '#fef08a' },
  { name: 'Green', hex: '#bbf7d0' },
  { name: 'Mint', hex: '#a7f3d0' },
  { name: 'Teal', hex: '#99f6e4' },
  { name: 'Sky', hex: '#bae6fd' },
  { name: 'Blue', hex: '#bfdbfe' },
  { name: 'Lavender', hex: '#e9d5ff' },
  { name: 'Purple', hex: '#d8b4fe' }
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#e5e7eb');

  // Search Filter
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = React.useContext(AuthContext);
  const canManage = hasPermission(user?.role, 'categories.manage');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products').catch(() => ({ data: { data: [] } }))
      ]);
      setCategories(catRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setColor('#e5e7eb');
    setIsModalOpen(true);
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setColor(cat.color || '#e5e7eb');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setColor('#e5e7eb');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required');

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name: name.trim(), description: description.trim(), color });
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', { name: name.trim(), description: description.trim(), color });
        toast.success('Category created successfully');
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute products count per category
  const productCountMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const cId = p.categoryId?._id || p.categoryId;
      if (cId) {
        map[cId] = (map[cId] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return categories.filter(c => {
      return !q || c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
    });
  }, [categories, searchTerm]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 flex items-center gap-2">
            <Tag className="text-indigo-600" size={26} />
            Categories
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Organize your beauty products and inventory into branded, color-coded categories.
          </p>
        </div>

        {canManage && (
          <button 
            onClick={openAddModal}
            className="btn-primary inline-flex items-center justify-center gap-2 shadow-sm py-2.5 px-4 font-semibold text-sm"
          >
            <Plus size={18} />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      {canManage && (
        <button
          onClick={openAddModal}
          className="sm:hidden fixed bottom-20 right-4 z-40 bg-indigo-600 text-white rounded-full p-4 shadow-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[56px] min-w-[56px] flex items-center justify-center"
          title="Add Category"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Stats and Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Categories Stat Card */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-5 flex items-center border-l-4 border-indigo-600">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 mr-4">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Categories</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{categories.length}</p>
          </div>
        </div>

        {/* Search Bar Container */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm md:col-span-2 flex items-center">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full-Width Categories Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <Tag className="text-gray-400" size={24} />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {searchTerm 
                ? 'No categories match your search criteria.' 
                : 'Get started by creating your first product category.'}
            </p>
            {canManage && (
              <button 
                onClick={openAddModal} 
                className="mt-4 btn-primary inline-flex items-center gap-2 text-xs py-2 px-3.5"
              >
                <Plus size={15} />
                <span>Add Category</span>
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Badge Preview</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category Name</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Products</th>
                    {canManage && (
                      <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredCategories.map((cat) => {
                    const prodCount = productCountMap[cat._id] || 0;
                    return (
                      <tr key={cat._id} className="hover:bg-indigo-50/25 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <CategoryBadge category={cat} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-900 text-sm">{cat.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                          {cat.description || <span className="text-gray-300 italic">No description provided</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                            {prodCount} products
                          </span>
                        </td>
                        {canManage && (
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button 
                              onClick={() => handleEdit(cat)} 
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
              {filteredCategories.map((cat) => {
                const prodCount = productCountMap[cat._id] || 0;
                return (
                  <div key={cat._id} className="p-4 flex flex-col gap-2.5 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <CategoryBadge category={cat} />
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                        {prodCount} products
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                    )}
                    {canManage && (
                      <div className="pt-2 flex justify-end border-t border-gray-50">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Showing {filteredCategories.length} of {categories.length} categories</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT CATEGORY MODAL (AdaptiveSheet)                                 */}
      {/* ========================================================================= */}
      <AdaptiveSheet
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Category' : 'Add New Category'}
        subtitle={editingId ? 'Update category name, badge color, and description' : 'Create a category to classify your inventory'}
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition min-h-[44px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="category-form"
              disabled={submitting}
              className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm rounded-xl min-h-[44px] cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <span>{editingId ? 'Update Category' : 'Create Category'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Beverages, Electronics"
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition min-h-[44px]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about this category"
              className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Color Swatches */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette size={14} className="text-indigo-600" />
              <span>Badge Color</span>
            </label>
            <div className="grid grid-cols-7 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
              {CATEGORY_COLORS.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full border-2 focus:outline-none transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                    color === c.hex ? 'border-gray-900 shadow-md scale-110 ring-2 ring-indigo-400' : 'border-white shadow-xs'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            {/* Live Preview */}
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-white p-2.5 rounded-xl border border-gray-100">
              <span className="font-semibold">Live Preview:</span>
              <CategoryBadge category={{ name: name || 'Preview', color }} />
            </div>
          </div>
        </form>
      </AdaptiveSheet>
    </div>
  );
};

export default Categories;
