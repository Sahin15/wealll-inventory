import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Package, TrendingUp, AlertTriangle, Users, BookOpen, PlusCircle, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Namaste');

  useEffect(() => {
    const greetingsList = ['Namaste', 'Namaskar', 'Vanakkam', 'Khurumjari', 'Aadaab', 'Welcome'];
    setGreeting(greetingsList[Math.floor(Math.random() * greetingsList.length)]);
  }, []);

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1 w-full">
          <h2 className="text-xl sm:text-2xl font-bold leading-7 text-gray-900 sm:truncate md:text-3xl sm:tracking-tight mt-1">
            <span key={greeting} className="inline-block animate-in fade-in duration-700">
              {greeting}
            </span>
            , {user?.name || user?.tenantId?.ownerName || 'Admin'}!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Here's what's happening at <span className="font-medium text-gray-700">{user?.tenantId?.businessName || user?.tenantId?.appName || 'your business'}</span> today.
          </p>
        </div>
        {/* Quick Actions */}
        {user?.role !== 'staff' && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto mt-2 lg:mt-0">
            <Link to="/sales" className="justify-center inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full sm:w-auto">
              <ShoppingCart className="w-4 h-4 mr-2" /> New Sale
            </Link>
            <Link to="/classes" className="justify-center inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors w-full sm:w-auto">
              <BookOpen className="w-4 h-4 mr-2" /> New Class
            </Link>
            <Link to="/purchases" className="justify-center inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto">
              <PlusCircle className="w-4 h-4 mr-2" /> Record Purchase
            </Link>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="bg-white overflow-hidden shadow-sm shadow-gray-200/50 rounded-xl border-t-2 border-blue-500 ring-1 ring-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 rounded-lg p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-2xl font-bold text-gray-900 mt-1">{data.totalProducts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {user?.role !== 'staff' && (
          <>
            {/* Total Customers */}
            <div className="bg-white overflow-hidden shadow-sm shadow-gray-200/50 rounded-xl border-t-2 border-indigo-500 ring-1 ring-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-50 rounded-lg p-3">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Unique Customers</dt>
                      <dd className="text-2xl font-bold text-gray-900 mt-1">{data.totalCustomers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            {/* Today Sales */}
            <div className="bg-white overflow-hidden shadow-sm shadow-gray-200/50 rounded-xl border-t-2 border-green-500 ring-1 ring-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-50 rounded-lg p-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Sales</dt>
                      <dd className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.todaySales)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            {/* Active Classes */}
            <div className="bg-white overflow-hidden shadow-sm shadow-gray-200/50 rounded-xl border-t-2 border-purple-500 ring-1 ring-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-50 rounded-lg p-3">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Batches</dt>
                      <dd className="text-2xl font-bold text-gray-900 mt-1">{data.totalClasses}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {user?.role !== 'staff' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Batches & Class Overview</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Total Enrolled Students</p>
                <p className="text-2xl font-bold text-indigo-600">{data.totalStudents || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Total Batch Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data.batchRevenue || 0)}</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Seat Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.upcomingBatches?.length > 0 ? (
                  data.upcomingBatches.map(batch => (
                    <tr key={batch._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{batch.batchNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.topic}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(batch.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {batch.students?.length || 0} Students
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">{formatCurrency(batch.seatPrice)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                      No upcoming batches scheduled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-right">
            <Link to="/classes" className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
              View all classes &rarr;
            </Link>
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
