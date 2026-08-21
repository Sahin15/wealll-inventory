import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { IndianRupee, TrendingUp, Filter } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const end = new Date();
      let start = new Date();
      
      if (dateRange === '7days') {
        start.setDate(end.getDate() - 7);
      } else if (dateRange === '30days') {
        start.setDate(end.getDate() - 30);
      } else if (dateRange === 'year') {
        start.setFullYear(end.getFullYear() - 1);
      }
      
      const res = await api.get(/analytics?startDate=${start.toISOString()}&endDate=${end.toISOString()});
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) return <div className="flex justify-center p-8">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-red-500">Failed to load analytics data</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Analytics & Reporting
        </h2>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card p-6 border-l-4 border-indigo-500">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">,1{data.metrics.totalRevenue.toFixed(2)}</dd>
          </dl>
        </div>
        <div className="card p-6 border-l-4 border-green-500">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">Est. Profit Margin</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">,1{data.profit.totalProfit?.toFixed(2) || '0.00'}</dd>
          </dl>
        </div>
        <div className="card p-6 border-l-4 border-amber-500">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.metrics.totalSales}</dd>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="card p-6 h-96 flex flex-col">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip formatter={(value) => [,1$value, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="card p-6 h-96 flex flex-col">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top 5 Products (by Quantity)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 11}} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis yAxisId="left" tick={{fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="quantitySold" name="Qty Sold" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" name="Revenue (,1)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
