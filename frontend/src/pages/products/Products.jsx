import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', sku: '', categoryId: '', purchasePrice: '', sellingPrice: '', minimumStock: ''
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
      if (catRes.data.data.length > 0) {
        setFormData(f => ({ ...f, categoryId: catRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post('/products', formData);
      }
      handleCancel();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save product');
    }
  };

  const handleEdit = (prod) => {
    setEditingId(prod._id);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      categoryId: prod.categoryId?._id || '',
      purchasePrice: prod.purchasePrice,
      sellingPrice: prod.sellingPrice,
      minimumStock: prod.minimumStock
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', categoryId: categories[0]?._id || '', purchasePrice: '', sellingPrice: '', minimumStock: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Products</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input type="text" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="input-field mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="input-field mt-1">
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Price (₹)</label>
                  <input type="number" step="0.01" required value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} className="input-field mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price (₹)</label>
                  <input type="number" step="0.01" required value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} className="input-field mt-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Stock</label>
                <input type="number" required value={formData.minimumStock} onChange={e => setFormData({...formData, minimumStock: e.target.value})} className="input-field mt-1" />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="btn-primary flex-1">{editingId ? 'Update' : 'Save'}</button>
                {editingId && (
                  <button type="button" onClick={handleCancel} className="btn-primary bg-gray-500 hover:bg-gray-600 flex-1">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full md:w-1/2"
            />
          </div>
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : products.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No products found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products
                      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((prod) => (
                      <tr key={prod._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{prod.name}</div>
                          <div className="text-sm text-gray-500">SKU: {prod.sku}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prod.categoryId?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <span className={prod.currentStock <= prod.minimumStock ? 'text-red-600' : 'text-gray-900'}>
                            {prod.currentStock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(prod.sellingPrice)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(prod)} className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
