import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  Key, 
  Trash2, 
  Search, 
  X, 
  Mail, 
  User as UserIcon, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useDialog } from '../../context/DialogContext';
import { formatDate } from '../../utils/dateFormatter';
import AdaptiveSheet from '../../components/mobile/AdaptiveSheet';
import SegmentedTabs from '../../components/mobile/SegmentedTabs';

const Team = () => {
  const { user } = useAuth();
  const { confirm } = useDialog();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'admin' | 'manager' | 'staff'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load team members', err);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const managers = users.filter(u => u.role === 'manager').length;
    const staff = users.filter(u => u.role === 'staff').length;
    return { total, admins, managers, staff };
  }, [users]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (roleFilter !== 'ALL' && u.role !== roleFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter]);

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'staff'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Full Name is required');
    if (!formData.email.trim()) return toast.error('Email address is required');
    if (!formData.password) return toast.error('Password is required');
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role
    };

    try {
      await api.post('/users', payload);
      toast.success('Team member added successfully');
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add team member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u) => {
    const isConfirmed = await confirm({
      title: 'Remove Team Member',
      message: `Are you sure you want to remove ${u.name} (${u.email})? They will immediately lose access to the system.`,
      type: 'danger',
      confirmText: 'Yes, Remove Member'
    });
    if (!isConfirmed) return;

    try {
      await api.delete(`/users/${u._id}`);
      fetchUsers();
      toast.success('Team member removed successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove user');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck size={13} className="text-purple-600" />
            Admin
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Key size={13} className="text-blue-600" />
            Manager
          </span>
        );
      case 'staff':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserIcon size={13} className="text-emerald-600" />
            Staff
          </span>
        );
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin':
        return 'Full workspace access including billing, settings, and team management.';
      case 'manager':
        return 'Can manage products, inventory, purchases, and sales operations.';
      case 'staff':
      default:
        return 'Point-of-sale terminal access only to create and record sales.';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (user?.role === 'staff') {
    return (
      <div className="bg-white rounded-2xl border border-rose-100 p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Access Restricted</h3>
        <p className="text-sm text-gray-500 mt-1">
          You do not have permission to view or manage team members. Please contact your workspace administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* ========================================================================= */}
      {/* Page Header                                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
              <Users size={24} />
            </div>
            <span>Team & Access Control</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage user accounts, assign role permissions, and control team workspace access.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus size={16} />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* Role Overview KPI Cards                                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div 
          onClick={() => setRoleFilter('ALL')}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all shadow-sm hover:shadow-md ${
            roleFilter === 'ALL' ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Members</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{metrics.total}</span>
            <span className="text-xs text-gray-400 font-medium">active</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">Click to view all</p>
        </div>

        {/* Admins */}
        <div 
          onClick={() => setRoleFilter(roleFilter === 'admin' ? 'ALL' : 'admin')}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all shadow-sm hover:shadow-md ${
            roleFilter === 'admin' ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Admins</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700">{metrics.admins}</span>
            <span className="text-xs text-purple-600 font-medium">full access</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Full settings & billing</p>
        </div>

        {/* Managers */}
        <div 
          onClick={() => setRoleFilter(roleFilter === 'manager' ? 'ALL' : 'manager')}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all shadow-sm hover:shadow-md ${
            roleFilter === 'manager' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Managers</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Key size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">{metrics.managers}</span>
            <span className="text-xs text-blue-600 font-medium">operations</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Products & stock control</p>
        </div>

        {/* Staff */}
        <div 
          onClick={() => setRoleFilter(roleFilter === 'staff' ? 'ALL' : 'staff')}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all shadow-sm hover:shadow-md ${
            roleFilter === 'staff' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sales Staff</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UserIcon size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{metrics.staff}</span>
            <span className="text-xs text-emerald-600 font-medium">POS terminals</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Counter & billing only</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Search & Filter Bar                                                       */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            aria-label="Search team members by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role Filter Tabs */}
        <div className="w-full md:w-auto">
          <SegmentedTabs
            tabs={[
              { id: 'ALL', label: 'All Roles', count: metrics.total },
              { id: 'admin', label: 'Admins', count: metrics.admins },
              { id: 'manager', label: 'Managers', count: metrics.managers },
              { id: 'staff', label: 'Staff', count: metrics.staff }
            ]}
            activeTab={roleFilter}
            onChange={setRoleFilter}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Team Members List / Table                                                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500 font-medium">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 animate-spin mb-3">
              <Users size={20} />
            </div>
            <p className="text-sm">Loading team directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 mb-3 shadow-inner">
              <Users size={26} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No team members found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {searchQuery || roleFilter !== 'ALL'
                ? 'No team members match your filter criteria.'
                : 'Get started by inviting your first team member.'}
            </p>
            {(searchQuery || roleFilter !== 'ALL') ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('ALL');
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
              >
                Reset filters
              </button>
            ) : (
              <button
                onClick={openAddModal}
                className="mt-4 btn-primary inline-flex items-center gap-2 text-xs py-2 px-4"
              >
                <UserPlus size={14} />
                <span>Add Member</span>
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Team Member</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Access Scope</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Added Date</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredUsers.map((u) => {
                    const isCurrentUser = u._id === user?.id || u._id === user?._id;
                    return (
                      <tr key={u._id} className="hover:bg-indigo-50/20 transition-colors">
                        {/* Member Identity */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                              {getInitials(u.name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-sm">{u.name}</span>
                                {isCurrentUser && (
                                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Mail size={12} className="text-gray-400" />
                                <span>{u.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(u.role)}
                        </td>

                        {/* Scope */}
                        <td className="px-6 py-4">
                          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                            {getRoleDescription(u.role)}
                          </p>
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {u.createdAt ? formatDate(u.createdAt) : 'Initial Member'}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {!isCurrentUser ? (
                            <button
                              onClick={() => handleDelete(u)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                              title="Remove member access"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Current Session</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredUsers.map((u) => {
                const isCurrentUser = u._id === user?.id || u._id === user?._id;
                return (
                  <div key={u._id} className="p-4 space-y-3 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-sm flex-shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm truncate">{u.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-100">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                            <Mail size={11} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">{getRoleBadge(u.role)}</div>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs text-gray-600 leading-relaxed">
                      {getRoleDescription(u.role)}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
                      <span>Joined: {u.createdAt ? formatDate(u.createdAt) : 'Initial'}</span>
                      {!isCurrentUser && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 active:scale-95 transition"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Showing {filteredUsers.length} of {users.length} team members</span>
              <span className="text-indigo-600 font-bold">Encrypted RBAC Security Active</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD NEW MEMBER MODAL (AdaptiveSheet)                                      */}
      {/* ========================================================================= */}
      <AdaptiveSheet
        isOpen={showModal}
        onClose={closeModal}
        title="Add Team Member"
        description="Create a secure login account and grant system permissions"
        icon={UserPlus}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 min-h-[44px] text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-team-member-form"
              disabled={submitting}
              className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-semibold shadow-sm"
            >
              {submitting ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Save Member</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="add-team-member-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                aria-label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                aria-label="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Temporary Password *
              </label>
              <input
                type="password"
                required
                aria-label="Temporary Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                aria-label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Select System Role & Permissions *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Staff Card */}
              <div
                onClick={() => setFormData({ ...formData, role: 'staff' })}
                className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                  formData.role === 'staff'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-gray-900">Staff</span>
                  <UserIcon size={16} className="text-emerald-600" />
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  POS counter sales terminal only. No inventory modifications.
                </p>
              </div>

              {/* Manager Card */}
              <div
                onClick={() => setFormData({ ...formData, role: 'manager' })}
                className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                  formData.role === 'manager'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-gray-900">Manager</span>
                  <Key size={16} className="text-blue-600" />
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Products, stock, purchases, and sales operations access.
                </p>
              </div>

              {/* Admin Card */}
              <div
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                  formData.role === 'admin'
                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-gray-900">Admin</span>
                  <ShieldCheck size={16} className="text-purple-600" />
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Full workspace authority, billing, settings, and team access.
                </p>
              </div>
            </div>
          </div>
        </form>
      </AdaptiveSheet>
    </div>
  );
};

export default Team;
