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
    <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm relative">
      {/* Top Brand Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'var(--brand-gradient)' }} />

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
        <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[180px]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {user?.tenantId?.logoUrl ? (
          <div className="h-8 max-w-[100px] flex items-center justify-end">
            <img 
              src={user.tenantId.logoUrl} 
              alt={user?.tenantId?.businessName || "Logo"} 
              className="max-h-7 max-w-full object-contain"
              loading="eager"
              decoding="async"
            />
          </div>
        ) : (
          <div className="h-8 w-24 overflow-visible mr-1 flex items-center justify-end">
            <img src={wealllFullLogo} alt="WeAlll" className="h-full object-contain scale-[3.2] origin-right opacity-90" />
          </div>
        )}
        <button 
          onClick={() => navigate('/my-space')}
          className="h-8 w-8 rounded-full border flex items-center justify-center shadow-sm flex-shrink-0 transition-all"
          style={{ 
            backgroundColor: 'var(--brand-tint)', 
            borderColor: 'var(--brand-border)',
            color: 'var(--brand-primary)' 
          }}
          aria-label="My Profile"
        >
           <User className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TopAppBar;
