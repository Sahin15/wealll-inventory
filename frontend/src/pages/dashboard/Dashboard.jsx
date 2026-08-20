import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Package, TrendingUp, IndianRupee, AlertTriangle } from 'lucide-react';

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
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Dashboard Overview
      </h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                <dd className="text-2xl font-semibold text-gray-900">{data.totalProducts}</dd>
              </dl>
            </div>
          </div>
        </div>
        
        {user?.role !== 'staff' && (
          <>
            {/* Stock Value */}
            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <IndianRupee className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Est. Stock Value</dt>
                    <dd className="text-2xl font-semibold text-gray-900">₹{data.totalStockValue?.toFixed(2) || '0.00'}</dd>
                  </dl>
                </div>
              </div>
            </div>
            {/* Today Sales */}
            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Today's Sales</dt>
                    <dd className="text-2xl font-semibold text-gray-900">₹{data.todaySales?.toFixed(2) || '0.00'}</dd>
                  </dl>
                </div>
              </div>
            </div>
            {/* Monthly Sales */}
            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Sales</dt>
                    <dd className="text-2xl font-semibold text-gray-900">₹{data.monthlySales?.toFixed(2) || '0.00'}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="card flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Low Stock Alerts
            </h3>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            {data.lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">All products are well stocked.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {data.lowStockProducts.map(product => (
                  <li key={product._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">{product.currentStock} {product.unit}</p>
                      <p className="text-xs text-gray-500">Min: {product.minimumStock}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Sales</h3>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            {data.recentSales.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent sales.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {data.recentSales.map(sale => (
                  <li key={sale._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">{new Date(sale.saleDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₹{sale.total.toFixed(2)}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {sale.paymentStatus}
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
