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
    <div className="min-h-screen bg-gradient-to-br from-blue-100/90 via-purple-50/50 to-violet-100/90 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-200 selection:text-blue-900 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 flex justify-center">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Brand Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-2 hover:opacity-80 transition-opacity focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">WeAlll Inventory</span>
        </Link>
        <p className="text-sm text-slate-600 font-medium">Smart Inventory. Stronger Business.</p>
        </div>

        {/* Auth Card */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md w-full px-4 sm:px-0">
          <div className="bg-white/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-[0_30px_60px_-15px_rgba(59,130,246,0.15)] ring-1 ring-violet-500/10 sm:rounded-3xl relative">
          <Outlet />
        </div>
        
          {/* Footer */}
          <div className="mt-8 text-center flex flex-col items-center justify-center gap-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-semibold mt-0.5">Powered by</span>
            <a 
              href="https://wealll.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:opacity-80 transition-opacity focus:outline-none"
            >
              <img src={wealllLogo} alt="WeAlll" className="h-4 object-contain transition-all" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
