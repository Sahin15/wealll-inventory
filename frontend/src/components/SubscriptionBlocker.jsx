import React from 'react';
import { AlertTriangle, Phone, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionBlocker = ({ onUpgrade }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header Area */}
        <div className="bg-red-50 p-6 flex flex-col items-center border-b border-red-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Inactive</h2>
          <p className="text-sm text-gray-600 max-w-sm">
            Your free trial or active subscription has ended. You must upgrade your plan to continue using the inventory management features.
          </p>
        </div>

        {/* Action Area */}
        <div className="p-8 space-y-6 bg-white flex-1">
          
          <button
            onClick={onUpgrade}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            Upgrade Plan Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Need help?</span>
            </div>
          </div>

          <a
            href="tel:+9118001234567"
            className="w-full flex items-center justify-center py-3.5 px-4 border-2 border-gray-200 rounded-xl shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none transition-all"
          >
            <Phone className="mr-2 w-5 h-5 text-gray-400" />
            Call Help Center (+91 1800-123-4567)
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBlocker;
