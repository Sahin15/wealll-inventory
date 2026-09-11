import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DialogProvider } from './context/DialogContext';
import { GlobalSettingsProvider } from './context/GlobalSettingsContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import PwaUpdater from './components/PwaUpdater';

// Route-Level Code Splitting for ultra-fast initial page loads
const Landing = lazy(() => import('./pages/public/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Workspace Routes (Loaded strictly on demand)
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Analytics = lazy(() => import('./pages/analytics/Analytics'));
const Categories = lazy(() => import('./pages/categories/Categories'));
const Products = lazy(() => import('./pages/products/Products'));
const Stock = lazy(() => import('./pages/stock/Stock'));
const Purchases = lazy(() => import('./pages/purchases/Purchases'));
const Sales = lazy(() => import('./pages/sales/Sales'));
const ClassesList = lazy(() => import('./pages/classes/ClassesList'));
const ClassDetails = lazy(() => import('./pages/classes/ClassDetails'));
const Team = lazy(() => import('./pages/settings/Team'));
const MySpace = lazy(() => import('./pages/settings/MySpace'));

// SuperAdmin Routes (Isolated from tenant bundle)
const TenantManager = lazy(() => import('./pages/superadmin/TenantManager'));
const TenantDetails = lazy(() => import('./pages/superadmin/TenantDetails'));
const ApplicationManager = lazy(() => import('./pages/superadmin/ApplicationManager'));
const GlobalSettings = lazy(() => import('./pages/superadmin/GlobalSettings'));
const PlanManager = lazy(() => import('./pages/superadmin/PlanManager'));

const RouteFallback = () => (
  <div className="w-full h-full min-h-[50vh] flex items-center justify-center p-8">
    <div className="w-7 h-7 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
  </div>
);

function App() {
  return (
    <GlobalSettingsProvider>
      <DialogProvider>
        <Router>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />

              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/products" element={<Products />} />
                <Route path="/stock" element={<Stock />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/classes" element={<ClassesList />} />
                <Route path="/classes/:id" element={<ClassDetails />} />
                <Route path="/team" element={<Team />} />
                <Route path="/my-space" element={<MySpace />} />
              </Route>

              <Route element={<SuperAdminLayout />}>
                <Route path="/wealll-admin" element={<TenantManager />} />
                <Route path="/wealll-admin/tenants/:id" element={<TenantDetails />} />
                <Route path="/wealll-admin/applications" element={<ApplicationManager />} />
                <Route path="/wealll-admin/settings" element={<GlobalSettings />} />
                <Route path="/wealll-admin/plans" element={<PlanManager />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <PwaUpdater />
        </Router>
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            }
          }} 
        />
      </DialogProvider>
    </GlobalSettingsProvider>
  );
}

export default App;
