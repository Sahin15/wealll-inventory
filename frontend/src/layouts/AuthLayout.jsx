import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package, ShoppingCart, Truck, Receipt, TrendingUp, Users, Shield, Cloud, Sparkles } from 'lucide-react';

const features = [
  { title: "Real-Time Stock", desc: "Know exactly what you have.", icon: Package, color: "bg-blue-500" },
  { title: "Sales Management", desc: "Keep inventory updated automatically.", icon: ShoppingCart, color: "bg-purple-500" },
  { title: "Purchase Tracking", desc: "Manage stock efficiently.", icon: Truck, color: "bg-emerald-500" },
  { title: "GST & Tax Ready", desc: "Keep transactions organized.", icon: Receipt, color: "bg-amber-500" },
  { title: "Business Analytics", desc: "Understand sales at a glance.", icon: TrendingUp, color: "bg-blue-600" },
  { title: "Multi-User Access", desc: "Work with secure role-based access.", icon: Users, color: "bg-indigo-500" },
];

const CSSDashboard = () => (
  <div className="hidden lg:block absolute right-[-5%] top-[2%] w-[500px] h-[350px] pointer-events-none z-0 opacity-20 xl:opacity-40 transition-opacity duration-300">
    <div 
      className="w-full h-full bg-[#1e293b] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
      style={{
        transform: 'perspective(1400px) rotateY(-20deg) rotateX(10deg) rotateZ(-2deg)',
        transformStyle: 'preserve-3d',
        boxShadow: '-20px 30px 80px rgba(0,0,0,0.8)',
      }}
    >
      {/* Dashboard Topbar */}
      <div className="h-8 bg-[#0f172a] border-b border-white/10 flex items-center px-4 justify-between">
         <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
         </div>
         <div className="h-3 w-20 bg-white/10 rounded-md"></div>
      </div>
      {/* Dashboard Layout */}
      <div className="flex flex-1 overflow-hidden bg-[#0f172a]">
        {/* Sidebar */}
        <div className="w-24 bg-[#1e293b] border-r border-white/10 p-3 space-y-2.5">
           {[...Array(6)].map((_,i) => <div key={i} className="h-3 bg-white/10 rounded-md w-full"></div>)}
        </div>
        {/* Main Content */}
        <div className="flex-1 p-4 flex flex-col">
           <h3 className="text-base font-bold text-white mb-3">Dashboard</h3>
           
           {/* KPI Cards */}
           <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-[#1e293b] p-2.5 rounded-lg border border-white/5 shadow-sm">
                 <p className="text-[8px] text-blue-200/60 mb-1 uppercase font-bold tracking-wide">Products</p>
                 <p className="text-sm font-bold text-white">248</p>
              </div>
              <div className="bg-[#1e293b] p-2.5 rounded-lg border border-white/5 shadow-sm">
                 <p className="text-[8px] text-blue-200/60 mb-1 uppercase font-bold tracking-wide">Stock</p>
                 <p className="text-sm font-bold text-white">1,284</p>
              </div>
              <div className="bg-[#1e293b] p-2.5 rounded-lg border border-white/5 shadow-sm">
                 <p className="text-[8px] text-blue-200/60 mb-1 uppercase font-bold tracking-wide">Sales</p>
                 <p className="text-sm font-bold text-white">₹48k</p>
              </div>
              <div className="bg-[#1e293b] p-2.5 rounded-lg border border-white/5 shadow-sm border-l-2 border-l-amber-500">
                 <p className="text-[8px] text-blue-200/60 mb-1 uppercase font-bold tracking-wide">Low</p>
                 <p className="text-sm font-bold text-amber-500">12</p>
              </div>
           </div>

           {/* Charts Area */}
           <div className="flex gap-2 flex-1">
              <div className="flex-1 bg-[#1e293b] rounded-lg border border-white/5 p-3 relative overflow-hidden flex flex-col justify-end shadow-sm">
                 <div className="w-full h-full flex items-end gap-1 pt-3">
                    {[30, 50, 40, 80, 60, 75, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-indigo-500/80 rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
);

const AuthLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#0B132B]">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ced9ee] to-[#f4f7fb] flex items-center justify-center py-4 sm:py-6 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* Floating Panel Container */}
      <div className="w-full max-w-[1300px] bg-[#0B132B] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row m-auto border border-white/10 relative z-10 lg:h-[88vh] lg:min-h-[600px] lg:max-h-[850px]">
        
        {/* Marketing Side (Left) */}
        <div className="lg:w-[60%] text-white flex flex-col relative overflow-hidden">
          {/* Subtle backgrounds */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
          
          <CSSDashboard />

          <div className="relative z-10 flex flex-col h-full w-full max-w-2xl p-6 lg:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mb-1">
                    <Package className="w-5 h-5 text-blue-400" />
                    WeAlll Inventory
                  </h1>
                  <p className="text-[10px] text-blue-200/60 font-medium">Smart Inventory. Stronger Business.</p>
               </div>
               <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shrink-0">
                  <Sparkles className="w-3 h-3 text-blue-300" />
                  <span className="text-[9px] font-semibold text-white tracking-wide uppercase">All-in-One Solution</span>
               </div>
            </div>
            
            {/* Copy */}
            <div className="mb-4 lg:w-[90%]">
              <p className="text-blue-400 text-[10px] font-bold tracking-[0.15em] mb-1.5 uppercase">Built for growing businesses</p>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight mb-2.5 leading-[1.15]">
                Manage Stock.<br />Track Sales.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  Grow Faster.
                </span>
              </h2>
              <p className="text-[12px] text-blue-100/70 font-light leading-relaxed max-w-sm">
                Replace spreadsheets with a simple inventory system for products, stock, purchases and sales.
              </p>
            </div>

            {/* Feature Grid (3x2 on lg) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3 shrink-0">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 flex flex-col items-start hover:bg-white/10 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center mb-2 shadow-lg ${feature.color}`}>
                    <feature.icon className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="font-semibold text-[11px] text-white mb-0.5 leading-tight">{feature.title}</h3>
                  <p className="text-[9px] text-blue-200/60 leading-snug">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom Highlights */}
            <div className="mt-auto pt-3 border-t border-white/5 flex flex-col sm:flex-row gap-3 shrink-0 pb-1">
               <div className="flex items-start gap-2 flex-1">
                 <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                 <div>
                   <h4 className="text-[11px] font-semibold text-white mb-0.5">Secure & Reliable</h4>
                   <p className="text-[10px] text-blue-200/50 leading-snug">Data stays protected with secure access controls.</p>
                 </div>
               </div>
               <div className="flex items-start gap-2 flex-1">
                 <Cloud className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                 <div>
                   <h4 className="text-[11px] font-semibold text-white mb-0.5">Access Anywhere</h4>
                   <p className="text-[10px] text-blue-200/50 leading-snug">Use on desktop, tablet or mobile anytime.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Auth Side (Right) - Dark theme matching the page */}
        <div className="lg:w-[40%] flex flex-col bg-[#131B32]/80 backdrop-blur-3xl border-l border-white/5 relative overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center py-10 px-6 sm:px-8 lg:px-12 w-full mx-auto">
            <Outlet />
          </div>
          
          {/* Watermark */}
          <div className="py-6 text-center mt-auto border-t border-white/5">
            <p className="text-[11px] text-blue-200/40 uppercase tracking-[0.2em] font-semibold">
              Powered by <span className="text-blue-400 font-bold ml-1">WeAlll</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
