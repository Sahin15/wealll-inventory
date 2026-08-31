import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatDate } from '../../utils/dateFormatter';

const TenantManager = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studioName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    businessType: 'Makeup Artist / Makeup Studio',
    businessPhone: '',
    businessAddress: '',
    city: '',
    state: '',
    pinCode: '',
    gstin: ''
  });

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/superadmin/tenants');
      setTenants(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/superadmin/tenants', formData);
      setFormData({ 
        studioName: '', adminName: '', adminEmail: '', adminPassword: '',
        businessType: 'Makeup Artist / Makeup Studio', businessPhone: '', businessAddress: '',
        city: '', state: '', pinCode: '', gstin: ''
      });
      setShowForm(false);
      fetchTenants();
      alert('Client successfully onboarded!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to onboard client');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Registered Clients</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary bg-indigo-600 hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Onboard New Client'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 border-l-4 border-indigo-600">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Client Environment</h3>
          <p className="text-sm text-gray-500 mb-4">This will create a new isolated tenant and their first Admin account.</p>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Studio / Business Name</label>
                <input type="text" required value={formData.studioName} onChange={e => setFormData({...formData, studioName: e.target.value})} className="input-field mt-1" autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Type</label>
                <select required value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})} className="input-field mt-1">
                  <option value="Makeup Artist / Makeup Studio">Makeup Artist / Makeup Studio</option>
                  <option value="Salon">Salon</option>
                  <option value="Beauty Business">Beauty Business</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                <input type="text" required value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} className="input-field mt-1" autoComplete="off" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                <input type="email" required value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="input-field mt-1" autoComplete="new-email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Starting Password</label>
                <input type="password" required value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} className="input-field mt-1" autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Phone</label>
                <input type="tel" required value={formData.businessPhone} onChange={e => setFormData({...formData, businessPhone: e.target.value})} className="input-field mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Business Address</label>
                <input type="text" required value={formData.businessAddress} onChange={e => setFormData({...formData, businessAddress: e.target.value})} className="input-field mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="input-field mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input type="text" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="input-field mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                <input type="text" required value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} className="input-field mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GSTIN (Optional)</label>
                <input type="text" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} className="input-field mt-1" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="btn-primary">Create Client</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading clients...</div>
        ) : tenants.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No clients registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Studio Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant ID</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.map((t) => (
                  <tr key={t._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.studioName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        t.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono font-medium">
                      {t.tenantCode || t._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/wealll-admin/tenants/${t._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantManager;
