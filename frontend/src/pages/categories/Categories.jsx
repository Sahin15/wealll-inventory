import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CategoryBadge from '../../components/CategoryBadge';
import { AuthContext } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';

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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#e5e7eb');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { user } = React.useContext(AuthContext);
  const canManage = hasPermission(user?.role, 'categories.manage');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name, description, color });
      } else {
        await api.post('/categories', { name, description, color });
      }
      handleCancel();
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save category');
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color || '#e5e7eb');
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setColor('#e5e7eb');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Categories
        </h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {canManage && (
          <div className="md:w-1/3">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{editingId ? 'Edit Category' : 'Add Category'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Color</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_COLORS.map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setColor(c.hex)}
                        title={c.name}
                        className={`w-8 h-8 rounded-full border-2 focus:outline-none transition-transform hover:scale-110 ${color === c.hex ? 'border-gray-900 shadow-md scale-110' : 'border-transparent shadow-sm'}`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
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
        )}
        
        <div className={canManage ? "md:w-2/3" : "w-full"}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full md:w-1/2"
            />
          </div>
          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No categories found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories
                    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((cat) => (
                    <tr key={cat._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CategoryBadge category={cat} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.description}</td>
                      {canManage && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(cat)} className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
