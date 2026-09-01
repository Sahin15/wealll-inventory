import React, { useState, useEffect } from 'react';
import { Save, Settings, Monitor, Mail, Receipt, Calendar, Shield, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useDialog } from '../../context/DialogContext';

const GlobalSettings = () => {
  const { confirm, alert } = useDialog();
  const [settings, setSettings] = useState({
    platformName: '',
    supportEmail: '',
    defaultTaxRate: 0,
    maintenanceMode: false,
    announcementText: '',
    freeTrialDays: 14
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
    const isConfirmed = await confirm({
      title: 'Save Global Settings',
      message: 'Are you sure you want to apply these system-wide global settings? This will affect all new and existing tenants.',
      type: 'warning',
      confirmText: 'Yes, Save Settings'
    });

    if (!isConfirmed) return;

    setSaving(true);
    try {
      await api.put('/superadmin/settings', settings);      
      alert({
        title: 'Settings Saved',
        message: 'Global settings saved successfully!',
        type: 'success',
        confirmText: 'Great'
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 p-8 shadow-lg">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Settings className="w-8 h-8 text-indigo-100" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Global Settings</h2>
            <p className="mt-2 text-indigo-200 font-medium">Manage system-wide configuration, defaults, and platform controls.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <Monitor className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Platform Configuration</h3>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-gray-400" /> Platform Name
                </label>
                <input 
                  type="text" 
                  name="platformName" 
                  value={settings.platformName || ''} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900 bg-gray-50 hover:bg-white focus:bg-white outline-none" 
                  placeholder="e.g. WeAlll Inventory"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" /> Support Email
                </label>
                <input 
                  type="email" 
                  name="supportEmail" 
                  value={settings.supportEmail || ''} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900 bg-gray-50 hover:bg-white focus:bg-white outline-none" 
                  placeholder="support@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-gray-400" /> Default Tax Rate
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="defaultTaxRate" 
                    value={settings.defaultTaxRate !== undefined && settings.defaultTaxRate !== null ? settings.defaultTaxRate : ''} 
                    onChange={handleChange} 
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900 bg-gray-50 hover:bg-white focus:bg-white outline-none" 
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 font-medium">%</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" /> Free Trial Duration
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="freeTrialDays" 
                    value={settings.freeTrialDays === undefined ? 14 : settings.freeTrialDays} 
                    onChange={handleChange} 
                    className="w-full pl-4 pr-16 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900 bg-gray-50 hover:bg-white focus:bg-white outline-none" 
                    min="0"
                    step="1"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 font-medium">Days</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Controls Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="px-8 py-6 border-b border-red-100 bg-red-50/30 flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">System Controls</h3>
          </div>
          
          <div className="p-8 space-y-8">
            
            {/* Maintenance Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-start gap-4 mb-4 sm:mb-0">
                <div className={`p-2 rounded-lg mt-1 ${settings.maintenanceMode ? 'bg-red-100' : 'bg-gray-200'}`}>
                  <AlertTriangle className={`w-5 h-5 ${settings.maintenanceMode ? 'text-red-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Maintenance Mode</h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-lg">
                    When enabled, the system will block all non-superadmin users and display a maintenance page.
                  </p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 self-end sm:self-center">
                <input 
                  type="checkbox" 
                  name="maintenanceMode" 
                  checked={settings.maintenanceMode || false} 
                  onChange={handleChange} 
                  className="sr-only peer" 
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {/* Announcement Text */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" /> Global Announcement Message
              </label>
              <textarea 
                name="announcementText" 
                value={settings.announcementText || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-gray-900 bg-gray-50 hover:bg-white focus:bg-white outline-none resize-none" 
                rows="4"
                placeholder="Type an announcement to display across all tenant dashboards (e.g., 'Scheduled maintenance this Friday at 10 PM EST...')"
              ></textarea>
            </div>

          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="sticky bottom-6 flex justify-end">
          <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-gray-200/50 flex items-center gap-4">
            <span className="text-sm text-gray-500 font-medium mr-4 hidden sm:inline-block">Unsaved changes will be lost</span>
            <button 
              type="submit" 
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white font-semibold shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default GlobalSettings;
