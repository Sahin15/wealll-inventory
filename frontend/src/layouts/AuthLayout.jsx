import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package, ShoppingCart, Truck, Receipt, TrendingUp, Users, Shield, Cloud, Sparkles } from 'lucide-react';
import wealllLogo from '../assets/wealll-logo.jpg';

const features = [
  { title: "Real-Time Stock", desc: "Know exactly what you have.", icon: Package, color: "bg-[#4285F4]" }, // Google Blue
  { title: "Sales Management", desc: "Keep inventory updated automatically.", icon: ShoppingCart, color: "bg-[#EA4335]" }, // Google Red
  { title: "Purchase Tracking", desc: "Manage stock efficiently.", icon: Truck, color: "bg-[#34A853]" }, // Google Green
  { title: "GST & Tax Ready", desc: "Keep transactions organized.", icon: Receipt, color: "bg-[#FBBC05]" }, // Google Yellow
  { title: "Business Analytics", desc: "Understand sales at a glance.", icon: TrendingUp, color: "bg-[#4285F4]" },
  { title: "Multi-User Access", desc: "Work with secure role-based access.", icon: Users, color: "bg-[#EA4335]" },
];

// Background graphic removed in favor of clean modern pattern

const AuthLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-900">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen bg-white flex flex-col lg:flex-row font-sans overflow-hidden w-full">
      
        {/* Marketing Side (Left) */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] text-gray-900 flex-col relative overflow-hidden h-screen bg-white">
          {/* Subtle SaaS Dotted Background & Google Color Orbs */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
          
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#4285F4]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-[#34A853]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute top-[30%] right-[-10%] w-[450px] h-[450px] bg-[#FBBC05]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-[#EA4335]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

          <div className="relative z-10 flex flex-col flex-1 w-full max-w-3xl xl:max-w-4xl p-6 lg:p-10 xl:p-12 justify-center">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5 mb-1.5">
                    <Package className="w-6 h-6 xl:w-8 xl:h-8 text-[#4285F4]" />
                    WeAlll Inventory
                  </h1>
                  <p className="text-xs xl:text-sm text-gray-500 font-medium">Smart Inventory. Stronger Business.</p>
               </div>
               <div className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span className="text-[10px] xl:text-xs font-bold text-blue-700 tracking-wide uppercase">All-in-One Solution</span>
               </div>
            </div>
            
            {/* Copy */}
            <div className="mb-6 lg:w-[85%] xl:w-[80%]">
              <p className="text-[#4285F4] text-xs xl:text-sm font-bold tracking-[0.2em] mb-2 uppercase">Built for growing businesses</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-[1.15]">
                Manage Stock.<br />Track Sales.<br />
                <span className="text-[#4285F4]">
                  Grow Faster.
                </span>
              </h2>
              <p className="text-sm xl:text-base text-gray-600 font-normal leading-relaxed max-w-lg">
                Replace spreadsheets with a simple inventory system for products, stock, purchases and sales. Everything you need to scale.
              </p>
            </div>

            {/* Feature Grid (3x2 on lg) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xl:gap-4 mb-6 shrink-0 relative z-20">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl p-4 xl:p-5 flex flex-col items-start hover:shadow-lg hover:border-gray-200 transition-all hover:-translate-y-1"
                >
                  <div className={`w-8 h-8 xl:w-10 xl:h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm ${feature.color}`}>
                    <feature.icon className="w-4 h-4 xl:w-5 xl:h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-xs xl:text-sm text-gray-900 mb-1 leading-tight">{feature.title}</h3>
                  <p className="text-[10px] xl:text-xs text-gray-500 leading-snug">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom Highlights */}
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-6 shrink-0 pb-2">
               <div className="flex items-start gap-3 flex-1">
                 <Shield className="w-5 h-5 xl:w-6 xl:h-6 text-[#4285F4] shrink-0 mt-0.5" />
                 <div>
                   <h4 className="text-xs xl:text-sm font-semibold text-gray-900 mb-1">Secure & Reliable</h4>
                   <p className="text-[11px] xl:text-xs text-gray-500 leading-relaxed pr-4">Data stays protected with enterprise-grade secure access controls.</p>
                 </div>
               </div>
               <div className="flex items-start gap-3 flex-1">
                 <Cloud className="w-5 h-5 xl:w-6 xl:h-6 text-[#34A853] shrink-0 mt-0.5" />
                 <div>
                   <h4 className="text-xs xl:text-sm font-semibold text-gray-900 mb-1">Access Anywhere</h4>
                   <p className="text-[11px] xl:text-xs text-gray-500 leading-relaxed pr-4">Use seamlessly on your desktop, tablet, or mobile phone anytime.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Auth Side (Right) - Light theme */}
        <div className="flex-1 flex flex-col bg-gray-50/50 lg:border-l border-gray-100 relative h-screen overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center justify-center pt-8 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2 mb-1">
              <Package className="w-6 h-6 text-[#4285F4]" />
              WeAlll Inventory
            </h1>
            <p className="text-xs text-gray-500 font-medium">Smart Inventory. Stronger Business.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center py-6 px-4 sm:px-8 lg:px-12 w-full mx-auto lg:max-w-none">
            <Outlet />
          </div>
          
          {/* Watermark */}
          <div className="py-6 text-center mt-auto border-t border-gray-200 bg-white lg:bg-transparent">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-semibold mt-0.5">Powered by</span>
              <a 
                href="https://wealll.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:opacity-80 transition-opacity"
              >
                <img src={wealllLogo} alt="WeAlll" className="h-4 object-contain" />
              </a>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AuthLayout;
