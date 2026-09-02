import React, { useContext } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package } from 'lucide-react';
import wealllLogo from '../assets/wealll-logo.jpg';

const AuthLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900">Loading...</div>;
  }

  if (user) {
    if (user.role === 'superadmin') return <Navigate to="/wealll-admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center justify-center gap-2 mb-2 hover:opacity-80 transition-opacity focus:outline-none">
          <Package className="w-8 h-8 text-[#4285F4]" />
          <span className="text-2xl font-bold tracking-tight text-gray-900">WeAlll Inventory</span>
        </Link>
        <p className="text-sm text-gray-500 font-medium">Smart Inventory. Stronger Business.</p>
      </div>

      {/* Auth Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100 relative">
          <Outlet />
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center flex flex-col items-center justify-center gap-2">
          <span className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-semibold mt-0.5">Powered by</span>
          <a 
            href="https://wealll.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:opacity-80 transition-opacity focus:outline-none"
          >
            <img src={wealllLogo} alt="WeAlll" className="h-4 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
          </a>
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
