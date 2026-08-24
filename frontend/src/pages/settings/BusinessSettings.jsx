import React, { useState, useEffect } from 'react';
import { Save, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const BusinessSettings = () => {
  const [settings, setSettings] = useState({
    businessName: '',
    ownerName: '',
    businessPhone: '',
    businessAddress: '',
    taxRate: 0,
    invoiceHeaderText: '',
    invoiceFooterText: '',
    appName: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/tenants/settings');
      setSettings({
        businessName: res.data.data.businessName || '',
        ownerName: res.data.data.ownerName || '',
        businessPhone: res.data.data.businessPhone || '',
        businessAddress: res.data.data.businessAddress || '',
        taxRate: res.data.data.taxRate || 0,
        invoiceHeaderText: res.data.data.invoiceHeaderText || '',
        invoiceFooterText: res.data.data.invoiceFooterText || '',
        appName: res.data.data.appName || 'WeAlll Inventory',
        logoUrl: res.data.data.logoUrl || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/tenants/settings', settings);
      setMessage('Settings updated successfully!');
      setTimeout(() => {
        setMessage('');
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingLogo(true);
    try {
      const res = await api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setSettings({ ...settings, logoUrl: res.data.data.url });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {/* Toast Notification */}
          {message && (
            <div className="fixed top-5 right-5 z-50 animate-fade-in-down transition-all duration-300">
              <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl border-l-4 ${
                message.includes('success') 
                  ? 'bg-white border-green-500 text-gray-800' 
                  : 'bg-white border-red-500 text-gray-800'
              }`}>
                {message.includes('success') ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500" />
                )}
                <p className="font-medium text-sm">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-2 mb-6 text-gray-700 border-b pb-4">
              <Building2 className="w-5 h-5" />
              <h2 className="text-lg font-medium">Business Profile</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
                <h3 className="text-sm font-semibold text-indigo-900 mb-4">Branding & Identity</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">App Name (replaces "WeAlll Inventory")</label>
                    <input
                      type="text"
                      value={settings.appName}
                      onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Logo Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingLogo}
                      className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100 border border-gray-300 rounded-md p-1"
                    />
                    {uploadingLogo && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                    {settings.logoUrl && (
                      <div className="mt-3 p-2 border border-gray-200 rounded-md inline-block bg-gray-50 relative group">
                        <img src={settings.logoUrl} alt="Logo Preview" className="h-16 object-contain mix-blend-multiply" onError={(e) => e.target.style.display = 'none'} />
                        <button type="button" onClick={() => setSettings({...settings, logoUrl: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <input
                  type="text"
                  required
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Owner / Admin Name</label>
                <input
                  type="text"
                  value={settings.ownerName}
                  onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Business Phone Number</label>
                <input
                  type="text"
                  value={settings.businessPhone}
                  onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Business Address</label>
                <textarea
                  value={settings.businessAddress}
                  onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                  className="mt-1 block w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice Header Text (e.g. GST Number, Tagline)</label>
                <input
                  type="text"
                  value={settings.invoiceHeaderText}
                  onChange={(e) => setSettings({ ...settings, invoiceHeaderText: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice Footer Message</label>
                <input
                  type="text"
                  value={settings.invoiceFooterText}
                  onChange={(e) => setSettings({ ...settings, invoiceFooterText: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                />
              </div>

            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;
