import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Register from './Register';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'superadmin') {
        navigate('/wealll-admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome back!</h2>
        <p className="text-sm text-gray-500">Sign in to continue to your business dashboard.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
        {/* Hidden inputs to absorb browser autofill */}
        <input type="email" style={{ display: 'none' }} />
        <input type="password" style={{ display: 'none' }} />
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
            {error}
          </div>
        )}
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => e.target.removeAttribute('readonly')}
                readOnly
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-[#4285F4]/20 focus:border-[#4285F4] transition-all duration-200 text-gray-900 placeholder-gray-400"
                placeholder="Enter your email address"
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => e.target.removeAttribute('readonly')}
                readOnly
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-[#4285F4]/20 focus:border-[#4285F4] transition-all duration-200 text-gray-900 placeholder-gray-400 pr-12"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none rounded-r-xl transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="group w-full bg-[#4285F4] text-white flex justify-center items-center gap-2 text-base py-3.5 rounded-xl font-semibold shadow-[0_8px_20px_-6px_rgba(66,133,244,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(66,133,244,0.5)] hover:bg-[#3367D6] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>}
          </button>
        </div>

        <div className="text-center text-sm pt-6 mt-6 border-t border-gray-200">
          <span className="text-gray-500">Don't have an account? </span>
          <button 
            type="button" 
            onClick={() => setShowRegister(true)} 
            className="font-semibold text-[#4285F4] hover:text-[#3367D6] transition-colors inline-flex items-center gap-1 focus:outline-none"
          >
            Apply for Registration <span className="text-lg leading-none">→</span>
          </button>
        </div>
      </form>

      {showRegister && <Register onClose={() => setShowRegister(false)} />}
    </div>
  );
};

export default Login;
