import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PwaUpdater = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white border border-gray-200 shadow-lg rounded-lg p-4 max-w-sm w-[calc(100%-2rem)] mx-4 sm:mx-0">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-800 font-medium">A new version of WeAlll Inventory is available.</p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
            onClick={() => setNeedRefresh(false)}
          >
            Later
          </button>
          <button
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            onClick={() => updateServiceWorker(true)}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaUpdater;
