import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const DialogContext = createContext();

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning', // 'warning', 'danger', 'info', 'success'
    isAlert: false, // If true, hides the cancel button
    resolvePromise: null,
  });

  const confirm = useCallback((options) => {
    // If passed as string, handle as simple message
    if (typeof options === 'string') {
      options = {
        title: 'Confirm Action',
        message: options,
      };
    }
    
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'warning',
        isAlert: false,
        resolvePromise: resolve,
      });
    });
  }, []);

  const alert = useCallback((options) => {
    if (typeof options === 'string') {
      options = {
        title: 'Information',
        message: options,
      };
    }
    
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title || 'Information',
        message: options.message || '',
        confirmText: options.confirmText || 'OK',
        cancelText: '',
        type: options.type || 'info',
        isAlert: true,
        resolvePromise: resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (dialogState.resolvePromise) dialogState.resolvePromise(true);
    closeDialog();
  };

  const handleCancel = () => {
    if (dialogState.resolvePromise) dialogState.resolvePromise(false);
    closeDialog();
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialogState.isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCancel}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
                <button onClick={handleCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    dialogState.type === 'danger' ? 'bg-red-100 text-red-600' :
                    dialogState.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    dialogState.type === 'success' ? 'bg-green-100 text-green-600' :
                    'bg-indigo-100 text-indigo-600'
                  }`}>
                    {dialogState.type === 'danger' && <AlertTriangle className="h-6 w-6" />}
                    {dialogState.type === 'warning' && <AlertTriangle className="h-6 w-6" />}
                    {dialogState.type === 'success' && <CheckCircle className="h-6 w-6" />}
                    {dialogState.type !== 'danger' && dialogState.type !== 'warning' && dialogState.type !== 'success' && <Info className="h-6 w-6" />}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {dialogState.title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 whitespace-pre-line">
                        {dialogState.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors ${
                    dialogState.type === 'danger' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                    dialogState.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' :
                    dialogState.type === 'success' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                    'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                  }`}
                  onClick={handleConfirm}
                >
                  {dialogState.confirmText}
                </button>
                {!dialogState.isAlert && (
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                    onClick={handleCancel}
                  >
                    {dialogState.cancelText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
