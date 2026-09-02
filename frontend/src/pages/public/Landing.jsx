import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Package, Menu, X, CheckCircle2, TrendingUp, Shield, 
  Smartphone, ArrowRight, LayoutDashboard, ShoppingCart, 
  Truck, Receipt, Users, Zap
} from 'lucide-react';
import wealllLogo from '../../assets/wealll-logo.jpg';

const features = [
  { title: "Real-Time Stock", desc: "Know exactly what you have.", icon: Package, color: "text-[#4285F4]", bg: "bg-blue-50" },
  { title: "Sales Management", desc: "Track sales and update stock automatically.", icon: ShoppingCart, color: "text-[#EA4335]", bg: "bg-red-50" },
  { title: "Purchase Tracking", desc: "Manage purchases and incoming stock.", icon: Truck, color: "text-[#34A853]", bg: "bg-green-50" },
  { title: "GST-Ready", desc: "Keep business transactions organized.", icon: Receipt, color: "text-[#FBBC05]", bg: "bg-yellow-50" },
  { title: "Business Analytics", desc: "Understand your business at a glance.", icon: TrendingUp, color: "text-[#4285F4]", bg: "bg-blue-50" },
  { title: "Multi-User Access", desc: "Work securely with your team.", icon: Users, color: "text-[#EA4335]", bg: "bg-red-50" },
];

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    document.title = "Best Inventory System for Small Businesses | WeAlll";
    // Setup meta description if possible or just rely on server rendering
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
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <Package className="w-7 h-7 text-[#4285F4]" />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none tracking-tight text-gray-900">WeAlll Inventory</span>
                <span className="text-[10px] text-gray-500 font-medium hidden sm:block">Smart Inventory. Stronger Business.</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</button>
              <button onClick={() => scrollToSection('benefits')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Benefits</button>
              <div className="flex items-center gap-4 ml-4">
                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">Sign In</Link>
                <Link to="/register" className="text-sm font-semibold text-white bg-[#4285F4] hover:bg-[#3367D6] px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5">
                  Get Started →
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 pt-2 pb-6 flex flex-col space-y-4">
              <button onClick={() => scrollToSection('features')} className="text-left px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl">Features</button>
              <button onClick={() => scrollToSection('benefits')} className="text-left px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl">Benefits</button>
              <div className="h-px bg-gray-100 my-2 mx-4"></div>
              <Link to="/login" onClick={closeMobileMenu} className="px-4 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 rounded-xl">Sign In</Link>
              <Link to="/register" onClick={closeMobileMenu} className="mx-4 text-center text-base font-semibold text-white bg-[#4285F4] hover:bg-[#3367D6] px-5 py-3.5 rounded-xl shadow-md transition-colors">
                Get Started →
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
          {/* Subtle Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40 z-0 flex justify-center">
            <div className="w-[800px] h-[500px] bg-[#4285F4]/10 rounded-full blur-[100px] -translate-y-1/3"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
              
              {/* Hero Content (Left) */}
              <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start w-full">
                <p className="text-[#4285F4] text-xs sm:text-sm font-bold tracking-widest uppercase mb-4 sm:mb-6 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 inline-block w-max mx-auto lg:mx-0">
                  Built for Small & Growing Businesses
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
                  The Best Inventory System<br className="hidden sm:block" /> for Small Businesses
                </h1>
                
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:gap-2 items-center lg:items-start">
                  <span>Manage Stock.</span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span>Track Sales.</span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className="text-[#4285F4]">Grow Faster.</span>
                </h2>

                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-8 sm:mb-10 leading-relaxed">
                  Replace spreadsheets and manual stock tracking with one simple system for products, stock, purchases and sales.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Link to="/register" className="w-full sm:w-auto bg-[#4285F4] text-white flex justify-center items-center gap-2 text-base py-3.5 px-8 rounded-xl font-semibold shadow-[0_8px_20px_-6px_rgba(66,133,244,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(66,133,244,0.5)] hover:bg-[#3367D6] hover:-translate-y-0.5 transition-all duration-200">
                    Get Started →
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto bg-white text-gray-700 border border-gray-300 flex justify-center items-center gap-2 text-base py-3.5 px-8 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Hero Visual (Right) - CSS Dashboard Preview */}
              <div className="flex-1 w-full max-w-3xl lg:max-w-none relative animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                <div className="relative rounded-2xl bg-white border border-gray-200 shadow-2xl shadow-blue-900/10 overflow-hidden transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
                  {/* Fake Browser/App Chrome */}
                  <div className="h-10 border-b border-gray-100 bg-gray-50/80 flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    <div className="ml-4 w-64 h-5 bg-white border border-gray-200 rounded text-[10px] text-gray-400 flex items-center px-2 shadow-sm font-mono">
                      wealll.com/dashboard
                    </div>
                  </div>
                  
                  {/* Fake Dashboard Content */}
                  <div className="flex h-[350px] sm:h-[450px]">
                    {/* Sidebar */}
                    <div className="w-16 sm:w-48 border-r border-gray-100 bg-white p-3 flex flex-col gap-3">
                      <div className="h-8 bg-blue-50 rounded-md flex items-center px-2 gap-2 text-[#4285F4]">
                        <LayoutDashboard className="w-4 h-4 shrink-0" /> <span className="hidden sm:block text-xs font-semibold">Dashboard</span>
                      </div>
                      <div className="h-8 hover:bg-gray-50 rounded-md flex items-center px-2 gap-2 text-gray-500">
                        <Package className="w-4 h-4 shrink-0" /> <span className="hidden sm:block text-xs font-medium">Products</span>
                      </div>
                      <div className="h-8 hover:bg-gray-50 rounded-md flex items-center px-2 gap-2 text-gray-500">
                        <ShoppingCart className="w-4 h-4 shrink-0" /> <span className="hidden sm:block text-xs font-medium">Sales</span>
                      </div>
                      <div className="h-8 hover:bg-gray-50 rounded-md flex items-center px-2 gap-2 text-gray-500">
                        <Truck className="w-4 h-4 shrink-0" /> <span className="hidden sm:block text-xs font-medium">Purchases</span>
                      </div>
                    </div>
                    {/* Main Area */}
                    <div className="flex-1 bg-gray-50/50 p-4 sm:p-6 overflow-hidden">
                      <div className="w-32 h-4 bg-gray-200 rounded mb-6"></div>
                      
                      {/* Stat Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        {[
                          { title: 'Total Products', val: '248', c: 'blue' },
                          { title: 'Low Stock', val: '12', c: 'red' },
                          { title: 'Monthly Sales', val: '1,450', c: 'green' },
                          { title: 'Active Orders', val: '34', c: 'yellow' }
                        ].map((stat, i) => (
                          <div key={i} className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="text-[10px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">{stat.title}</div>
                            <div className="text-lg sm:text-2xl font-bold text-gray-800">{stat.val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Fake Chart/Table Area */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-48 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-sm font-bold text-gray-800">Recent Sales</div>
                          <div className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">View All</div>
                        </div>
                        <div className="space-y-3">
                          {[1,2,3].map(i => (
                            <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-xs">🛍️</div>
                                <span className="font-medium text-gray-700">Order #{1024 + i}</span>
                              </div>
                              <span className="text-green-600 font-semibold">+₹{1250 * i}</span>
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
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Everything You Need to Manage Inventory</h2>
              <p className="text-base sm:text-lg text-gray-600">Track products, monitor stock, record purchases and manage sales from one simple platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.bg}`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT SHOWCASE SECTION */}
        <section className="py-20 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Your Business. One Simple Dashboard.</h2>
              <p className="text-base sm:text-lg text-gray-600">Get a clear view of your inventory, sales, purchases and stock without managing multiple spreadsheets.</p>
            </div>
            
            {/* Visual Showcase - Larger App Preview */}
            <div className="relative max-w-5xl mx-auto mt-10">
              <div className="absolute inset-0 bg-gradient-to-b from-[#4285F4]/5 to-transparent rounded-3xl blur-2xl -z-10"></div>
              <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
                <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-6 justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#4285F4]" />
                    <span className="font-bold text-gray-800 text-sm">WeAlll Inventory</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row h-[400px] sm:h-[600px] bg-gray-50/30">
                   <div className="hidden sm:block w-56 bg-white border-r border-gray-200 p-4 space-y-2">
                     <div className="h-10 bg-blue-50 rounded-lg flex items-center px-3 border border-blue-100">
                        <div className="w-4 h-4 rounded bg-[#4285F4]/20 mr-3"></div>
                        <div className="w-24 h-2.5 bg-[#4285F4]/40 rounded"></div>
                     </div>
                     <div className="h-10 rounded-lg flex items-center px-3 opacity-50">
                        <div className="w-4 h-4 rounded bg-gray-300 mr-3"></div>
                        <div className="w-20 h-2.5 bg-gray-300 rounded"></div>
                     </div>
                     <div className="h-10 rounded-lg flex items-center px-3 opacity-50">
                        <div className="w-4 h-4 rounded bg-gray-300 mr-3"></div>
                        <div className="w-16 h-2.5 bg-gray-300 rounded"></div>
                     </div>
                   </div>
                   <div className="flex-1 p-6 sm:p-8 overflow-hidden">
                      <div className="w-48 h-6 bg-gray-200 rounded mb-8"></div>
                      
                      {/* Fake Table */}
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="h-12 border-b border-gray-100 bg-gray-50 flex items-center px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                           <div className="flex-1">Product Name</div>
                           <div className="flex-1 hidden sm:block">Category</div>
                           <div className="flex-1">Status</div>
                           <div className="flex-1 text-right">Price</div>
                        </div>
                        {[
                          { name: 'Premium Foundation', cat: 'Cosmetics', status: 'In Stock', price: '₹1,200', color: 'bg-green-50 text-green-700 border-green-100' },
                          { name: 'Matte Lipstick Set', cat: 'Cosmetics', status: 'Low Stock', price: '₹850', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
                          { name: 'Professional Brush Kit', cat: 'Tools', status: 'In Stock', price: '₹2,400', color: 'bg-green-50 text-green-700 border-green-100' },
                          { name: 'Setting Spray 100ml', cat: 'Cosmetics', status: 'Out of Stock', price: '₹950', color: 'bg-red-50 text-red-700 border-red-100' },
                          { name: 'Skincare Bundle', cat: 'Skincare', status: 'In Stock', price: '₹3,500', color: 'bg-green-50 text-green-700 border-green-100' },
                          { name: 'Rose Gold Highlighter', cat: 'Cosmetics', status: 'In Stock', price: '₹1,100', color: 'bg-green-50 text-green-700 border-green-100' }
                        ].map((row, i) => (
                           <div key={i} className="h-16 border-b border-gray-50 flex items-center px-6 text-sm hover:bg-gray-50 transition-colors">
                             <div className="flex-1 flex items-center gap-3 pr-2">
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">✨</div>
                                <div className="font-semibold text-gray-800 truncate">{row.name}</div>
                             </div>
                             <div className="flex-1 hidden sm:block text-gray-500 truncate">{row.cat}</div>
                             <div className="flex-1">
                               <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${row.color}`}>
                                 {row.status}
                               </span>
                             </div>
                             <div className="flex-1 text-right font-medium text-gray-700">{row.price}</div>
                           </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section id="benefits" className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Stop Managing Inventory the Hard Way</h2>
              <p className="text-base sm:text-lg text-gray-600">Replace spreadsheets and manual tracking with a system designed to keep your business organized.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 text-[#4285F4] rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Less Manual Work</h3>
                <p className="text-gray-600 leading-relaxed">Spend less time maintaining spreadsheets and more time running your business.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 text-[#34A853] rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Better Stock Control</h3>
                <p className="text-gray-600 leading-relaxed">Know what's available before you sell, purchase or reorder.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 text-[#EA4335] rounded-full flex items-center justify-center mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Work With Your Team</h3>
                <p className="text-gray-600 leading-relaxed">Give your team secure access with role-based permissions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SMALL BUSINESS POSITIONING */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 tracking-tight">Built for Small & Growing Businesses</h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Whether you're managing a beauty business, retail operation, distribution business or growing team, WeAlll Inventory gives you one simple place to manage your products, stock, purchases and sales.
            </p>
          </div>
        </section>

        {/* ACCESS ANYWHERE / TRUST ROW */}
        <section className="py-12 bg-blue-50/50 border-y border-blue-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-[#4285F4] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Secure & Reliable</h4>
                  <p className="text-sm text-gray-600">Keep your business data protected with secure access controls.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Smartphone className="w-6 h-6 text-[#4285F4] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Access Anywhere</h4>
                  <p className="text-sm text-gray-600">Manage your inventory from desktop, tablet or mobile.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-[#4285F4] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Simple & Easy</h4>
                  <p className="text-sm text-gray-600">Designed to replace complicated spreadsheets with a simpler workflow.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-[#4285F4]/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Ready to Take Control of Your Inventory?</h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">Start managing your stock smarter with WeAlll Inventory.</p>
            
            <div className="flex flex-col items-center justify-center gap-6">
              <Link to="/register" className="w-full sm:w-auto bg-[#4285F4] text-white flex justify-center items-center gap-2 text-lg py-4 px-10 rounded-xl font-bold shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:bg-[#3367D6] hover:-translate-y-1 transition-all duration-300">
                Get Started →
              </Link>
              <p className="text-gray-500 text-sm">
                Already have an account? <Link to="/login" className="font-semibold text-[#4285F4] hover:text-[#3367D6] transition-colors">Sign In →</Link>
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-6 h-6 text-[#4285F4]" />
                <span className="font-bold text-xl text-gray-900">WeAlll Inventory</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs">Smart Inventory. Stronger Business.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('features')} className="text-sm text-gray-500 hover:text-[#4285F4] transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('benefits')} className="text-sm text-gray-500 hover:text-[#4285F4] transition-colors">Benefits</button></li>
                <li><Link to="/login" className="text-sm text-gray-500 hover:text-[#4285F4] transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="text-sm text-gray-500 hover:text-[#4285F4] transition-colors">Apply for Registration</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-gray-500 hover:text-[#4285F4] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-[#4285F4] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-2">
               <span className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-semibold mt-0.5">Powered by</span>
               <a href="https://wealll.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                 <img src={wealllLogo} alt="WeAlll" className="h-4 object-contain transition-all" />
               </a>
             </div>
             <p className="text-sm text-gray-400">© {new Date().getFullYear()} WeAlll. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
