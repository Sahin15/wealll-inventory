import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="w-full max-w-md mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">Welcome back!</h2>
        <p className="text-sm text-blue-200/70">Sign in to continue to your business dashboard.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
        {/* Hidden inputs to absorb browser autofill */}
        <input type="email" style={{ display: 'none' }} />
        <input type="password" style={{ display: 'none' }} />
        
        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-md text-sm border border-red-500/20">
            {error}
          </div>
        )}
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => e.target.removeAttribute('readonly')}
                readOnly
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/10 transition-all duration-200 text-white placeholder-blue-200/40"
                placeholder="Enter your email address"
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => e.target.removeAttribute('readonly')}
                readOnly
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/10 transition-all duration-200 text-white placeholder-blue-200/40 pr-12"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-4 flex items-center text-blue-200/60 hover:text-white focus:outline-none rounded-r-xl transition-colors"
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
            className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-center items-center gap-2 text-base py-3.5 rounded-xl font-semibold shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0 border border-white/10"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>}
          </button>
        </div>

        <div className="text-center text-sm pt-6 mt-6 border-t border-white/10">
          <span className="text-blue-200/60">Don't have an account? </span>
          <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
            Apply for Registration <span className="text-lg leading-none">→</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
