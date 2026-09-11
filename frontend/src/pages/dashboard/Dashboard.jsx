import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  BookOpen, 
  PlusCircle, 
  ShoppingCart, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Boxes, 
  Layers, 
  RefreshCw, 
  IndianRupee, 
  Clock, 
  ChevronRight, 
  AlertOctagon, 
  CheckCircle2, 
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';

// Custom Chart Tooltip
const DashboardChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-xl border border-gray-800 text-xs space-y-1.5 min-w-[140px]">
        <p className="font-semibold text-gray-300 flex items-center justify-between border-b border-gray-800 pb-1">
          <span>{data.label || label}</span>
          <span className="text-[10px] text-gray-400 font-mono">{data.dayName}</span>
        </p>
        <p className="text-emerald-400 font-extrabold text-sm">
          {formatCurrency(data.revenue || 0)}
        </p>
        <p className="text-gray-300 text-[11px] flex items-center justify-between">
          <span className="text-gray-400">Completed Orders:</span>
          <span className="font-bold text-white bg-gray-800 px-1.5 py-0.5 rounded">{data.orders || 0}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Skeleton Placeholder
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="h-8 w-64 bg-gray-300 rounded"></div>
        <div className="h-4 w-80 bg-gray-200 rounded"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
        <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
      </div>
    </div>

    {/* KPI Grid Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm h-32 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="h-7 w-36 bg-gray-300 rounded"></div>
          <div className="h-3 w-28 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>

    {/* Chart Skeleton */}
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-72">
      <div className="h-5 w-48 bg-gray-200 rounded mb-4"></div>
      <div className="h-48 bg-gray-100 rounded-xl"></div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'orders'

  // Multi-language Pan-Indian greetings: picks a fresh greeting on every visit or page refresh
  const greeting = useMemo(() => {
    const greetingsList = [
      'Namaste',
      'Nomoshkar',
      'Vanakkam',
      'Aadaab',
      'Namaskar',
      'Sat Shri Akaal',
      'Khurumjari',
      'Namaskara',
      'Welcome'
    ];
    return greetingsList[Math.floor(Math.random() * greetingsList.length)];
  }, []);

  const fetchDashboard = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Calculate 7-day chart totals
  const chartTotals = useMemo(() => {
    if (!data?.dailyTrends) return { totalRevenue: 0, totalOrders: 0 };
    return data.dailyTrends.reduce((acc, curr) => ({
      totalRevenue: acc.totalRevenue + (curr.revenue || 0),
      totalOrders: acc.totalOrders + (curr.orders || 0)
    }), { totalRevenue: 0, totalOrders: 0 });
  }, [data]);

  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center max-w-lg mx-auto my-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mb-4 shadow-sm">
          <AlertTriangle size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Failed to load dashboard</h3>
        <p className="text-sm text-gray-500 mt-1.5">
          We encountered an issue fetching your real-time inventory and sales metrics.
        </p>
        <button
          onClick={() => fetchDashboard(true)}
          className="mt-5 btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl"
        >
          <RefreshCw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const lowStockCount = data.lowStockProducts?.length || 0;
  const isStaff = user?.role === 'staff';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Low Stock Urgent Mobile Banner */}
      {lowStockCount > 0 && (
        <Link
          to="/stock"
          className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-md active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <AlertTriangle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">
                {lowStockCount} Product{lowStockCount === 1 ? '' : 's'} Running Low
              </p>
              <p className="text-[11px] text-amber-100">Tap to inspect and reorder inventory</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg backdrop-blur-xs">
            <span>Restock</span>
            <ChevronRight size={14} />
          </div>
        </Link>
      )}

      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HERO HEADER & QUICK ACTION BAR                                */}
      {/* ========================================================================= */}
      <div 
        className="relative overflow-hidden rounded-2xl text-white p-5 sm:p-8 shadow-xl border transition-all"
        style={{
          background: 'var(--brand-gradient)',
          borderColor: 'var(--brand-border)',
          boxShadow: 'var(--brand-glow)'
        }}
      >
        {/* Subtle Ambient Glow Orbs */}
        <div 
          className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-25" 
          style={{ backgroundColor: 'var(--brand-primary)' }}
        />
        <div 
          className="absolute -right-12 top-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20" 
          style={{ backgroundColor: 'var(--brand-secondary)' }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold text-white/90 shadow-inner">
              <Sparkles size={12} className="text-amber-300" />
              <span className="truncate max-w-[180px] sm:max-w-none">
                {user?.tenantId?.businessName || user?.tenantId?.appName || 'Business Workspace'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-normal hidden sm:inline">Live System</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-1.5 flex-wrap">
              <span>{greeting},</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-gray-200">
                {user?.name || user?.tenantId?.ownerName || 'Admin'}
              </span>
              <span>👋</span>
            </h1>

            <p className="text-xs sm:text-sm text-white/80 flex items-center gap-2 flex-wrap font-medium">
              <span className="hidden sm:inline">Here's what's happening at <strong className="text-white font-semibold">{user?.tenantId?.businessName || user?.tenantId?.appName || 'your business'}</strong> today.</span>
              <Calendar size={13} className="text-white/70" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="text-white/40">•</span>
              <span>{data.totalProducts} items</span>
              <span className="text-white/40">•</span>
              <span>{data.totalClasses || 0} batches</span>
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pt-1">
            {!isStaff && (
              <>
                <Link 
                  to="/sales" 
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98] shrink-0 min-h-[42px]"
                >
                  <ShoppingCart size={15} />
                  <span>New Sale</span>
                </Link>

                <Link 
                  to="/purchases" 
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm border border-white/20 transition-all active:scale-[0.98] shrink-0 min-h-[42px]"
                >
                  <PlusCircle size={15} className="text-amber-200" />
                  <span>Restock</span>
                </Link>

                <Link 
                  to="/classes" 
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-sm border border-white/20 transition-all active:scale-[0.98] shrink-0 min-h-[42px]"
                >
                  <BookOpen size={15} className="text-white/80" />
                  <span>Batch</span>
                </Link>
              </>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 transition-all shadow-sm shrink-0 min-h-[42px] min-w-[42px] flex items-center justify-center cursor-pointer"
              title="Refresh Dashboard Data"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-white' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE KPI CARDS GRID (2x2 on mobile, 4-col on desktop)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Today</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
              <TrendingUp size={16} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight truncate">
              {formatCurrency(data.todaySales || 0)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
              <span className="inline-flex items-center font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded text-[10px] sm:text-xs">
                {data.todayOrders || 0} ord
              </span>
              <span className="hidden sm:inline">today</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        </div>

        {/* Card 2: Month to Date Sales */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Month</span>
            <div 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shadow-xs"
              style={{
                backgroundColor: 'var(--brand-tint)',
                color: 'var(--brand-primary)',
                borderColor: 'var(--brand-border)'
              }}
            >
              <IndianRupee size={16} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div 
              className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight truncate"
              style={{ color: 'var(--brand-primary)' }}
            >
              {formatCurrency(data.monthlySales || 0)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
              <span 
                className="inline-flex items-center font-bold px-1 py-0.5 rounded text-[10px] sm:text-xs"
                style={{
                  backgroundColor: 'var(--brand-tint)',
                  color: 'var(--brand-primary)'
                }}
              >
                {data.monthlyOrders || 0} ord
              </span>
              <span className="hidden sm:inline">this month</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'var(--brand-gradient)' }}></div>
        </div>

        {/* Card 3: Batch & Academy Collections */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Batches</span>
            <div 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shadow-xs"
              style={{
                backgroundColor: 'var(--brand-secondary-tint)',
                color: 'var(--brand-secondary)',
                borderColor: 'var(--brand-secondary-border)'
              }}
            >
              <GraduationCap size={16} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div 
              className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight truncate"
              style={{ color: 'var(--brand-secondary)' }}
            >
              {formatCurrency(data.batchRevenue || 0)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
              <span 
                className="inline-flex items-center font-bold px-1 py-0.5 rounded text-[10px] sm:text-xs"
                style={{
                  backgroundColor: 'var(--brand-secondary-tint)',
                  color: 'var(--brand-secondary)'
                }}
              >
                {data.totalStudents || 0} stu
              </span>
              <span className="hidden sm:inline">enrolled</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, var(--brand-secondary), var(--brand-primary))' }}></div>
        </div>

        {/* Card 4: Inventory Assets & Stock Health */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Assets</span>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shadow-xs ${
              lowStockCount > 0 
                ? 'bg-amber-50 border-amber-200 text-amber-600' 
                : 'bg-emerald-50 border-emerald-100 text-emerald-600'
            }`}>
              {lowStockCount > 0 ? <AlertTriangle size={16} className="sm:w-5 sm:h-5" /> : <Boxes size={16} className="sm:w-5 sm:h-5" />}
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight truncate">
              {formatCurrency(data.totalStockValue || 0)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs">
              <span className="text-gray-500 truncate">
                {(data.totalStockQuantity || 0).toLocaleString()} pcs
              </span>
              {lowStockCount > 0 ? (
                <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 text-[10px]">
                  {lowStockCount} low
                </span>
              ) : (
                <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                  Healthy
                </span>
              )}
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${
            lowStockCount > 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          }`}></div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE 7-DAY REVENUE & ORDER PERFORMANCE TREND                      */}
      {/* ========================================================================= */}
      {data.dailyTrends && data.dailyTrends.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} style={{ color: 'var(--brand-primary)' }} />
                <span>Sales & Volume Performance</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Last 7 days dynamic billing stream and completed transactions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Metric Switcher */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setChartMetric('revenue')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMetric === 'revenue' 
                      ? 'bg-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={chartMetric === 'revenue' ? { color: 'var(--brand-primary)' } : {}}
                >
                  Revenue (₹)
                </button>
                <button
                  onClick={() => setChartMetric('orders')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMetric === 'orders' 
                      ? 'bg-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={chartMetric === 'orders' ? { color: 'var(--brand-secondary)' } : {}}
                >
                  Orders Volume
                </button>
              </div>

              {/* 7-Day Total Chip */}
              <div 
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--brand-tint)',
                  color: 'var(--brand-primary)',
                  borderColor: 'var(--brand-border)'
                }}
              >
                <span>7-Day:</span>
                <span>{chartMetric === 'revenue' ? formatCurrency(chartTotals.totalRevenue) : `${chartTotals.totalOrders} orders`}</span>
              </div>
            </div>
          </div>

          <div className="h-52 sm:h-72 w-full pt-2 sm:pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyTrends} margin={{ top: 10, right: 10, left: -15, sm: { left: 0 }, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={user?.tenantId?.brandColor || '#6366f1'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={user?.tenantId?.brandColor || '#6366f1'} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="dashboardOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={user?.tenantId?.secondaryColor || '#06b6d4'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={user?.tenantId?.secondaryColor || '#06b6d4'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={val => chartMetric === 'revenue' ? (val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`) : val}
                />
                <Tooltip content={<DashboardChartTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey={chartMetric} 
                  stroke={chartMetric === 'revenue' ? (user?.tenantId?.brandColor || '#6366f1') : (user?.tenantId?.secondaryColor || '#06b6d4')} 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill={chartMetric === 'revenue' ? 'url(#dashboardRevenueGrad)' : 'url(#dashboardOrdersGrad)'} 
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAIN OPERATIONAL 2-COLUMN GRID                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: UPCOMING BATCHES & RECENT SALES                            */}
        {/* ======================================================================= */}
        <div className="space-y-6">
          {/* Upcoming Batches Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Upcoming Batches & Classes</h3>
                  <p className="text-xs text-gray-500">Upcoming cohort dates and student enrollment levels</p>
                </div>
              </div>
              <Link to="/classes" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>View all</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {data.upcomingBatches?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.upcomingBatches.map(batch => (
                  <Link 
                    key={batch._id} 
                    to={`/classes/${batch._id}`} 
                    className="p-3.5 sm:p-4 hover:bg-gray-50/70 active:bg-gray-100 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {batch.batchNumber}
                        </span>
                        <span className="font-bold text-gray-900 text-sm">{batch.topic}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          {formatDate(batch.date)}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                          {formatCurrency(batch.seatPrice || 0)} / seat
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Users size={12} />
                        <span>{batch.students?.length || 0} Enrolled</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs font-medium">
                <BookOpen size={24} className="mx-auto mb-2 text-gray-300" />
                <p>No upcoming batches scheduled</p>
                <Link to="/classes" className="mt-2 inline-flex items-center gap-1 text-indigo-600 hover:underline text-xs font-semibold">
                  <span>Schedule your first batch</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>

          {/* Recent Sales Activity */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Recent Invoices & Sales</h3>
                  <p className="text-xs text-gray-500">Live retail and counter transaction stream</p>
                </div>
              </div>
              <Link to="/sales" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>All sales</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {data.recentSales?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.recentSales.map(sale => {
                  const isVoided = sale.status === 'VOIDED';
                  return (
                    <Link 
                      key={sale._id} 
                      to="/sales" 
                      className="p-3.5 sm:p-4 hover:bg-gray-50/70 active:bg-gray-100 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {sale.invoiceNumber}
                          </span>
                          <span className="font-semibold text-gray-900 text-sm truncate max-w-[160px] sm:max-w-[220px]">
                            {sale.customerName || 'Walk-in Customer'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(sale.saleDate || sale.createdAt, true)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-sm text-gray-900">
                          {formatCurrency(sale.total)}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider mt-0.5 ${
                          isVoided 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {sale.status || 'COMPLETED'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs font-medium">
                <ShoppingCart size={24} className="mx-auto mb-2 text-gray-300" />
                <p>No recorded sales transactions yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: INVENTORY WATCHLIST & STOCK MOVEMENTS AUDIT              */}
        {/* ======================================================================= */}
        <div className="space-y-6">
          {/* Critical Stock Reorder Alerts */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50/40 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'}`}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>Reorder & Low Stock Watchlist</span>
                    {lowStockCount > 0 && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {lowStockCount} ALERT{lowStockCount === 1 ? '' : 'S'}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500">Products currently below replenishment threshold</p>
                </div>
              </div>
              <Link to="/stock" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>Manage stock</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {lowStockCount > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.lowStockProducts.map(p => {
                  const current = Number(p.currentStock) || 0;
                  const min = Number(p.minimumStock) || 1;
                  const isOut = current === 0;
                  const ratioPercent = Math.min(100, Math.round((current / min) * 100));

                  return (
                    <Link 
                      key={p._id} 
                      to="/stock" 
                      className="p-3.5 sm:p-4 hover:bg-gray-50/70 active:bg-gray-100 transition-colors space-y-2 block"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                              SKU: {p.sku}
                            </span>
                            {p.brand && (
                              <span className="text-xs text-gray-400">{p.brand}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-sm font-extrabold ${isOut ? 'text-rose-600' : 'text-amber-600'}`}>
                            {current} / {min} {p.unit || 'pcs'}
                          </span>
                          <span className={`block text-[10px] font-bold ${isOut ? 'text-rose-600' : 'text-amber-600'}`}>
                            {isOut ? 'Out of Stock' : 'Low Stock Alert'}
                          </span>
                        </div>
                      </div>

                      {/* Visual Health Gauge Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOut ? 'bg-rose-500 w-0' : ratioPercent <= 50 ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(ratioPercent, 4)}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-emerald-600 text-xs font-semibold flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                </div>
                <span>All products are above minimum safety thresholds!</span>
              </div>
            )}
          </div>

          {/* Recent Stock Movement Audit Stream */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Recent Stock Movements</h3>
                  <p className="text-xs text-gray-500">Live ledger of purchases, shipments, & adjustments</p>
                </div>
              </div>
              <Link to="/stock" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>View ledger</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {data.recentMovements?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.recentMovements.map(m => {
                  const isIn = m.type === 'IN';
                  const isOut = m.type === 'OUT';
                  return (
                    <Link 
                      key={m._id} 
                      to="/stock" 
                      className="p-3.5 sm:p-4 hover:bg-gray-50/70 active:bg-gray-100 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isIn ? 'bg-indigo-50 text-indigo-600' : isOut ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {isIn ? <ArrowDownLeft size={16} /> : isOut ? <ArrowUpRight size={16} /> : <RefreshCw size={14} />}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                            {m.productId?.name || 'Item Transaction'}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {formatDate(m.createdAt, true)}
                            {m.referenceType && <span className="ml-1 font-mono text-gray-500">({m.referenceType})</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-extrabold ${
                          isIn ? 'text-indigo-600' : isOut ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {isIn ? `+${m.quantity}` : isOut ? `-${m.quantity}` : m.quantity}
                        </span>
                        <span className="block text-[10px] font-semibold text-gray-400 uppercase">
                          {m.type}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs font-medium">
                <Layers size={24} className="mx-auto mb-2 text-gray-300" />
                <p>No recent stock movement logs found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
