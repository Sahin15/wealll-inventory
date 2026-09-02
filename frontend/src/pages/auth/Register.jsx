import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Eye, EyeOff, CheckCircle2, X } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '', businessType: 'Makeup Artist / Makeup Studio', businessEmail: '', businessPhone: '',
    businessAddress: '', city: '', state: '', pinCode: '', gstin: '',
    applicantName: '', applicantEmail: '', applicantPhone: '',
    password: '', confirmPassword: '',
    expectedProductCount: '', expectedUserCount: '', currentlyUsingExcel: false, referralSource: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/register`, formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-[#4285F4]/20 focus:border-[#4285F4] focus:bg-white transition-all duration-200 text-gray-900";
  const labelStyles = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-6 sm:p-8 max-h-[95vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 border border-gray-100">
        
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none z-10"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Application Submitted!</h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
              Thank you for applying for WeAlll Inventory. Your application has been submitted successfully and is currently awaiting approval from the WeAlll team.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 my-6 inline-block min-w-[250px]">
              <p className="text-sm font-medium text-gray-500 mb-1">Application email:</p>
              <p className="text-gray-900 font-bold">{formData.applicantEmail}</p>
            </div>
            <div>
              <button 
                onClick={() => navigate('/')} 
                className="group w-full max-w-sm mx-auto bg-[#4285F4] text-white flex justify-center items-center gap-2 text-base py-3.5 rounded-xl font-semibold shadow-[0_8px_20px_-6px_rgba(66,133,244,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(66,133,244,0.5)] hover:bg-[#3367D6] hover:-translate-y-0.5 transition-all duration-200"
              >
                Close and Return to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-8 pr-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Apply for WeAlll Inventory</h2>
              <p className="text-sm text-gray-500">Tell us about your business and we'll review your application.</p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit} autoComplete="off">
              <input type="text" style={{ display: 'none' }} />
              <input type="email" style={{ display: 'none' }} />
              <input type="password" style={{ display: 'none' }} />

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                  {error}
                </div>
              )}

              {/* Business Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Business Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyles}>Business / Studio Name *</label>
                    <input type="text" name="businessName" required value={formData.businessName} onChange={handleChange} className={inputStyles} autoComplete="organization" />
                  </div>
                  <div>
                    <label className={labelStyles}>Business Type *</label>
                    <select name="businessType" required value={formData.businessType} onChange={handleChange} className={inputStyles}>
                      <option value="Makeup Artist / Makeup Studio">Makeup Artist / Makeup Studio</option>
                      <option value="Salon">Salon</option>
                      <option value="Beauty Business">Beauty Business</option>
                      <option value="Retail">Retail</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyles}>Business Email *</label>
                    <input type="email" name="businessEmail" required value={formData.businessEmail} onChange={handleChange} className={inputStyles} />
                  </div>
                  <div>
                    <label className={labelStyles}>Business Phone *</label>
                    <input type="tel" name="businessPhone" required value={formData.businessPhone} onChange={handleChange} className={inputStyles} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelStyles}>Business Address *</label>
                    <input type="text" name="businessAddress" required value={formData.businessAddress} onChange={handleChange} className={inputStyles} />
                  </div>
                  <div>
                    <label className={labelStyles}>City *</label>
                    <input type="text" name="city" required value={formData.city} onChange={handleChange} className={inputStyles} />
                  </div>
                  <div>
                    <label className={labelStyles}>State *</label>
                    <input type="text" name="state" required value={formData.state} onChange={handleChange} className={inputStyles} />
                  </div>
                  <div>
                    <label className={labelStyles}>PIN Code *</label>
                    <input type="text" name="pinCode" required value={formData.pinCode} onChange={handleChange} className={inputStyles} />
                  </div>
                  <div>
                    <label className={labelStyles}>GSTIN (Optional)</label>
                    <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} className={inputStyles} />
                  </div>
                </div>
              </div>

              {/* Applicant / Admin Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Applicant / Admin Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={labelStyles}>Full Name *</label>
                    <input type="text" name="applicantName" required value={formData.applicantName} onChange={handleChange} className={inputStyles} autoComplete="name" />
                  </div>
                  <div>
                    <label className={labelStyles}>Email Address *</label>
                    <input type="email" name="applicantEmail" required value={formData.applicantEmail} onChange={handleChange} className={inputStyles} autoComplete="email" />
                  </div>
                  <div>
                    <label className={labelStyles}>Phone Number *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-medium">+91</span>
                      <input type="tel" name="applicantPhone" required pattern="[0-9]{10}" title="Please enter a valid 10-digit mobile number" value={formData.applicantPhone} onChange={handleChange} className={`${inputStyles} pl-12 pr-4`} autoComplete="tel-national" />
                    </div>
                  </div>
                  <div>
                    <label className={labelStyles}>Password *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="password" required minLength="8" value={formData.password} onChange={handleChange} className={`${inputStyles} pr-10`} autoComplete="new-password" />
                      <button type="button" className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none rounded-r-xl transition-colors" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelStyles}>Confirm Password *</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" required minLength="8" value={formData.confirmPassword} onChange={handleChange} className={`${inputStyles} pr-10`} autoComplete="new-password" />
                      <button type="button" className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none rounded-r-xl transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Usage Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyles}>Approx. Number of Products</label>
                    <select name="expectedProductCount" value={formData.expectedProductCount} onChange={handleChange} className={inputStyles}>
                      <option value="">Select...</option>
                      <option value="1-50">1-50</option>
                      <option value="51-200">51-200</option>
                      <option value="200-500">200-500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyles}>Approx. Number of Users</label>
                    <select name="expectedUserCount" value={formData.expectedUserCount} onChange={handleChange} className={inputStyles}>
                      <option value="">Select...</option>
                      <option value="1-2">1-2</option>
                      <option value="3-5">3-5</option>
                      <option value="6-10">6-10</option>
                      <option value="10+">10+</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex items-center mt-3">
                    <input id="excel" type="checkbox" name="currentlyUsingExcel" checked={formData.currentlyUsingExcel} onChange={handleChange} className="h-5 w-5 text-[#4285F4] border-gray-300 rounded focus:ring-[#4285F4]" />
                    <label htmlFor="excel" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">I currently use Excel/Spreadsheets for inventory management</label>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full bg-[#4285F4] text-white flex justify-center items-center gap-2 text-base py-3.5 sm:py-4 rounded-xl font-semibold shadow-[0_8px_20px_-6px_rgba(66,133,244,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(66,133,244,0.5)] hover:bg-[#3367D6] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? 'Submitting Application...' : 'Submit Registration Application'}
                  {!loading && <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
