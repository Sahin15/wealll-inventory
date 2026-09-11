import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Save, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Palette, 
  UserCircle, 
  Star, 
  X, 
  Upload, 
  Phone, 
  MapPin, 
  Percent, 
  FileText, 
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const MySpace = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'profile';
  });
  
  const [settings, setSettings] = useState({
    businessName: '',
    ownerName: '',
    businessPhone: '',
    businessAddress: '',
    taxRate: 0,
    invoiceHeaderText: '',
    invoiceFooterText: '',
    appName: '',
    logoUrl: '',
    brandColor: '#4f46e5'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, subRes] = await Promise.all([
        api.get('/tenants/settings'),
        api.get('/subscriptions/current').catch(() => null)
      ]);
      
      const res = settingsRes;
      setSettings({
        businessName: res.data.data.businessName || '',
        ownerName: res.data.data.ownerName || '',
        businessPhone: res.data.data.businessPhone || '',
        businessAddress: res.data.data.businessAddress || '',
        taxRate: res.data.data.taxRate || 0,
        invoiceHeaderText: res.data.data.invoiceHeaderText || '',
        invoiceFooterText: res.data.data.invoiceFooterText || '',
        appName: res.data.data.appName || 'WeAlll Inventory',
        logoUrl: res.data.data.logoUrl || '',
        brandColor: res.data.data.brandColor || '#4f46e5'
      });
      
      if (subRes && subRes.data.success) {
        setSubscription(subRes.data.data.subscription);
        setPlans(subRes.data.data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load space settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/tenants/settings', settings);
      setMessage('Settings updated successfully!');
      toast.success('Workspace settings updated');
      setTimeout(() => {
        setMessage('');
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error.response?.data?.error || 'Failed to update settings');
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
        setSettings(prev => ({ ...prev, logoUrl: res.data.data.url }));
        toast.success('Logo uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-44 bg-gray-200 rounded-2xl"></div>
        <div className="h-96 bg-white rounded-2xl border border-gray-200"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Business Profile', icon: UserCircle, desc: 'Contact & Billing details' },
    { id: 'branding', name: 'Branding & UI', icon: Palette, desc: 'Logo & Color theme' },
    { id: 'payments', name: 'Subscription & Plans', icon: CreditCard, desc: 'Billing & Tiers' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* Header Profile Summary Banner                                             */}
      {/* ========================================================================= */}
      <div 
        className="rounded-3xl shadow-xl p-6 sm:p-8 text-white relative overflow-hidden transition-all duration-300 border border-white/10"
        style={{
          background: settings.brandColor && settings.brandColor !== '#000000' 
            ? `linear-gradient(135deg, ${settings.brandColor}, #1e1b4b)`
            : 'linear-gradient(135deg, #4338ca, #1e1b4b)'
        }}
      >
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/95 rounded-2xl p-2 shadow-xl flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white/20">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <Building2 className="w-10 h-10 text-indigo-600" />
              )}
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {settings.businessName || 'Your Business Workspace'}
                </h1>
              </div>
              <p className="text-indigo-200 text-sm mt-0.5 font-medium">
                Owner: {settings.ownerName || user?.name}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/25 shadow-inner">
                  <Star size={12} className="text-amber-300" />
                  <span>{subscription ? `${subscription.planId?.name || 'Standard Plan'} (${subscription.status})` : 'Active Business'}</span>
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-black/20 backdrop-blur-md text-indigo-100 border border-white/10">
                  Tenant ID: {user?.tenantId?._id ? user.tenantId._id.substring(0, 8).toUpperCase() : 'PORTAL'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-gray-50 text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Modern Main Space Container with Tabs                                     */}
      {/* ========================================================================= */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
        {/* Horizontal Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 p-2 gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[170px] flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  isActive 
                    ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/80 font-bold' 
                    : 'text-gray-600 hover:bg-gray-100/80 font-medium'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="text-sm leading-tight">{tab.name}</div>
                  <div className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5">{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8">
          {/* Status Message */}
          {message && (
            <div className="mb-6 animate-in fade-in duration-200">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                message.includes('success') 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {message.includes('success') ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                )}
                <p className="font-semibold text-sm">{message}</p>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 1. BUSINESS PROFILE TAB                                               */}
          {/* ===================================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Business Profile & Details</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update primary company identification, contact numbers, tax parameters, and invoice printing settings.
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Business / Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      aria-label="Business Name"
                      value={settings.businessName}
                      onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                    />
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Proprietor / Owner Name
                    </label>
                    <input
                      type="text"
                      aria-label="Owner Name"
                      value={settings.ownerName}
                      onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                    />
                  </div>

                  {/* Business Phone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Phone size={13} className="text-gray-400" />
                      <span>Contact Phone Number</span>
                    </label>
                    <input
                      type="text"
                      aria-label="Contact Phone Number"
                      value={settings.businessPhone}
                      onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                    />
                  </div>

                  {/* Default Tax Rate */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Percent size={13} className="text-gray-400" />
                      <span>Default Tax / GST Rate (%)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      aria-label="Tax Rate Percentage"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                    />
                  </div>

                  {/* Business Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400" />
                      <span>Physical Business Address</span>
                    </label>
                    <textarea
                      aria-label="Physical Business Address"
                      value={settings.businessAddress}
                      onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                      rows="3"
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                    ></textarea>
                  </div>
                </div>

                {/* Invoice Customization Sub-section */}
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Invoice Header & Footer Notes</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Invoice Header Note (e.g. GSTIN / Tax ID)
                      </label>
                      <input
                        type="text"
                        aria-label="Invoice Header Note"
                        value={settings.invoiceHeaderText}
                        onChange={(e) => setSettings({ ...settings, invoiceHeaderText: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Invoice Footer Note (e.g. Return Policy / Thank You)
                      </label>
                      <input
                        type="text"
                        aria-label="Invoice Footer Note"
                        value={settings.invoiceFooterText}
                        onChange={(e) => setSettings({ ...settings, invoiceFooterText: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold shadow-sm"
                  >
                    <Save size={15} />
                    <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 2. BRANDING & UI TAB                                                  */}
          {/* ===================================================================== */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Custom Branding & UI Theme</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Customize application title, logo banner, and primary brand accent color.
                </p>
              </div>

              <div className="space-y-6 max-w-2xl">
                {/* App Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Custom Application Name
                  </label>
                  <p className="text-xs text-gray-400 mb-2">
                    Displayed in the sidebar, header, and invoice documents.
                  </p>
                  <input
                    type="text"
                    aria-label="Custom Application Name"
                    value={settings.appName}
                    onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                  />
                </div>

                {/* Logo Image */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Business Logo
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Recommended dimensions: 400x100 pixels (PNG or SVG with transparent background).
                  </p>

                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-1 w-full">
                      <div className="p-6 border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl bg-gray-50 hover:bg-gray-100/50 transition-all text-center">
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <label htmlFor="logo-file-upload" className="cursor-pointer font-semibold text-xs text-indigo-600 hover:text-indigo-800">
                          <span>Click to upload image</span>
                          <input 
                            id="logo-file-upload" 
                            name="logo-file-upload" 
                            type="file" 
                            className="sr-only" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            disabled={uploadingLogo} 
                          />
                        </label>
                        <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, or SVG up to 2MB</p>
                      </div>
                      {uploadingLogo && (
                        <p className="text-xs text-indigo-600 font-semibold mt-2 flex items-center gap-1.5">
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Uploading logo image...</span>
                        </p>
                      )}
                    </div>

                    {settings.logoUrl && (
                      <div className="w-full sm:w-48 flex-shrink-0 flex flex-col items-center">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Active Preview
                        </span>
                        <div className="p-3 border border-gray-200 rounded-2xl bg-white w-full flex items-center justify-center relative group min-h-[90px] shadow-sm">
                          <img src={settings.logoUrl} alt="Logo Preview" className="max-h-14 max-w-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, logoUrl: '' })}
                            className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition"
                            title="Remove logo"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Accent Color */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Primary Brand Color
                  </label>
                  <p className="text-xs text-gray-400 mb-2.5">
                    Applied to primary navigation bars, button gradients, and invoice banners.
                  </p>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200 inline-flex">
                    <input
                      type="color"
                      aria-label="Brand Color Picker"
                      value={settings.brandColor}
                      onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                      className="h-10 w-14 rounded-xl cursor-pointer border-0 p-0 shadow-inner"
                    />
                    <div className="font-mono text-xs font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                      {settings.brandColor.toUpperCase()}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, brandColor: '#4f46e5' })}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2"
                    >
                      Default Indigo
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold shadow-sm"
                  >
                    <Save size={15} />
                    <span>{saving ? 'Saving...' : 'Save Branding Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 3. SUBSCRIPTION & BILLING TAB                                         */}
          {/* ===================================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Subscription & Plan Management</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Review active workspace tier, features breakdown, and billing renewal options.
                  </p>
                </div>

                {/* Cycle Switcher */}
                <div className="bg-gray-100 p-1 rounded-xl inline-flex text-xs font-bold self-start sm:self-auto">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all ${
                      billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-3.5 py-1.5 rounded-lg transition-all ${
                      billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Annual (Save 20%)
                  </button>
                </div>
              </div>

              {/* Current Subscription Card */}
              {subscription && (
                <div className="border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider mb-2">
                        {subscription.status || 'ACTIVE'}
                      </div>
                      <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                        <span>{subscription.planId?.name || 'Professional Plan'}</span>
                        <CheckCircle2 size={20} className="text-indigo-600" />
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Billed {subscription.billingCycle || 'monthly'}. Renews on{' '}
                        <span className="font-semibold text-gray-700">
                          {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'Active Ongoing'}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <div className="text-2xl font-extrabold text-gray-900">
                        ₹{billingCycle === 'yearly' ? subscription.planId?.yearlyPrice || 0 : subscription.planId?.monthlyPrice || 0}
                        <span className="text-xs font-normal text-gray-500 ml-1">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                      </div>
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold shadow-sm"
                      >
                        <CreditCard size={14} />
                        <span>Manage Subscription</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Available Plans Grid */}
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Available Subscription Tiers</h3>
                {plans.length === 0 ? (
                  <div className="text-xs text-gray-400 italic">No alternative public plans found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {plans.map((p) => {
                      const isCurrent = subscription?.planId?._id === p._id;
                      const price = billingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice;
                      return (
                        <div
                          key={p._id}
                          className={`rounded-2xl p-6 flex flex-col justify-between border transition-all ${
                            isCurrent
                              ? 'border-2 border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-100'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-base font-bold text-gray-900">{p.name}</h4>
                              {isCurrent && (
                                <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-4">{p.description}</p>

                            <div className="text-2xl font-extrabold text-gray-900 mb-4">
                              ₹{price}
                              <span className="text-xs font-normal text-gray-400 ml-1">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                            </div>

                            <div className="space-y-2 mb-6 border-t border-gray-100 pt-4">
                              {p.features?.map((f, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                  <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => !isCurrent && setShowPaymentModal(true)}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-indigo-100 text-indigo-700 cursor-default'
                                : 'bg-gray-900 text-white hover:bg-indigo-600'
                            }`}
                          >
                            {isCurrent ? 'Active Plan' : 'Select Tier'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Notice Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
              <CreditCard size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Online Payments Gateway</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We are currently integrating a direct automated payment gateway. To upgrade your tier or adjust plan limits immediately, please connect with our support desk.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn-primary w-full py-2.5 text-xs font-bold rounded-xl"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySpace;
