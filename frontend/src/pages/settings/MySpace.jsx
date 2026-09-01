import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save, Building2, CheckCircle2, AlertCircle, CreditCard, Palette, UserCircle, Star, X } from 'lucide-react';
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
    brandColor: '#000000'
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
        brandColor: res.data.data.brandColor || '#000000'
      });
      
      if (subRes && subRes.data.success) {
        setSubscription(subRes.data.data.subscription);
        setPlans(subRes.data.data.plans || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if(e) e.preventDefault();
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
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading your space...</div>;
  }

  const tabs = [
    { id: 'profile', name: 'Business Profile', icon: UserCircle },
    { id: 'branding', name: 'Branding & UI', icon: Palette },
    { id: 'payments', name: 'Subscription & Billing', icon: CreditCard },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Profile Summary */}
      <div 
        className="rounded-2xl shadow-lg p-8 text-white relative overflow-hidden"
        style={{
          background: settings.brandColor && settings.brandColor !== '#000000' 
            ? `linear-gradient(135deg, ${settings.brandColor}, ${settings.brandColor}DD)`
            : 'linear-gradient(to right, #4f46e5, #9333ea)'
        }}
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="max-h-full object-contain" />
            ) : (
              <Building2 className="w-12 h-12 text-indigo-300" />
            )}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold tracking-tight mb-1">{settings.businessName || 'Your Business'}</h1>
            <p className="text-indigo-100 mb-4">{settings.ownerName || user?.name}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30 ${
                !subscription ? 'text-gray-300' : subscription.status === 'ACTIVE' ? 'text-green-300' : subscription.status === 'EXPIRED' ? 'text-red-300' : 'text-yellow-300'
              }`}>
                <Star className="w-3 h-3 mr-1" /> {subscription ? `${subscription.planId?.name || 'Unknown Plan'} (${subscription.status})` : 'No Active Plan'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                ID: {user?.tenantId?._id ? user.tenantId._id.substring(0,8).toUpperCase() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden min-h-[500px]">
        
        {/* Horizontal Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  isActive 
                    ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm' 
                    : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-10">
          
          {/* Toast Notification */}
          {message && (
            <div className="mb-6 animate-fade-in-down transition-all duration-300">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 ${
                message.includes('success') 
                  ? 'bg-green-50 border-green-500 text-green-800' 
                  : 'bg-red-50 border-red-500 text-red-800'
              }`}>
                {message.includes('success') ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <p className="font-medium text-sm">{message}</p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Business Profile</h2>
                  <p className="text-sm text-gray-500 mt-1">Update your company details and contact information.</p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="btn-primary flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input
                      type="text"
                      required
                      value={settings.businessName}
                      onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                      className="input-field mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Owner / Admin Name</label>
                    <input
                      type="text"
                      value={settings.ownerName}
                      onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                      className="input-field mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Phone Number</label>
                    <input
                      type="text"
                      value={settings.businessPhone}
                      onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                      className="input-field mt-1"
                    />
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
                      className="input-field mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Business Address</label>
                    <textarea
                      value={settings.businessAddress}
                      onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                      rows="3"
                      className="input-field mt-1"
                    ></textarea>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Invoice Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Invoice Header Text (e.g. GST Number)</label>
                      <input
                        type="text"
                        value={settings.invoiceHeaderText}
                        onChange={(e) => setSettings({ ...settings, invoiceHeaderText: e.target.value })}
                        className="input-field mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Invoice Footer Message</label>
                      <input
                        type="text"
                        value={settings.invoiceFooterText}
                        onChange={(e) => setSettings({ ...settings, invoiceFooterText: e.target.value })}
                        className="input-field mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="animate-fade-in">
              <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Branding & UI</h2>
                  <p className="text-sm text-gray-500 mt-1">Personalize how the application looks for your team.</p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="btn-primary flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="space-y-8 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">App Name</label>
                  <p className="text-xs text-gray-500 mb-3">This replaces "WeAlll Inventory" in the sidebar when no logo is present.</p>
                  <input
                    type="text"
                    value={settings.appName}
                    onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Logo Image</label>
                  <p className="text-xs text-gray-500 mb-3">Recommended size: 400x100 pixels (4:1 aspect ratio) for best display.</p>
                  
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                              <span>Upload a file</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileUpload} disabled={uploadingLogo} />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                        </div>
                      </div>
                      {uploadingLogo && <p className="text-sm text-indigo-600 mt-2 font-medium">Uploading...</p>}
                    </div>
                    
                    {settings.logoUrl && (
                      <div className="w-48 flex-shrink-0 flex flex-col items-center">
                        <p className="text-xs text-gray-500 font-medium mb-2 w-full text-center">Current Logo</p>
                        <div className="p-4 border border-gray-200 rounded-lg bg-white w-full flex items-center justify-center relative group min-h-[100px]">
                          <img src={settings.logoUrl} alt="Logo Preview" className="max-w-full max-h-16 object-contain" />
                          <button 
                            type="button" 
                            onClick={() => setSettings({...settings, logoUrl: ''})} 
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Logo"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Brand Primary Color</label>
                  <p className="text-xs text-gray-500 mb-3">This color will be used for primary buttons and active menu accents.</p>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 inline-flex">
                    <input
                      type="color"
                      value={settings.brandColor}
                      onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                      className="h-10 w-16 rounded cursor-pointer border-0 p-0"
                    />
                    <div className="text-sm text-gray-700 font-mono font-medium">
                      {settings.brandColor.toUpperCase()}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, brandColor: '#000000' })}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium ml-4"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="animate-fade-in">
              <div className="mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Subscription & Billing</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your plan, billing cycle, and payment methods.</p>
              </div>

              <div className="w-full">
                {!subscription ? (
                  <div className="text-gray-500 italic p-6 bg-gray-50 rounded-lg text-center mb-8">
                    No active subscription found. Please select a plan below.
                  </div>
                ) : (
                  <>
                    {/* Current Plan Card */}
                    <div className={`border-2 rounded-xl p-6 shadow-sm mb-8 relative overflow-hidden ${
                      subscription.status === 'ACTIVE' || subscription.status === 'TRIAL' 
                        ? 'border-indigo-500 bg-white' 
                        : 'border-red-400 bg-red-50'
                    }`}>
                      <div className={`absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-lg ${
                        subscription.status === 'ACTIVE' || subscription.status === 'TRIAL' ? 'bg-indigo-500' : 'bg-red-500'
                      }`}>
                        {subscription.status}
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                            {subscription.planId?.name || 'Unknown Plan'} 
                            {(subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                          </h3>
                          <p className="text-gray-500">
                            Billed {subscription.billingCycle}. Next invoice / expiry on {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}.
                          </p>
                          <div className="mt-4 flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold text-gray-900">
                              ₹{subscription.billingCycle === 'yearly' ? subscription.planId?.yearlyPrice : subscription.planId?.monthlyPrice}
                            </span>
                            <span className="text-gray-500 font-medium">/{subscription.billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 w-full sm:w-auto">
                          <button 
                            className="btn-primary w-full sm:w-auto"
                            onClick={() => setShowPaymentModal(true)}
                          >
                            Manage Subscription
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Plan Features */}
                    {subscription.planId?.features && (
                      <div className="mb-10">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Plan Features</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {subscription.planId.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="bg-indigo-100 rounded-full p-1 mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {/* View Plans - Moved outside so it renders even if subscription is null */}
                <div className="mt-10">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b pb-4 gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Available Plans</h3>
                    <div className="bg-gray-100 p-1 rounded-xl inline-flex shadow-inner">
                      <button 
                        onClick={() => setBillingCycle('monthly')} 
                        className={`w-32 py-2 text-sm font-semibold rounded-lg transition-all ${billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        Monthly
                      </button>
                      <button 
                        onClick={() => setBillingCycle('yearly')} 
                        className={`w-32 py-2 text-sm font-semibold rounded-lg transition-all ${billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        Annually
                      </button>
                    </div>
                  </div>
                  {plans.length === 0 ? (
                    <div className="text-sm text-gray-500">Loading plans...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {(() => {
                        // Default to the globally recommended plan (if one exists)
                        let recommendedIndex = plans.findIndex(p => p.isRecommended);
                        if (recommendedIndex === -1) recommendedIndex = 1; // fallback

                        if (subscription?.planId) {
                          const currentIndex = plans.findIndex(p => p._id === subscription.planId._id);
                          if (currentIndex !== -1) {
                            recommendedIndex = currentIndex < plans.length - 1 ? currentIndex + 1 : -1;
                          }
                        }
                        
                        return plans.map((p, index) => {
                          const isCurrent = subscription?.planId?._id === p._id;
                          const isHighlighted = index === recommendedIndex;
                          
                          return (
                          <div 
                            key={p._id} 
                            className={`relative rounded-2xl flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                              isCurrent 
                                ? 'border-2 border-indigo-600 bg-white shadow-xl shadow-indigo-100' 
                                : isHighlighted
                                  ? 'border-2 border-purple-500 bg-white shadow-xl shadow-purple-100'
                                  : 'border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300'
                            }`}
                          >
                            {isCurrent && (
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider shadow-md">
                                CURRENT PLAN
                              </div>
                            )}
                            {!isCurrent && isHighlighted && (
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider shadow-md">
                                RECOMMENDED
                              </div>
                            )}
                            
                            <div className="p-6 md:p-8 h-full flex flex-col">
                              <h4 className={`text-xl font-bold mb-2 ${isCurrent ? 'text-indigo-900' : isHighlighted ? 'text-purple-900' : 'text-gray-900'}`}>
                                {p.name}
                              </h4>
                              <p className="text-sm text-gray-500 mb-6">{p.description}</p>
                              
                              <div className="flex items-end gap-1 mb-6">
                                <span className="text-4xl font-extrabold text-gray-900">₹{billingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice}</span>
                                <span className="text-base font-medium text-gray-500 mb-1">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                              </div>
                              
                              <div className="space-y-3 mb-8 flex-grow">
                                {p.features?.map((feature, idx) => (
                                  <div key={idx} className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-600 leading-tight">{feature}</span>
                                  </div>
                                ))}
                              </div>
                              
                              <button 
                                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                                  isCurrent 
                                    ? 'bg-indigo-50 text-indigo-700 cursor-default'
                                    : isHighlighted
                                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:opacity-90'
                                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-600 hover:text-indigo-600'
                                }`}
                                onClick={() => !isCurrent && setShowPaymentModal(true)}
                              >
                                {isCurrent ? 'Active Plan' : 'Select Plan'}
                              </button>
                            </div>
                          </div>
                        );
                      })})()}
                    </div>
                  )}
                </div>

                <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Need a custom plan?</h4>
                  <p className="text-sm text-gray-500 mb-4">If you need an enterprise solution with dedicated support and custom features, let's talk.</p>
                  <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowPaymentModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CreditCard className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Online Payments Coming Soon
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        We are currently integrating a secure payment gateway for automated billing. To activate or change your subscription right now, please reach out to our support team and we will set it up for you immediately!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySpace;
