import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LogOut, Download } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const MobileDrawer = ({ isOpen, onClose, user, overflowRoutes }) => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Close drawer on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-[100] md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onClose}
      />
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-[101] md:hidden flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">{user?.tenantId?.businessName || 'Menu'}</h2>
            <p className="text-xs text-gray-500">{user?.name}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 text-gray-500 hover:text-gray-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2">
          {overflowRoutes.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 min-h-[44px]"
            >
              <item.icon className="h-5 w-5 mr-3 text-gray-400" />
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="border-t border-gray-100 p-2 pb-safe">
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-md min-h-[44px]"
            >
              <Download className="h-5 w-5 mr-3" />
              Install App
            </button>
          )}
          <button 
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 rounded-md min-h-[44px]"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
