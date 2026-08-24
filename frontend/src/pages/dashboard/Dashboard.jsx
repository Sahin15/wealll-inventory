import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Package, TrendingUp, IndianRupee, AlertTriangle, Users, BookOpen, PlusCircle, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>Failed to load dashboard</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard Overview
        </h2>
        {/* Quick Actions */}
        {user?.role !== 'staff' && (
          <div className="flex flex-wrap gap-2">
            <Link to="/sales" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              <ShoppingCart className="w-4 h-4 mr-2" /> New Sale
            </Link>
            <Link to="/classes" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200">
              <BookOpen className="w-4 h-4 mr-2" /> New Class
            </Link>
            <Link to="/stock" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border-gray-300">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Stock
            </Link>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-indigo-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-2xl font-bold text-gray-900">{data.totalProducts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {user?.role !== 'staff' && (
          <>
            {/* Total Customers */}
            <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-blue-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Unique Customers</dt>
                      <dd className="text-2xl font-bold text-gray-900">{data.totalCustomers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            {/* Today Sales */}
            <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-emerald-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Sales</dt>
                      <dd className="text-2xl font-bold text-gray-900">{formatCurrency(data.todaySales)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            {/* Active Classes */}
            <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-purple-500">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Batches</dt>
                      <dd className="text-2xl font-bold text-gray-900">{data.totalClasses}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {user?.role !== 'staff' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#9ca3af" />
                <YAxis tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12}} stroke="#9ca3af" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white shadow rounded-lg flex flex-col border border-red-100">
          <div className="px-6 py-5 border-b border-red-100 bg-red-50 rounded-t-lg">
            <h3 className="text-lg leading-6 font-bold text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              Low Stock Alerts
            </h3>
          </div>
          <div className="flex-1 p-6 overflow-y-auto max-h-96">
            {data.lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">All products are well stocked.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {data.lowStockProducts.map(product => {
                  const percent = Math.min(100, Math.max(0, (product.currentStock / product.minimumStock) * 100)) || 0;
                  return (
                  <li key={product._id} className="py-4">
                    <div className="flex justify-between items-center mb-1">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{product.currentStock} {product.unit}</p>
                        <p className="text-xs text-gray-500">Min limit: {product.minimumStock}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </li>
                )})}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white shadow rounded-lg flex flex-col border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <h3 className="text-lg leading-6 font-bold text-gray-900">Recent Sales</h3>
          </div>
          <div className="flex-1 p-6 overflow-y-auto max-h-96">
            {data.recentSales.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent sales.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {data.recentSales.map(sale => (
                  <li key={sale._id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">{sale.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">{sale.customerName || 'Walk-in'} • {new Date(sale.saleDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-sm font-bold text-gray-900 mb-1">{formatCurrency(sale.total)}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sale.status === 'VOIDED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {sale.status || 'COMPLETED'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
