import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useGlobalSettings } from '../context/GlobalSettingsContext';
import { 
  LayoutDashboard, PieChart, 
  Package, 
  Tags, 
  ArrowRightLeft, 
  ShoppingCart, 
  Receipt,
  Users,
  LogOut,
  UserCircle,
  BookOpen
} from 'lucide-react';
import { getContrastYIQ } from '../utils/colorUtils';
import TopAppBar from '../components/navigation/TopAppBar';
import BottomNav from '../components/navigation/BottomNav';
import SubscriptionBlocker from '../components/SubscriptionBlocker';

const DashboardLayout = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const { globalSettings, loadingSettings } = useGlobalSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const handleSubscriptionExpired = () => {
      // If we are already on the payments tab, don't show the blocker so they can upgrade
      if (location.pathname !== '/my-space') {
        setIsBlocked(true);
      }
    };
    
    window.addEventListener('subscription_expired', handleSubscriptionExpired);
    return () => window.removeEventListener('subscription_expired', handleSubscriptionExpired);
  }, [location.pathname]);

  React.useEffect(() => {
    if (user?.tenantId?.appName) {
      document.title = `${user.tenantId.appName} - Dashboard`;
    }
  }, [user]);

  if (loading || loadingSettings) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (globalSettings?.maintenanceMode && user.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 mb-2">System Under Maintenance</h2>
            <p className="text-gray-600 mb-6">
              WeAlll Inventory is currently undergoing scheduled maintenance to improve our services. Please check back later.
            </p>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'superadmin') {
    return <Navigate to="/wealll-admin" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'staff'] },
    { name: 'Analytics', href: '/analytics', icon: PieChart, roles: ['admin', 'manager'] },
    { name: 'Categories', href: '/categories', icon: Tags, roles: ['admin', 'manager', 'staff'] },
    { name: 'Products', href: '/products', icon: Package, roles: ['admin', 'manager', 'staff'] },
    { name: 'Stock', href: '/stock', icon: ArrowRightLeft, roles: ['admin', 'manager', 'staff'] },
    { name: 'Purchases', href: '/purchases', icon: ShoppingCart, roles: ['admin', 'manager'] },
    { name: 'Sales', href: '/sales', icon: Receipt, roles: ['admin', 'manager', 'staff'] },
    { name: 'Classes', href: '/classes', icon: BookOpen, roles: ['admin', 'manager', 'staff'] },
    { name: 'Team', href: '/team', icon: Users, roles: ['admin'] },
    { name: 'My Space', href: '/my-space', icon: UserCircle, roles: ['admin'] },
  ].filter(item => item.roles.includes(user.role));

  const brandStyle = user?.tenantId?.brandColor ? {
    '--brand-color': user.tenantId.brandColor,
    '--brand-text-color': getContrastYIQ(user.tenantId.brandColor)
  } : {};

  return (
    <div className="fixed inset-0 w-full bg-gray-50 flex overflow-hidden" style={brandStyle}>
      {isBlocked && (
        <SubscriptionBlocker 
          onUpgrade={() => {
            setIsBlocked(false);
            navigate('/my-space?tab=payments');
          }}
        />
      )}
      
      {globalSettings?.announcementText && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 px-4 py-3 text-white sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium">
            {globalSettings.announcementText}
          </p>
        </div>
      )}

      {/* Sidebar */}
      <div className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200 shadow-sm print:hidden ${globalSettings?.announcementText ? 'mt-12' : ''}`}>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-center h-20 w-full py-3 px-4 flex-shrink-0 border-b border-gray-100 bg-white">
            {user?.tenantId?.logoUrl ? (
              <img src={user.tenantId.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
            ) : (
              <h1 className="text-lg font-bold tracking-tight text-gray-900 truncate w-full text-center">
                {user?.tenantId?.appName || 'WeAlll Inventory'}
              </h1>
            )}
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
                      isActive ? '' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    style={isActive ? { backgroundColor: 'var(--brand-color)', color: 'var(--brand-text-color)' } : {}}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? '' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      style={isActive ? { color: 'var(--brand-text-color)' } : {}}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          {user.role === 'admin' && (
            <div className="px-4 pb-4 mt-auto">
              <Link 
                to="/my-space?tab=payments" 
                className="flex items-center justify-center w-full bg-indigo-50 border border-indigo-100 text-indigo-700 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-100 hover:shadow transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Upgrade Plan
              </Link>
            </div>
          )}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center w-full">
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate" title={user.tenantId?.businessName}>
                  {user.tenantId?.businessName || 'Business Profile'}
                </p>
                <p className="text-xs font-medium text-gray-500 truncate" title={user.name}>
                  {user.name} <span className="uppercase text-[10px] bg-gray-200 px-1 rounded">{user.role}</span>
                </p>
              </div>
              <button onClick={logout} className="ml-auto flex-shrink-0 p-1 text-gray-400 hover:text-red-500 rounded-full">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`md:pl-64 flex flex-col flex-1 print:pl-0 min-w-0 h-full ${globalSettings?.announcementText ? 'pt-12' : ''}`}>
        <TopAppBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="py-4 md:py-6 px-4 sm:px-6 md:px-8 pb-6 w-full max-w-full">
            <Outlet />
          </div>
        </main>
        <BottomNav user={user} navigation={navigation} />
      </div>
    </div>
  );
};

export default DashboardLayout;

