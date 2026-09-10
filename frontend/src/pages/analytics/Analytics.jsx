import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  IndianRupee, 
  TrendingUp, 
  ShoppingBag, 
  GraduationCap, 
  RotateCw, 
  Layers, 
  Calendar, 
  Package, 
  ArrowRight,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';

const DATE_RANGE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7days' },
  { label: '30 Days', value: '30days' },
  { label: 'This Month', value: 'thisMonth' },
  { label: '90 Days', value: '90days' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
];

const CATEGORY_PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-700 text-xs space-y-1">
        <p className="font-semibold text-gray-300">{formatDate(label)}</p>
        <p className="text-emerald-400 font-extrabold text-sm">
          Revenue: {formatCurrency(payload[0].value)}
        </p>
        {payload[0].payload.orders !== undefined && (
          <p className="text-gray-400 text-[11px]">
            Orders: <span className="font-bold text-white">{payload[0].payload.orders}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'PRODUCTS' | 'BATCHES'
  const [chartView, setChartView] = useState('REVENUE'); // 'REVENUE' | 'ORDERS'

  const fetchAnalytics = useCallback(async (range = dateRange) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics?range=${range}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load business analytics data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics(dateRange);
  }, [dateRange, fetchAnalytics]);

  // Derived metrics
  const metrics = data?.metrics || {
    combinedRevenue: 0,
    productRevenue: 0,
    batchRevenue: 0,
    totalSales: 0,
    totalStudents: 0,
    totalBatches: 0,
    totalDue: 0,
    productDues: 0,
    batchDues: 0,
    avgOrderValue: 0
  };

  const profit = data?.profit || {
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0
  };

  const salesTrend = useMemo(() => {
    return data?.salesTrend || [];
  }, [data]);

  const topProducts = useMemo(() => {
    return data?.topProducts || [];
  }, [data]);

  const categoryBreakdown = useMemo(() => {
    return data?.categoryBreakdown || [];
  }, [data]);

  const batchPerformance = useMemo(() => {
    return data?.batchPerformance || [];
  }, [data]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 tracking-tight">
                Analytics & Business Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Consolidated revenue performance, product sales velocity, academy batches, and profit margins.
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter & Refresh Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white border border-gray-200 rounded-xl p-1 shadow-2xs flex items-center gap-1 overflow-x-auto">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDateRange(opt.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 ${
                  dateRange === opt.value
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchAnalytics(dateRange)}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 rounded-xl shadow-2xs transition-all cursor-pointer"
            title="Refresh analytics data"
          >
            <RotateCw size={16} className={loading ? 'animate-spin text-indigo-600' : ''} />
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Consolidated Gross Revenue */}
        <div className="bg-white shadow-xs border border-gray-200/80 rounded-2xl p-5 flex flex-col justify-between border-l-4 border-indigo-600 bg-gradient-to-br from-white to-indigo-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {formatCurrency(metrics.combinedRevenue)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <span className="font-semibold text-emerald-700">Sales: {formatCurrency(metrics.productRevenue)}</span>
              <span>•</span>
              <span className="font-semibold text-indigo-600">Batches: {formatCurrency(metrics.batchRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Orders & Product Velocity */}
        <div className="bg-white shadow-xs border border-gray-200/80 rounded-2xl p-5 flex flex-col justify-between border-l-4 border-emerald-600 bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Sales</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {metrics.totalSales} <span className="text-xs font-semibold text-gray-400">Orders</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Avg Order Value: <strong className="text-gray-800">{formatCurrency(metrics.avgOrderValue)}</strong>
            </p>
          </div>
        </div>

        {/* Card 3: Est. Gross Profit & Margin */}
        <div className="bg-white shadow-xs border border-gray-200/80 rounded-2xl p-5 flex flex-col justify-between border-l-4 border-purple-600 bg-gradient-to-br from-white to-purple-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Est. Profit Margin</span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {profit.profitMargin}% Margin
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-purple-700 tracking-tight">
              {formatCurrency(profit.totalProfit)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Revenue: {formatCurrency(profit.totalRevenue)} • Cost: {formatCurrency(profit.totalCost)}
            </p>
          </div>
        </div>

        {/* Card 4: Outstanding Receivables / Dues */}
        <div className="bg-white shadow-xs border border-gray-200/80 rounded-2xl p-5 flex flex-col justify-between border-l-4 border-amber-500 bg-gradient-to-br from-white to-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Outstanding Dues</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-rose-600 tracking-tight">
              {formatCurrency(metrics.totalDue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Sales: {formatCurrency(metrics.productDues)} • Tuition: {formatCurrency(metrics.batchDues)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Container with View Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 px-6 pt-4 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-6 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('OVERVIEW')}
              className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'OVERVIEW'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp size={17} />
              <span>Revenue & Trends</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PRODUCTS')}
              className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'PRODUCTS'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package size={17} />
              <span>Products Velocity ({topProducts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('BATCHES')}
              className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'BATCHES'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <GraduationCap size={17} />
              <span>Academy Batches ({batchPerformance.length})</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-xs font-semibold text-gray-400 pb-3.5">
            Active Filter: <strong className="text-gray-700">{DATE_RANGE_OPTIONS.find(o => o.value === dateRange)?.label}</strong>
          </span>
        </div>

        {/* Tab 1: Overview & Revenue Trends */}
        {activeTab === 'OVERVIEW' && (
          <div className="p-6 space-y-6">
            {/* Chart Area */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="text-indigo-600" size={18} />
                    <span>Revenue Velocity & Trend</span>
                  </h3>
                  <p className="text-xs text-gray-500">Daily financial trajectory across the selected period</p>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setChartView('REVENUE')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      chartView === 'REVENUE' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Revenue (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartView('ORDERS')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      chartView === 'ORDERS' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Order Volume
                  </button>
                </div>
              </div>

              {/* Chart Canvas or Demonstration State */}
              <div className="h-72 sm:h-80 md:h-96 w-full">
                {salesTrend.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50/50">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <Calendar size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">No Sales Data In Selected Range</h4>
                    <p className="text-xs text-gray-500 max-w-sm mt-1">
                      No sales transactions occurred within the "{DATE_RANGE_OPTIONS.find(o => o.value === dateRange)?.label}" window.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setDateRange('all')}
                        className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
                      >
                        View All-Time Data
                      </button>
                      <Link
                        to="/sales"
                        className="px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                      >
                        Record a Sale
                      </Link>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrend} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        tickLine={false} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickFormatter={(str) => {
                          const parts = str.split('-');
                          return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : str;
                        }}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(v) => chartView === 'REVENUE' ? (v >= 1000 ? `₹${v/1000}k` : `₹${v}`) : v}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey={chartView === 'REVENUE' ? 'revenue' : 'orders'} 
                        stroke={chartView === 'REVENUE' ? '#6366f1' : '#10b981'} 
                        strokeWidth={2.5} 
                        fill={chartView === 'REVENUE' ? 'url(#revGrad)' : 'url(#orderGrad)'} 
                        dot={{ r: 3, fill: chartView === 'REVENUE' ? '#6366f1' : '#10b981' }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Bottom Row: Category Breakdown & Revenue Stream Composition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Sales Distribution */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <PieIcon size={16} className="text-indigo-600" />
                    Category Revenue Distribution
                  </h3>
                  <span className="text-xs text-gray-400">{categoryBreakdown.length} Categories</span>
                </div>

                {categoryBreakdown.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    No categorical sales records found for this period.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categoryBreakdown.map((cat, idx) => {
                      const totalCatRev = categoryBreakdown.reduce((sum, c) => sum + c.revenue, 0);
                      const pct = totalCatRev > 0 ? Math.round((cat.revenue / totalCatRev) * 100) : 0;
                      const catColor = cat.color || CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];

                      return (
                        <div key={cat._id || idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-800 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColor }} />
                              {cat.name}
                            </span>
                            <span className="text-gray-900 font-bold">
                              {formatCurrency(cat.revenue)} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ width: `${pct}%`, backgroundColor: catColor }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Revenue Streams Split (Products vs Academy Batches) */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Layers size={16} className="text-emerald-600" />
                    Revenue Composition
                  </h3>
                  <span className="text-xs text-gray-400">Products vs Academy</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-gray-700">
                      <ShoppingBag size={14} className="text-emerald-600" /> Product Sales:
                    </span>
                    <span className="font-extrabold text-emerald-700">
                      {formatCurrency(metrics.productRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-gray-700">
                      <GraduationCap size={14} className="text-indigo-600" /> Academy Tuition:
                    </span>
                    <span className="font-extrabold text-indigo-700">
                      {formatCurrency(metrics.batchRevenue)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black text-gray-900">
                    <span>Combined Total:</span>
                    <span>{formatCurrency(metrics.combinedRevenue)}</span>
                  </div>
                </div>

                {/* Progress Comparison */}
                {metrics.combinedRevenue > 0 && (
                  <div className="space-y-1.5">
                    <div className="w-full bg-gray-100 rounded-full h-3 flex overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full" 
                        style={{ width: `${Math.round((metrics.productRevenue / metrics.combinedRevenue) * 100)}%` }} 
                        title={`Sales: ${Math.round((metrics.productRevenue / metrics.combinedRevenue) * 100)}%`}
                      />
                      <div 
                        className="bg-indigo-600 h-full" 
                        style={{ width: `${Math.round((metrics.batchRevenue / metrics.combinedRevenue) * 100)}%` }} 
                        title={`Batches: ${Math.round((metrics.batchRevenue / metrics.combinedRevenue) * 100)}%`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Products: {Math.round((metrics.productRevenue / metrics.combinedRevenue) * 100)}%</span>
                      <span>Academy: {Math.round((metrics.batchRevenue / metrics.combinedRevenue) * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Velocity */}
        {activeTab === 'PRODUCTS' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Top Performing Products</h3>
                <p className="text-xs text-gray-500">Ranked by gross sales volume and units sold</p>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
              >
                <span>View All Products</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Package className="mx-auto text-gray-300 mb-2" size={36} />
                <p className="text-sm font-semibold text-gray-700">No Product Sales Yet</p>
                <p className="text-xs text-gray-400 mt-0.5 max-w-sm mx-auto">
                  Start recording sales to see which products generate the most revenue.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topProducts.map((prod, idx) => {
                  const maxRev = topProducts[0]?.revenue || 1;
                  const pct = Math.round((prod.revenue / maxRev) * 100);

                  return (
                    <div key={prod._id || idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-indigo-50/20 transition-all space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{prod.name}</p>
                            <p className="text-xs text-gray-400">{prod.sku ? `SKU: ${prod.sku}` : 'Standard Product'}</p>
                          </div>
                        </div>

                        <span className="font-black text-emerald-700 text-base">
                          {formatCurrency(prod.revenue)}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                        <span className="font-semibold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                          {prod.quantitySold} {prod.unit} Sold
                        </span>
                        <span className={`text-[11px] font-bold ${prod.currentStock > 5 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          Stock: {prod.currentStock} {prod.unit} remaining
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Academy Batches */}
        {activeTab === 'BATCHES' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Training Batch Tuition Analytics</h3>
                <p className="text-xs text-gray-500">Gross revenue, collections, and student participation</p>
              </div>
              <Link
                to="/classes"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
              >
                <span>Manage Batches</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {batchPerformance.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <GraduationCap className="mx-auto text-gray-300 mb-2" size={36} />
                <p className="text-sm font-semibold text-gray-700">No Academy Batches Found</p>
                <p className="text-xs text-gray-400 mt-0.5 max-w-sm mx-auto">
                  Create class batches and enroll students to start collecting tuition analytics.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {batchPerformance.map((batch) => (
                  <div key={batch._id} className="p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                          {batch.batchNumber}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">{batch.topic}</h4>
                      </div>
                      <p className="text-xs text-gray-400">
                        Date: {formatDate(batch.date)} • {batch.studentCount} Students ({batch.attendedCount} Attended)
                      </p>
                    </div>

                    <div className="flex items-center gap-6 justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Collected</span>
                        <span className="text-base font-black text-emerald-700">
                          {formatCurrency(batch.collectedRevenue)}
                        </span>
                      </div>

                      {batch.dueRevenue > 0 && (
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block">Due</span>
                          <span className="text-sm font-bold text-rose-600">
                            {formatCurrency(batch.dueRevenue)}
                          </span>
                        </div>
                      )}

                      <div className="text-center w-24">
                        <span className="text-xs font-bold text-gray-700">{batch.collectionRate}%</span>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${batch.collectionRate === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${batch.collectionRate}%` }}
                          />
                        </div>
                      </div>

                      <Link
                        to={`/classes/${batch._id}`}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
