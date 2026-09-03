import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Package, Menu, X, CheckCircle2, TrendingUp, Shield, 
  Smartphone, ArrowRight, LayoutDashboard, ShoppingCart, 
  Truck, Receipt, Users, Zap, AlertCircle
} from 'lucide-react';
import wealllLogo from '../../assets/wealll-logo.jpg';
import wealllMiniLogo from '../../assets/wealll-mini-logo.png';

const features = [
  { 
    title: "Real-Time Stock", 
    desc: "Know exactly what you have.", 
    icon: Package, 
    color: "text-cyan-600", 
    bg: "bg-cyan-50",
    glow: "group-hover:shadow-cyan-500/10",
    border: "group-hover:border-cyan-200"
  },
  { 
    title: "Sales Management", 
    desc: "Track sales and update stock automatically.", 
    icon: ShoppingCart, 
    color: "text-rose-600", 
    bg: "bg-rose-50",
    glow: "group-hover:shadow-rose-500/10",
    border: "group-hover:border-rose-200"
  },
  { 
    title: "Purchase Tracking", 
    desc: "Manage purchases and incoming stock.", 
    icon: Truck, 
    color: "text-emerald-600", 
    bg: "bg-emerald-50",
    glow: "group-hover:shadow-emerald-500/10",
    border: "group-hover:border-emerald-200"
  },
  { 
    title: "GST-Ready", 
    desc: "Keep business transactions organized.", 
    icon: Receipt, 
    color: "text-amber-600", 
    bg: "bg-amber-50",
    glow: "group-hover:shadow-amber-500/10",
    border: "group-hover:border-amber-200"
  },
  { 
    title: "Business Analytics", 
    desc: "Understand your business at a glance.", 
    icon: TrendingUp, 
    color: "text-violet-600", 
    bg: "bg-violet-50",
    glow: "group-hover:shadow-violet-500/10",
    border: "group-hover:border-violet-200"
  },
  { 
    title: "Multi-User Access", 
    desc: "Work securely with your team.", 
    icon: Users, 
    color: "text-blue-600", 
    bg: "bg-blue-50",
    glow: "group-hover:shadow-blue-500/10",
    border: "group-hover:border-blue-200"
  },
];

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    document.title = "Best Inventory System for Small Businesses | WeAlll";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "WeAlll Inventory helps small businesses manage products, stock, purchases and sales in one simple inventory management system.";
  }, []);

  if (user) {
    if (user.role === 'superadmin') return <Navigate to="/wealll-admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const scrollToSection = (id) => {
    closeMobileMenu();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/90 via-purple-50/50 to-violet-100/90 font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
      
      {/* Custom Animations injected safely */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out 2s infinite; }
      `}</style>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-50/80 to-violet-50/80 backdrop-blur-xl border-b border-white/50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shadow-slate-200 border border-slate-100 overflow-hidden group-hover:shadow-md transition-shadow p-1.5">
                <img src={wealllMiniLogo} alt="WeAlll Icon" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none tracking-tight text-slate-900">WeAlll Inventory</span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:block">Smart Inventory. Stronger Business.</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</button>
              <button onClick={() => scrollToSection('benefits')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Benefits</button>
              <div className="flex items-center gap-4 ml-4">
                <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">Sign In</Link>
                <Link to="/register" className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 px-5 py-2.5 rounded-lg shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(99,102,241,0.6)] transition-all duration-300 hover:-translate-y-0.5 border border-white/20">
                  Get Started &rarr;
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 pt-2 pb-6 flex flex-col space-y-4">
              <button onClick={() => scrollToSection('features')} className="text-left px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors">Features</button>
              <button onClick={() => scrollToSection('benefits')} className="text-left px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors">Benefits</button>
              <div className="h-px bg-slate-100 my-2 mx-4"></div>
              <Link to="/login" onClick={closeMobileMenu} className="px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">Sign In</Link>
              <Link to="/register" onClick={closeMobileMenu} className="mx-4 text-center text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 px-5 py-3.5 rounded-xl shadow-md transition-all">
                Get Started &rarr;
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-24 md:pt-28 md:pb-32 overflow-hidden">
          {/* Subtle Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 flex justify-center">
            {/* Left Blue Glow */}
            <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]"></div>
            {/* Center Fuchsia Glow */}
            <div className="absolute top-[10%] left-[40%] w-[400px] h-[400px] bg-fuchsia-500/15 rounded-full blur-[120px]"></div>
            {/* Right Violet Glow */}
            <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[100px]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
              
              {/* Hero Content (Left) */}
              <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="text-xs sm:text-sm font-bold tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                    Built for Small & Growing Businesses
                  </span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
                  The Best Inventory System<br className="hidden sm:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-fuchsia-600 to-violet-600">for Small Businesses</span>
                </h1>
                
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-600 mb-6 flex flex-col sm:flex-row sm:gap-2 items-center lg:items-start animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
                  <span>Manage Stock.</span>
                  <span className="hidden sm:inline text-slate-300">&bull;</span>
                  <span>Track Sales.</span>
                  <span className="hidden sm:inline text-slate-300">&bull;</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Grow Faster.</span>
                </h2>

                <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-500 delay-300">
                  Replace spreadsheets and manual stock tracking with one simple, powerful system for products, stock, purchases and sales.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-12 duration-500 delay-500">
                  <Link to="/register" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white flex justify-center items-center gap-2 text-base py-3.5 px-8 rounded-xl font-semibold shadow-[0_10px_25px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_15px_35px_-5px_rgba(99,102,241,0.6)] hover:-translate-y-1 transition-all duration-300 border border-white/20">
                    Get Started &rarr;
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 flex justify-center items-center gap-2 text-base py-3.5 px-8 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-300">
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Hero Visual (Right) - Enhanced CSS Dashboard Preview */}
              <div className="flex-1 w-full max-w-3xl lg:max-w-none relative animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                
                {/* Floating Elements (SaaS feel) */}
                <div className="hidden lg:flex absolute -left-10 top-24 z-20 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sales Today</div>
                      <div className="text-sm font-black text-slate-900">+₹2,500</div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex absolute -right-6 top-48 z-20 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Low Stock</div>
                      <div className="text-sm font-black text-slate-900">12 Items</div>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard Mockup */}
                <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-blue-500/50 via-fuchsia-500/30 to-violet-500/50 shadow-[0_30px_60px_-15px_rgba(59,130,246,0.3)] transform lg:rotate-1 hover:rotate-0 transition-transform duration-500 group animate-float">
                  <div className="relative rounded-[14px] bg-white/95 backdrop-blur-md overflow-hidden">
                    
                    {/* Subtle outer glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/0 to-violet-400/0 group-hover:from-blue-400/10 group-hover:to-violet-400/10 transition-colors duration-500 -z-10 pointer-events-none"></div>

                  {/* Browser Chrome */}
                  <div className="h-10 border-b border-slate-100 bg-slate-50/80 flex items-center px-4 gap-2 backdrop-blur-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    <div className="ml-4 w-64 h-5 bg-white border border-slate-200 rounded text-[10px] text-slate-400 flex items-center px-2 shadow-sm font-mono">
                      wealll.com/dashboard
                    </div>
                  </div>
                  
                  {/* Mockup Content */}
                  <div className="flex h-[380px] sm:h-[480px]">
                    {/* Sidebar */}
                    <div className="w-16 sm:w-48 border-r border-slate-100 bg-white/50 p-3 flex flex-col gap-3">
                      <div className="h-9 bg-blue-50 rounded-lg flex items-center px-2 gap-2 text-blue-600">
                        <LayoutDashboard className="w-4 h-4 shrink-0" /> <span className="hidden sm:block text-xs font-semibold">Dashboard</span>
                      </div>
                      <div className="h-9 hover:bg-slate-50 rounded-lg flex items-center px-2 gap-2 text-slate-500 transition-colors">
                        <Package className="w-4 h-4 shrink-0" /> <span className="hidden sm:block text-xs font-medium">Products</span>
                      </div>
                      <div className="h-9 hover:bg-slate-50 rounded-lg flex items-center px-2 gap-2 text-slate-500 transition-colors">
                        <ShoppingCart className="w-4 h-4 shrink-0" /> <span className="hidden sm:block text-xs font-medium">Sales</span>
                      </div>
                      <div className="h-9 hover:bg-slate-50 rounded-lg flex items-center px-2 gap-2 text-slate-500 transition-colors">
                        <Truck className="w-4 h-4 shrink-0" /> <span className="hidden sm:block text-xs font-medium">Purchases</span>
                      </div>
                    </div>
                    
                    {/* Main Area */}
                    <div className="flex-1 bg-slate-50/30 p-4 sm:p-6 overflow-hidden">
                      <div className="w-40 h-5 bg-slate-200 rounded-md mb-6"></div>
                      
                      {/* Stat Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        {[
                          { title: 'Total Products', val: '248', icon: <Package className="w-4 h-4 text-blue-500" /> },
                          { title: 'Low Stock', val: '12', icon: <AlertCircle className="w-4 h-4 text-amber-500" /> },
                          { title: 'Monthly Sales', val: '1,450', icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
                          { title: 'Active Orders', val: '34', icon: <ShoppingCart className="w-4 h-4 text-violet-500" /> }
                        ].map((stat, i) => (
                          <div key={i} className="bg-white p-3 sm:p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">{stat.title}</div>
                              <div className="text-xs opacity-50">{stat.icon}</div>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-slate-800">{stat.val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Fake Chart/Table Area */}
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col h-56">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-sm font-bold text-slate-800">Recent Sales</div>
                          <div className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">View All</div>
                        </div>
                        <div className="space-y-3">
                          {[1,2,3].map(i => (
                            <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs border border-slate-100"><Receipt className="w-3.5 h-3.5 text-slate-400" /></div>
                                <div>
                                  <div className="font-semibold text-slate-700">Order #{1024 + i}</div>
                                  <div className="text-[10px] text-slate-400">Just now</div>
                                </div>
                              </div>
                              <span className="text-emerald-600 font-bold">+₹{1250 * i}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>

            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section id="benefits" className="py-24 bg-white relative z-10 border-y border-slate-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Stop Managing Inventory the Hard Way</h2>
              <p className="text-base sm:text-lg text-slate-600">Replace spreadsheets and manual tracking with a system designed to keep your business organized effortlessly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
              
              <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-transparent hover:border-blue-100 hover:bg-blue-50/30 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm shadow-blue-500/10 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Less Manual Work</h3>
                <p className="text-slate-600 leading-relaxed">Spend less time maintaining spreadsheets and more time running your business.</p>
              </div>

              <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm shadow-emerald-500/10 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Better Stock Control</h3>
                <p className="text-slate-600 leading-relaxed">Know what's available before you sell, purchase or reorder.</p>
              </div>

              <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-transparent hover:border-violet-100 hover:bg-violet-50/30 hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm shadow-violet-500/10 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Work With Your Team</h3>
                <p className="text-slate-600 leading-relaxed">Give your team secure access with role-based permissions.</p>
              </div>

            </div>
          </div>
        </section>

        {/* SMALL BUSINESS POSITIONING */}
        <section className="py-24 bg-gradient-to-r from-blue-50 to-violet-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 tracking-tight">
              Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">Small & Growing Businesses</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
              Whether you're managing a beauty business, retail operation, distribution business or growing team, WeAlll Inventory gives you one simple place to manage your products, stock, purchases and sales.
            </p>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Everything You Need to Manage Inventory</h2>
              <p className="text-base sm:text-lg text-slate-600">Track products, monitor stock, record purchases and manage sales from one simple platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className={`group bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ${feature.glow} ${feature.border}`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${feature.bg} ${feature.color}`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT SHOWCASE SECTION */}
        <section className="py-24 bg-slate-50/30 overflow-hidden relative border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Your Business. One Simple Dashboard.</h2>
              <p className="text-base sm:text-lg text-slate-600">Get a clear view of your inventory, sales, purchases and stock without managing multiple spreadsheets.</p>
            </div>
            
            {/* Visual Showcase - Larger App Preview */}
            <div className="relative max-w-5xl mx-auto mt-10">
              {/* Giant background glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 via-violet-400/10 to-transparent rounded-3xl blur-3xl -z-10 transform scale-110"></div>
              
              <div className="bg-white/90 backdrop-blur-md border border-white shadow-[0_40px_80px_-20px_rgba(59,130,246,0.15)] ring-1 ring-violet-500/10 rounded-2xl overflow-hidden animate-float">
                <div className="h-14 bg-slate-50/80 backdrop-blur border-b border-slate-100 flex items-center px-6 justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-600" />
                    <span className="font-bold text-slate-800 text-sm tracking-tight">WeAlll Inventory</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-white shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row h-[450px] sm:h-[650px] bg-slate-50/50">
                   <div className="hidden sm:block w-64 bg-white/50 border-r border-slate-100 p-5 space-y-2">
                     <div className="h-10 bg-blue-50 rounded-xl flex items-center px-3 border border-blue-100/50 text-blue-700 font-medium text-sm">
                        <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
                     </div>
                     <div className="h-10 hover:bg-slate-100 rounded-xl flex items-center px-3 text-slate-600 font-medium text-sm transition-colors cursor-pointer">
                        <Package className="w-4 h-4 mr-3 opacity-70" /> Products
                     </div>
                     <div className="h-10 hover:bg-slate-100 rounded-xl flex items-center px-3 text-slate-600 font-medium text-sm transition-colors cursor-pointer">
                        <ShoppingCart className="w-4 h-4 mr-3 opacity-70" /> Sales
                     </div>
                   </div>
                   
                   <div className="flex-1 p-6 sm:p-10 overflow-hidden bg-white/40">
                      <div className="w-56 h-7 bg-slate-200 rounded-md mb-8"></div>
                      
                      {/* Detailed Fake Table */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="h-14 border-b border-slate-100 bg-slate-50/50 flex items-center px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                           <div className="flex-1">Product Name</div>
                           <div className="flex-1 hidden sm:block">Category</div>
                           <div className="flex-1">Status</div>
                           <div className="flex-1 text-right">Price</div>
                        </div>
                        {[
                          { name: 'Premium Foundation', cat: 'Cosmetics', status: 'In Stock', price: '₹1,200', c: 'emerald' },
                          { name: 'Matte Lipstick Set', cat: 'Cosmetics', status: 'Low Stock', price: '₹850', c: 'amber' },
                          { name: 'Professional Brush Kit', cat: 'Tools', status: 'In Stock', price: '₹2,400', c: 'emerald' },
                          { name: 'Setting Spray 100ml', cat: 'Cosmetics', status: 'Out of Stock', price: '₹950', c: 'rose' },
                          { name: 'Skincare Bundle', cat: 'Skincare', status: 'In Stock', price: '₹3,500', c: 'emerald' },
                          { name: 'Rose Gold Highlighter', cat: 'Cosmetics', status: 'In Stock', price: '₹1,100', c: 'emerald' }
                        ].map((row, i) => (
                           <div key={i} className="h-16 border-b border-slate-50 flex items-center px-6 text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                             <div className="flex-1 flex items-center gap-3 pr-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm text-lg">✨</div>
                                <div className="font-bold text-slate-800 truncate">{row.name}</div>
                             </div>
                             <div className="flex-1 hidden sm:block text-slate-500 font-medium truncate">{row.cat}</div>
                             <div className="flex-1">
                               <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm bg-${row.c}-50 text-${row.c}-700 border-${row.c}-200`}>
                                 {row.status}
                               </span>
                             </div>
                             <div className="flex-1 text-right font-black text-slate-700">{row.price}</div>
                           </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACCESS ANYWHERE / TRUST ROW */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-5 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Secure & Reliable</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Keep your business data protected with secure access controls.</p>
                </div>
              </div>
              <div className="flex items-start gap-5 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 hover:bg-violet-50/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Access Anywhere</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Manage your inventory from desktop, tablet or mobile smoothly.</p>
                </div>
              </div>
              <div className="flex items-start gap-5 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 hover:bg-emerald-50/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Simple & Easy</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Designed to replace complicated spreadsheets with a simpler workflow.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 sm:py-32 bg-gradient-to-br from-blue-50/80 via-white to-violet-50/80 relative overflow-hidden">
          {/* Subtle blurred orbs */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]"></div>
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-violet-400/20 rounded-full blur-[100px]"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Ready to Take Control of Your Inventory?</h2>
            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">Start managing your stock smarter with WeAlll Inventory today.</p>
            
            <div className="flex flex-col items-center justify-center gap-6">
              <Link to="/register" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-violet-600 text-white flex justify-center items-center gap-2 text-lg py-4 px-12 rounded-xl font-bold shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300">
                Get Started &rarr;
              </Link>
              <p className="text-slate-500 text-sm">
                Already have an account? <Link to="/login" className="font-bold text-blue-600 hover:text-violet-600 transition-colors">Sign In &rarr;</Link>
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-50/50 border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-500 flex items-center justify-center shadow-sm">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900">WeAlll Inventory</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Smart Inventory. Stronger Business.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-5 uppercase tracking-wider text-sm">Product</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('features')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('benefits')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Benefits</button></li>
                <li><Link to="/login" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Apply for Registration</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-5 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-3">
               <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-0.5">Powered by</span>
               <a href="https://wealll.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                 <img src={wealllLogo} alt="WeAlll" className="h-5 object-contain transition-all" />
               </a>
             </div>
             <p className="text-sm text-slate-400 font-medium">© {new Date().getFullYear()} WeAlll. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
