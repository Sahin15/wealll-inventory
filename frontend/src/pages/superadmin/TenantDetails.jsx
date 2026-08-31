import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatDate } from '../../utils/dateFormatter';
import { ArrowLeft, Edit2, Save, X, Ban, CheckCircle } from 'lucide-react';

const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchTenant = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/superadmin/tenants/${id}`);
      setTenant(res.data.data);
      setFormData(res.data.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to fetch tenant details');
      navigate('/wealll-admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!tenant) return;
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} this tenant? All associated users will be blocked from logging in if suspended.`)) return;
    
    try {
      await api.put(`/superadmin/tenants/${tenant._id}/status`, { status: newStatus });
      setTenant({ ...tenant, status: newStatus });
      setFormData({ ...formData, status: newStatus });
      alert(`Tenant successfully ${newStatus}!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update tenant status');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/superadmin/tenants/${tenant._id}`, formData);
      setTenant(formData);
      setIsEditing(false);
      alert('Tenant details updated successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading tenant details...</div>;
  if (!tenant) return <div className="p-8 text-center text-red-500">Tenant not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <button onClick={() => navigate('/wealll-admin')} className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900">
              {tenant.businessName || tenant.name}
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-mono">
                {tenant.tenantCode || tenant._id}
              </span>
            </h2>
            <p className="text-sm text-gray-500">Database ID: {tenant._id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleToggleStatus}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm transition-colors ${
              tenant.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {tenant.status === 'active' ? (
              <><Ban className="h-4 w-4 mr-2" /> Suspend Tenant</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-2" /> Activate Tenant</>
            )}
          </button>
          
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-2" /> Edit Details
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={() => { setIsEditing(false); setFormData(tenant); }}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Organization Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Details and contact information.</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${
            tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {tenant.status}
          </span>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            
            {/* Business Name */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">Business / Studio Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input type="text" name="businessName" value={formData.businessName || ''} onChange={handleChange} className="input-field max-w-lg" />
                ) : (
                  tenant.businessName || tenant.name
                )}
              </dd>
            </div>

            {/* Business Type */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">Business Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <select name="businessType" value={formData.businessType || ''} onChange={handleChange} className="input-field max-w-lg">
                    <option value="">Select...</option>
                    <option value="Makeup Artist / Makeup Studio">Makeup Artist / Makeup Studio</option>
                    <option value="Salon">Salon</option>
                    <option value="Beauty Business">Beauty Business</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  tenant.businessType || 'N/A'
                )}
              </dd>
            </div>

            {/* Admin Name (Read only) */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
              <dt className="text-sm font-medium text-gray-500">Primary Admin Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tenant.adminName || 'N/A'}</dd>
            </div>

            {/* Business Email */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">Contact Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="input-field max-w-lg" />
                ) : (
                  tenant.email || 'N/A'
                )}
              </dd>
            </div>

            {/* Business Phone */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">Phone Number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input type="tel" name="businessPhone" value={formData.businessPhone || ''} onChange={handleChange} className="input-field max-w-lg" />
                ) : (
                  tenant.businessPhone || tenant.phone || 'N/A'
                )}
              </dd>
            </div>

            {/* Address */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input type="text" name="businessAddress" value={formData.businessAddress || ''} onChange={handleChange} className="input-field max-w-lg" />
                ) : (
                  tenant.businessAddress || 'N/A'
                )}
              </dd>
            </div>

            {/* City */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">City</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input type="text" name="city" value={formData.city || ''} onChange={handleChange} className="input-field max-w-lg" />
                ) : (
                  tenant.city || 'N/A'
                )}
              </dd>
            </div>

            {/* State */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">State</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input type="text" name="state" value={formData.state || ''} onChange={handleChange} className="input-field max-w-lg" />
                ) : (
                  tenant.state || 'N/A'
                )}
              </dd>
            </div>

            {/* PIN Code */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">PIN Code</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input type="text" name="pinCode" value={formData.pinCode || ''} onChange={handleChange} className="input-field max-w-lg" />
                ) : (
                  tenant.pinCode || 'N/A'
                )}
              </dd>
            </div>

            {/* GSTIN */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">GSTIN</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input type="text" name="gstin" value={formData.gstin || ''} onChange={handleChange} className="input-field max-w-lg" />
                ) : (
                  tenant.gstin || 'N/A'
                )}
              </dd>
            </div>

            {/* Registration Date (Read only) */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
              <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(tenant.createdAt, true)}</dd>
            </div>

          </dl>
        </div>
      </div>
    </div>
  );
};

export default TenantDetails;
