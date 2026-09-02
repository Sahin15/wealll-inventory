import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Analytics from './pages/analytics/Analytics';
import Categories from './pages/categories/Categories';
import Products from './pages/products/Products';
import Stock from './pages/stock/Stock';
import Purchases from './pages/purchases/Purchases';
import Sales from './pages/sales/Sales';
import ClassesList from './pages/classes/ClassesList';
import ClassDetails from './pages/classes/ClassDetails';
import Team from './pages/settings/Team';
import BusinessSettings from './pages/settings/BusinessSettings';
import TenantManager from './pages/superadmin/TenantManager';
import TenantDetails from './pages/superadmin/TenantDetails';
import ApplicationManager from './pages/superadmin/ApplicationManager';
import GlobalSettings from './pages/superadmin/GlobalSettings';
import PwaUpdater from './components/PwaUpdater';

import Landing from './pages/public/Landing';

function App() {
  return (
    <Router>
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
          <Route path="/settings" element={<BusinessSettings />} />
        </Route>

        <Route element={<SuperAdminLayout />}>
          <Route path="/wealll-admin" element={<TenantManager />} />
          <Route path="/wealll-admin/tenants/:id" element={<TenantDetails />} />
          <Route path="/wealll-admin/applications" element={<ApplicationManager />} />
          <Route path="/wealll-admin/settings" element={<GlobalSettings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PwaUpdater />
    </Router>
  );
}

export default App;
