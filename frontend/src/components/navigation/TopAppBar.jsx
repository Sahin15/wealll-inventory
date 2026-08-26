import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const TopAppBar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Basic title mapping based on pathname
  const getPageTitle = (path) => {
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/categories')) return 'Categories';
    if (path.startsWith('/products')) return 'Products';
    if (path.startsWith('/stock')) return 'Stock';
    if (path.startsWith('/purchases')) return 'Purchases';
    if (path.startsWith('/sales')) return 'Sales';
    if (path.startsWith('/classes')) return 'Classes';
    if (path.startsWith('/team')) return 'Team';
    if (path.startsWith('/settings')) return 'Settings';
    return user?.tenantId?.appName || 'WeAlll Inventory';
  };

  const title = getPageTitle(location.pathname);
  const canGoBack = location.pathname !== '/';

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {canGoBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[200px]">
          {title}
        </h1>
      </div>
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shadow-inner">
           <User className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default TopAppBar;
