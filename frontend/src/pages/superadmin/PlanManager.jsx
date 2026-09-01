import React, { useState, useEffect } from 'react';
import { Plus, Edit2, CheckCircle2, Save, X, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const PlanManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/superadmin/plans');
      if (res.data.success) {
        setPlans(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to fetch subscription plans');
      setLoading(false);
    }
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      if (isCreating) {
        await api.post('/superadmin/plans', editingPlan);
      } else {
        await api.put(`/superadmin/plans/${editingPlan._id}`, editingPlan);
      }
      setEditingPlan(null);
      setIsCreating(false);
      fetchPlans();
      toast.success(isCreating ? 'Plan created successfully' : 'Plan updated successfully');
    } catch (err) {
      console.error('Error saving plan:', err);
      toast.error('Failed to save plan');
    }
  };

  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...(editingPlan.features || [])];
    updatedFeatures[index] = value;
    setEditingPlan({ ...editingPlan, features: updatedFeatures });
  };

  const addFeature = () => {
    setEditingPlan({
      ...editingPlan,
      features: [...(editingPlan.features || []), '']
    });
  };

  const removeFeature = (index) => {
    const updatedFeatures = [...(editingPlan.features || [])];
    updatedFeatures.splice(index, 1);
    setEditingPlan({ ...editingPlan, features: updatedFeatures });
  };

  if (loading && plans.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading plans...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500 mt-1">Manage pricing tiers and features for tenants.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPlan({
              name: '', slug: '', description: '', monthlyPrice: '', yearlyPrice: '', features: [''], isActive: true, isRecommended: false
            });
            setIsCreating(true);
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {editingPlan && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => { setEditingPlan(null); setIsCreating(false); }}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
              <form onSubmit={handleSavePlan}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-3 mb-4">
                    {isCreating ? 'Create New Plan' : 'Edit Plan'}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                      <input type="text" required className="input-field mt-1" value={editingPlan.name} onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Slug (Unique)</label>
                      <input type="text" required className="input-field mt-1" value={editingPlan.slug} onChange={(e) => setEditingPlan({...editingPlan, slug: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input type="text" className="input-field mt-1" value={editingPlan.description} onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monthly Price (₹)</label>
                      <input type="number" required className="input-field mt-1" value={editingPlan.monthlyPrice} onChange={(e) => setEditingPlan({...editingPlan, monthlyPrice: e.target.value === '' ? '' : Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Yearly Price (₹)</label>
                      <input type="number" required className="input-field mt-1" value={editingPlan.yearlyPrice} onChange={(e) => setEditingPlan({...editingPlan, yearlyPrice: e.target.value === '' ? '' : Number(e.target.value)})} />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                      {editingPlan.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <input type="text" className="input-field" value={feature} onChange={(e) => handleFeatureChange(idx, e.target.value)} />
                          <button type="button" onClick={() => removeFeature(idx)} className="text-red-500 hover:text-red-700 p-2">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={addFeature} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center mt-2">
                        <Plus className="w-4 h-4 mr-1" /> Add Feature
                      </button>
                    </div>

                    <div className="sm:col-span-2 flex items-center mt-2 gap-6">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="isActive" 
                          checked={editingPlan.isActive} 
                          onChange={(e) => setEditingPlan({...editingPlan, isActive: e.target.checked})}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                          Active (Visible to users)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="isRecommended" 
                          checked={editingPlan.isRecommended || false} 
                          onChange={(e) => setEditingPlan({...editingPlan, isRecommended: e.target.checked})}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isRecommended" className="ml-2 block text-sm text-gray-900">
                          Set as Globally Recommended
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                    {isCreating ? 'Create' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => { setEditingPlan(null); setIsCreating(false); }} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 mt-8 border-t border-gray-100 pt-8">
        <h2 className="text-xl font-bold text-gray-900">Active Templates</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const isHighlighted = plan.isRecommended; // Use the global flag
          
          return (
            <div 
              key={plan._id} 
              className={`relative rounded-2xl flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                !plan.isActive 
                  ? 'border-2 border-gray-300 bg-gray-50 opacity-75'
                  : isHighlighted
                    ? 'border-2 border-purple-500 bg-white shadow-xl shadow-purple-100'
                    : 'border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300'
              }`}
            >
              {!plan.isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider shadow-md">
                  INACTIVE
                </div>
              )}
              {plan.isActive && isHighlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider shadow-md">
                  RECOMMENDED
                </div>
              )}
              
              <div className="p-6 md:p-8 h-full flex flex-col">
                <h4 className={`text-xl font-bold mb-2 ${isHighlighted ? 'text-purple-900' : 'text-gray-900'}`}>
                  {plan.name}
                </h4>
                <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">₹{billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}</span>
                  <span className="text-base font-medium text-gray-500 mb-1">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                </div>
                
                <div className="space-y-3 mb-8 flex-grow">
                  {plan.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-600 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                    !plan.isActive 
                      ? 'bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100'
                      : isHighlighted
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:opacity-90'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-600 hover:text-indigo-600'
                  }`}
                  onClick={() => setEditingPlan(plan)}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanManager;
