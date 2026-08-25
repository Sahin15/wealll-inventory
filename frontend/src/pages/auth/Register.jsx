import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '', businessType: 'Makeup Artist / Makeup Studio', businessEmail: '', businessPhone: '',
    businessAddress: '', city: '', state: '', pinCode: '', gstin: '',
    applicantName: '', applicantEmail: '', applicantPhone: '',
    password: '', confirmPassword: '',
    expectedProductCount: '', expectedUserCount: '', currentlyUsingExcel: false, referralSource: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (submitted) {
    return (
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Application Submitted</h2>
        <p className="text-gray-600">
          Thank you for applying for WeAlll Inventory.
        </p>
        <p className="text-gray-600">
          Your application has been submitted successfully and is currently awaiting approval from the WeAlll team.
          We will review your business information and activate your account after approval.
        </p>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-medium text-gray-500">Application email:</p>
          <p className="text-gray-900 font-bold">{formData.applicantEmail}</p>
        </div>
        <button onClick={() => navigate('/login')} className="btn-primary w-full justify-center">
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 text-center mb-6">Apply for WeAlll Inventory</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
        
        {/* Business Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business / Studio Name *</label>
              <input type="text" name="businessName" required value={formData.businessName} onChange={handleChange} className="input-field mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Type *</label>
              <select name="businessType" required value={formData.businessType} onChange={handleChange} className="input-field mt-1">
                <option value="Makeup Artist / Makeup Studio">Makeup Artist / Makeup Studio</option>
                <option value="Salon">Salon</option>
                <option value="Beauty Business">Beauty Business</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Email *</label>
              <input type="email" name="businessEmail" required value={formData.businessEmail} onChange={handleChange} className="input-field mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Phone *</label>
              <input type="tel" name="businessPhone" required value={formData.businessPhone} onChange={handleChange} className="input-field mt-1" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Business Address *</label>
              <input type="text" name="businessAddress" required value={formData.businessAddress} onChange={handleChange} className="input-field mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input type="text" name="city" required value={formData.city} onChange={handleChange} className="input-field mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State *</label>
              <input type="text" name="state" required value={formData.state} onChange={handleChange} className="input-field mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PIN Code *</label>
              <input type="text" name="pinCode" required value={formData.pinCode} onChange={handleChange} className="input-field mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GSTIN (Optional)</label>
              <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} className="input-field mt-1" />
            </div>
          </div>
        </div>

        {/* Applicant Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Applicant / Admin Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input type="text" name="applicantName" required value={formData.applicantName} onChange={handleChange} className="input-field mt-1" autoComplete="name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address *</label>
              <input type="email" name="applicantEmail" required value={formData.applicantEmail} onChange={handleChange} className="input-field mt-1" autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
              <input type="tel" name="applicantPhone" required value={formData.applicantPhone} onChange={handleChange} className="input-field mt-1" autoComplete="tel" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  readOnly
                  className="input-field pr-10"
                  autoComplete="new-password"
                  minLength="8"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  readOnly
                  className="input-field pr-10"
                  autoComplete="new-password"
                  minLength="8"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Usage Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Approx. Number of Products</label>
              <select name="expectedProductCount" value={formData.expectedProductCount} onChange={handleChange} className="input-field mt-1">
                <option value="">Select...</option>
                <option value="1-50">1-50</option>
                <option value="51-200">51-200</option>
                <option value="200-500">200-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Approx. Number of Users</label>
              <select name="expectedUserCount" value={formData.expectedUserCount} onChange={handleChange} className="input-field mt-1">
                <option value="">Select...</option>
                <option value="1-2">1-2</option>
                <option value="3-5">3-5</option>
                <option value="6-10">6-10</option>
                <option value="10+">10+</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-center mt-2">
              <input
                id="excel"
                type="checkbox"
                name="currentlyUsingExcel"
                checked={formData.currentlyUsingExcel}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="excel" className="ml-2 block text-sm text-gray-900">
                Currently managing inventory with Excel?
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">How did you hear about WeAlll Inventory?</label>
              <input type="text" name="referralSource" value={formData.referralSource} onChange={handleChange} className="input-field mt-1" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex justify-center text-base py-3"
          >
            {loading ? 'Submitting Application...' : 'Submit Registration Application'}
          </button>
        </div>
        
        <div className="text-center text-sm pt-4">
          <span className="text-gray-600">Already have an account or applied? </span>
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
