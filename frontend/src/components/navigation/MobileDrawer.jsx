import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LogOut, Download, Sparkles, ChevronRight, Shield } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useDialog } from '../../context/DialogContext';
import wealllFullLogo from '../../assets/wealll-full-logo-cropped.png';

const MobileDrawer = ({ isOpen, onClose, user, overflowRoutes = [] }) => {
  const { logout } = useContext(AuthContext);
  const { confirm } = useDialog();
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Close drawer on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Capture PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleSignOut = async () => {
    const isConfirmed = await confirm({
      title: 'Sign Out Confirmation',
      message: 'Are you sure you want to sign out of WeAlll Inventory?',
      confirmText: 'Yes, Sign Out',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (isConfirmed) {
      onClose();
      logout();
    }
  };

  if (!isOpen) return null;

  // Group overflow routes into categorized sections
  const operationalRoutes = overflowRoutes.filter((r) =>
    ['/purchases', '/categories', '/classes'].includes(r.href)
  );
  const businessRoutes = overflowRoutes.filter((r) =>
    ['/analytics'].includes(r.href)
  );
  const adminRoutes = overflowRoutes.filter((r) =>
    ['/team', '/my-space'].includes(r.href)
  );
  const otherRoutes = overflowRoutes.filter(
    (r) =>
      !operationalRoutes.includes(r) &&
      !businessRoutes.includes(r) &&
      !adminRoutes.includes(r)
  );

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Up Bottom Sheet Hub */}
      <div className="relative z-50 w-full bg-white rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden pb-safe animate-slide-up">
        {/* Drag pill */}
        <div className="flex items-center justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* WeAlll Platform Branding Header Bar */}
        <div className="px-5 pt-2 pb-2.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center">
            <img
              src={wealllFullLogo}
              alt="WeAlll Inventory Management System"
              className="h-6 w-auto object-contain"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 -mr-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full min-w-[36px] min-h-[36px] flex items-center justify-center tap-highlight-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header with User & Workspace Card */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
              style={{ background: 'var(--brand-dual-line, #4f46e5)' }}
            >
              {(user?.tenantId?.businessName || user?.name || 'W').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {user?.tenantId?.businessName || 'Your Workspace'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-500 truncate">{user?.name}</span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  <Shield className="w-2.5 h-2.5 text-indigo-500" />
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto momentum-scroll px-5 py-3 space-y-4">
          {/* Operational Module */}
          {operationalRoutes.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                Operations & Catalog
              </p>
              <div className="space-y-1">
                {operationalRoutes.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                        {item.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Business Intelligence */}
          {businessRoutes.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                Analytics & Reports
              </p>
              <div className="space-y-1">
                {businessRoutes.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                        {item.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Administration & Space */}
          {adminRoutes.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                Administration
              </p>
              <div className="space-y-1">
                {adminRoutes.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                        {item.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Any other routes */}
          {otherRoutes.length > 0 && (
            <div>
              <div className="space-y-1">
                {otherRoutes.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {item.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* PWA Install Banner */}
          {deferredPrompt && (
            <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Download className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-indigo-950 truncate">Install App</p>
                  <p className="text-[11px] text-indigo-700 truncate">Add to home screen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700 active:scale-95 transition-all shrink-0"
              >
                Install
              </button>
            </div>
          )}

          {/* Upgrade Plan link for admin */}
          {user?.role === 'admin' && (
            <Link
              to="/my-space?tab=payments"
              className="flex items-center justify-between p-3 rounded-2xl border transition-all"
              style={{
                backgroundColor: 'var(--brand-secondary-tint, #f0fdf4)',
                borderColor: 'var(--brand-secondary-border, #bbf7d0)',
                color: 'var(--brand-secondary, #16a34a)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold">Manage Subscription & Plans</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Footer with Sign Out and WeAlll Branding */}
        <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-rose-600 bg-rose-50/80 hover:bg-rose-100 active:bg-rose-200 border border-rose-200/70 rounded-xl transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <div className="flex flex-col items-center justify-center pt-2 pb-1 gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Powered by
            </span>
            <img
              src={wealllFullLogo}
              alt="WeAlll Inventory Management System"
              className="h-7 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
