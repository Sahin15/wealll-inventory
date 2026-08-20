import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut } from 'lucide-react';

const SuperAdminLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gray-900 border-r border-gray-800">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-800">
            <h1 className="text-xl font-bold tracking-tight text-white">WeAlll Admin</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <div className="group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-gray-800 text-white">
                <Building2 className="mr-3 flex-shrink-0 h-5 w-5 text-gray-300" aria-hidden="true" />
                Tenants
              </div>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-800 p-4">
            <div className="flex items-center w-full">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs font-medium text-gray-400 truncate">{user.email}</p>
              </div>
              <button onClick={logout} className="ml-auto flex-shrink-0 p-1 text-gray-400 hover:text-white rounded-full">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1 bg-gray-100">
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
