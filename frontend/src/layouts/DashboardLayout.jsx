import React, { useContext } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, PieChart, 
  Package, 
  Tags, 
  ArrowRightLeft, 
  ShoppingCart, 
  Receipt,
  Users,
  LogOut
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'superadmin') {
    return <Navigate to="/wealll-admin" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'staff'] },
    { name: 'Analytics', href: '/analytics', icon: PieChart, roles: ['admin', 'manager'] },
    { name: 'Categories', href: '/categories', icon: Tags, roles: ['admin', 'manager', 'staff'] },
    { name: 'Products', href: '/products', icon: Package, roles: ['admin', 'manager', 'staff'] },
    { name: 'Stock', href: '/stock', icon: ArrowRightLeft, roles: ['admin', 'manager', 'staff'] },
    { name: 'Purchases', href: '/purchases', icon: ShoppingCart, roles: ['admin', 'manager'] },
    { name: 'Sales', href: '/sales', icon: Receipt, roles: ['admin', 'manager', 'staff'] },
    { name: 'Team', href: '/team', icon: Users, roles: ['admin', 'manager'] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200 shadow-sm">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-100">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">WeAlll Inventory</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 truncate">{user.email}</p>
              </div>
              <button onClick={logout} className="ml-auto flex-shrink-0 p-1 text-gray-400 hover:text-red-500 rounded-full">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

