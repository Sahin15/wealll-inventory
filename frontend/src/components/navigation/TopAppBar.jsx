import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Menu } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import wealllFullLogo from '../../assets/wealll-full-logo.png';

const TopAppBar = ({ onOpenDrawer }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Basic title mapping based on pathname
  const getPageTitle = (path) => {
    if (path === '/' || path === '/dashboard') return 'Dashboard';
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
  const canGoBack = location.pathname !== '/' && location.pathname !== '/dashboard';

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {canGoBack ? (
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <button 
            onClick={onOpenDrawer} 
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[200px]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-8 w-28 overflow-visible mr-1 flex items-center justify-end">
          <img src={wealllFullLogo} alt="WeAlll" className="h-full object-contain scale-[3.5] origin-right opacity-90" />
        </div>
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shadow-inner flex-shrink-0">
           <User className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default TopAppBar;
