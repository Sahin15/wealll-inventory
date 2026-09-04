import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, Receipt, ShoppingCart, Menu } from 'lucide-react';
import MobileDrawer from './MobileDrawer';

const BottomNav = ({ user, navigation, drawerOpen, onOpenDrawer, onCloseDrawer }) => {
  const location = useLocation();

  // Core routes for bottom nav (filtered by what the user has access to)
  const allCoreRoutes = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Stock', href: '/stock', icon: ArrowRightLeft },
    { name: 'Sales', href: '/sales', icon: Receipt },
    { name: 'Purchases', href: '/purchases', icon: ShoppingCart },
  ];

  // Filter based on allowed navigation items passed from DashboardLayout
  const allowedHrefs = navigation.map(nav => nav.href);
  const coreRoutes = allCoreRoutes.filter(route => allowedHrefs.includes(route.href));
  
  // Get overflow routes (routes that are in navigation but NOT in coreRoutes)
  const coreHrefs = coreRoutes.map(c => c.href);
  const overflowRoutes = navigation.filter(nav => !coreHrefs.includes(nav.href));

  return (
    <>
      <div className="md:hidden w-full bg-white border-t border-gray-200 pb-safe z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-shrink-0">
        <div className="flex justify-around items-center h-16">
          {coreRoutes.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] ${
                  isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                }`}
                style={isActive && user?.tenantId?.brandColor ? { color: user.tenantId.brandColor } : {}}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          <button
            onClick={onOpenDrawer}
            className="flex-1 flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] text-gray-500 hover:text-gray-900"
          >
            <Menu className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>
      
      <MobileDrawer 
        isOpen={drawerOpen} 
        onClose={onCloseDrawer} 
        user={user}
        overflowRoutes={overflowRoutes}
      />
    </>
  );
};

export default BottomNav;
