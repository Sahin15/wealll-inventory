import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const GlobalSettings = () => {
  const [settings, setSettings] = useState({
    platformName: '',
    supportEmail: '',
    defaultTaxRate: 0,
    maintenanceMode: false,
    announcementText: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/superadmin/settings');
      if (res.data.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/superadmin/settings', settings);
      alert('Global settings saved successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Global Settings</h2>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Platform Name</label>
              <input 
                type="text" 
                name="platformName" 
                value={settings.platformName || ''} 
                onChange={handleChange} 
                className="input-field mt-1" 
                placeholder="WeAlll Inventory"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Support Email</label>
              <input 
                type="email" 
                name="supportEmail" 
                value={settings.supportEmail || ''} 
                onChange={handleChange} 
                className="input-field mt-1" 
                placeholder="support@wealll.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Tax Rate (%)</label>
              <input 
                type="number" 
                name="defaultTaxRate" 
                value={settings.defaultTaxRate || 0} 
                onChange={handleChange} 
                className="input-field mt-1" 
                step="0.01"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Controls</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="maintenanceMode"
                  name="maintenanceMode"
                  type="checkbox"
                  checked={settings.maintenanceMode || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900 font-medium">
                  Enable Maintenance Mode
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                When enabled, the system will show a maintenance page for all non-superadmin users. (Note: The frontend implementation for blocking users during maintenance mode would be handled separately).
              </p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Global Announcement Text</label>
                <textarea 
                  name="announcementText" 
                  value={settings.announcementText || ''} 
                  onChange={handleChange} 
                  className="input-field mt-1" 
                  rows="3"
                  placeholder="Enter a message to be displayed at the top of all user dashboards..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlobalSettings;
