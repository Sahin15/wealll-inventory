import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Receipt, 
  Package, 
  MoreHorizontal 
} from 'lucide-react';
import MobileDrawer from './MobileDrawer';

/**
 * 5-Slot Mobile Bottom Navigation Bar:
 * 1. Dashboard (/dashboard or /)
 * 2. Stock (/stock)
 * 3. Sales (/sales)
 * 4. Products (/products)
 * 5. More (Bottom Sheet Hub)
 */
const BottomNav = ({ user, navigation, drawerOpen, onOpenDrawer, onCloseDrawer }) => {
  const location = useLocation();

  const primaryTabs = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, aliases: ['/'] },
    { name: 'Stock', href: '/stock', icon: ArrowRightLeft },
    { name: 'Sales', href: '/sales', icon: Receipt },
    { name: 'Products', href: '/products', icon: Package },
  ];

  // Check which primary tabs this user's role allows
  const allowedHrefs = navigation.map((nav) => nav.href);
  const visiblePrimaryTabs = primaryTabs.filter(
    (tab) => allowedHrefs.includes(tab.href) || tab.aliases?.some((a) => allowedHrefs.includes(a))
  );

  // Remaining navigation items go into the "More" hub
  const primaryHrefs = primaryTabs.flatMap((t) => [t.href, ...(t.aliases || [])]);
  const overflowRoutes = navigation.filter((nav) => !primaryHrefs.includes(nav.href));

  return (
    <>
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
          {visiblePrimaryTabs.map((item) => {
            const isMatch =
              location.pathname === item.href ||
              (item.aliases && item.aliases.includes(location.pathname));

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all select-none tap-highlight-transparent ${
                  isMatch
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 active:scale-95'
                }`}
                style={isMatch && user?.tenantId?.brandColor ? { color: user.tenantId.brandColor } : {}}
              >
                <div className="relative">
                  <item.icon className={`h-5 w-5 transition-transform ${isMatch ? 'scale-110' : ''}`} />
                  {isMatch && (
                    <span 
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" 
                      style={{ backgroundColor: user?.tenantId?.brandColor || '#4f46e5' }}
                    />
                  )}
                </div>
                <span className={`text-[10px] mt-1 tracking-tight truncate ${isMatch ? 'font-bold' : 'font-medium'}`}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}

          {/* 5th Slot: More Hub */}
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-expanded={drawerOpen}
            aria-label="Open More options"
            className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all select-none tap-highlight-transparent ${
              drawerOpen
                ? 'text-indigo-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 active:scale-95'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className={`h-5 w-5 transition-transform ${drawerOpen ? 'scale-110' : ''}`} />
              {drawerOpen && (
                <span 
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" 
                  style={{ backgroundColor: user?.tenantId?.brandColor || '#4f46e5' }}
                />
              )}
            </div>
            <span className={`text-[10px] mt-1 tracking-tight truncate ${drawerOpen ? 'font-bold' : 'font-medium'}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Categorized More Hub (Bottom Sheet / Slide-over) */}
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
