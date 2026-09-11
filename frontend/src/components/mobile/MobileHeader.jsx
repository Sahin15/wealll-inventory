import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import wealllFullLogo from '../../assets/wealll-full-logo-cropped.png';

/**
 * MobileHeader:
 * 56px + pt-safe sticky mobile application bar.
 * Preserves tenant dual-branding line, dynamic title, back button, and profile trigger.
 */
const MobileHeader = ({ title, subtitle, action, showBack, onBack }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const getAutoTitle = (path) => {
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/categories')) return 'Categories';
    if (path.startsWith('/products')) return 'Products';
    if (path.startsWith('/stock')) return 'Stock';
    if (path.startsWith('/purchases')) return 'Purchases';
    if (path.startsWith('/sales')) return 'Sales';
    if (path.startsWith('/classes')) return 'Batches';
    if (path.startsWith('/team')) return 'Team';
    if (path.startsWith('/my-space')) return 'Settings';
    return user?.tenantId?.appName || 'WeAlll';
  };

  const displayTitle = title || getAutoTitle(location.pathname);
  const canGoBack =
    showBack !== undefined
      ? showBack
      : location.pathname !== '/' && location.pathname !== '/dashboard';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 pt-safe shadow-xs">
      {/* Dynamic Tenant Dual-Line Branding Strip */}
      <div
        className="h-1 w-full shrink-0"
        style={{ background: 'var(--brand-dual-line, #4f46e5)' }}
      />

      <div className="h-14 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Left: Back button or Tenant Brand Initial */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {canGoBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 active:bg-slate-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center tap-highlight-transparent"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0"
              style={{ background: 'var(--brand-dual-line, #4f46e5)' }}
            >
              {(user?.tenantId?.businessName || 'W').charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 truncate leading-tight">
              {displayTitle}
            </h1>
            {subtitle ? (
              <p className="text-[11px] text-slate-500 truncate leading-none mt-0.5">
                {subtitle}
              </p>
            ) : !canGoBack && user?.tenantId?.businessName ? (
              <p className="text-[11px] text-slate-500 truncate leading-none mt-0.5">
                {user.tenantId.businessName}
              </p>
            ) : null}
          </div>
        </div>

        {/* Right Action slot or Default Brand & Profile Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {action ? (
            action
          ) : (
            <>
              {user?.tenantId?.logoUrl ? (
                <div className="h-7 max-w-[80px] flex items-center justify-end">
                  <img
                    src={user.tenantId.logoUrl}
                    alt={user?.tenantId?.businessName || 'Logo'}
                    className="max-h-6 max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-7 flex items-center justify-end">
                  <img
                    src={wealllFullLogo}
                    alt="WeAlll Inventory"
                    className="h-5 w-auto object-contain"
                  />
                </div>
              )}

              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => navigate('/my-space')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center shadow-xs transition-transform active:scale-95 tap-highlight-transparent"
                  style={{
                    backgroundColor: 'var(--brand-secondary-tint, #f0fdf4)',
                    borderColor: 'var(--brand-secondary-border, #bbf7d0)',
                    color: 'var(--brand-secondary, #16a34a)',
                  }}
                  aria-label="Settings"
                >
                  <User className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
