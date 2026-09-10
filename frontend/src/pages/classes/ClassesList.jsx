import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Users, 
  Search, 
  X, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  ArrowRight,
  BookOpen,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Check,
  Clock,
  Phone,
  ExternalLink,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';

const ClassesList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Active Tab: 'BATCHES' | 'ANALYTICS' | 'STUDENTS'
  const [activeTab, setActiveTab] = useState('BATCHES');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDatePreset, setFilterDatePreset] = useState('ALL'); // 'ALL' | 'THIS_MONTH' | 'UPCOMING' | 'PAST'
  const [selectedBatchId, setSelectedBatchId] = useState('ALL');

  // Students Tab Specific Filters
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL'); // 'ALL' | 'PRESENT' | 'ABSENT' | 'PAID' | 'PARTIAL' | 'PENDING'

  // Create Batch Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    batchNumber: '',
    topic: '',
    date: new Date().toISOString().substring(0, 10),
    location: '',
    seatPrice: ''
  });

  // Collect Tuition Installment Modal State
  const [collectPaymentStudent, setCollectPaymentStudent] = useState(null);
  const [tuitionPaymentForm, setTuitionPaymentForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().substring(0, 10),
    notes: ''
  });
  const [submittingTuitionPayment, setSubmittingTuitionPayment] = useState(false);

  // Student Purchases Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSales, setStudentSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/classes');
      setBatches(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load class batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const openModal = () => {
    setFormData({
      batchNumber: '',
      topic: '',
      date: new Date().toISOString().substring(0, 10),
      location: '',
      seatPrice: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.batchNumber.trim()) return toast.error('Batch number is required');
    if (!formData.topic.trim()) return toast.error('Course topic is required');
    if (!formData.date) return toast.error('Date is required');

    setSubmitting(true);
    try {
      await api.post('/classes', {
        ...formData,
        seatPrice: Number(formData.seatPrice) || 0
      });
      closeModal();
      fetchBatches();
      toast.success('Class batch created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle attendance for a student across any batch
  const handleToggleAttendance = async (batchId, studentId, currentStatus) => {
    try {
      await api.put(`/classes/${batchId}/students/${studentId}`, { attended: !currentStatus });
      toast.success(!currentStatus ? 'Marked as Present' : 'Marked as Absent');
      fetchBatches();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update attendance');
    }
  };

  // Open Collect Tuition Payment Modal
  const openCollectPaymentModal = (student) => {
    const seatFee = student.seatPrice || 0;
    const currentPaid = typeof student.paidAmount === 'number' ? student.paidAmount : (student.paymentStatus === 'Paid' ? seatFee : 0);
    const currentDue = typeof student.dueAmount === 'number' ? student.dueAmount : Math.max(0, seatFee - currentPaid);

    setCollectPaymentStudent(student);
    setTuitionPaymentForm({
      amount: currentDue > 0 ? String(currentDue) : '',
      paymentMethod: 'CASH',
      paymentDate: new Date().toISOString().substring(0, 10),
      notes: ''
    });
  };

  // Submit Tuition Installment Payment
  const handleRecordTuitionPayment = async (e) => {
    e.preventDefault();
    const payAmt = Number(tuitionPaymentForm.amount);
    if (!payAmt || payAmt <= 0) {
      return toast.error('Payment amount must be greater than 0');
    }

    const seatFee = collectPaymentStudent.seatPrice || 0;
    const currentPaid = typeof collectPaymentStudent.paidAmount === 'number' ? collectPaymentStudent.paidAmount : (collectPaymentStudent.paymentStatus === 'Paid' ? seatFee : 0);
    const currentDue = typeof collectPaymentStudent.dueAmount === 'number' ? collectPaymentStudent.dueAmount : Math.max(0, seatFee - currentPaid);

    if (payAmt > currentDue) {
      return toast.error(`Payment amount cannot exceed remaining balance due of ${formatCurrency(currentDue)}`);
    }

    setSubmittingTuitionPayment(true);
    try {
      await api.post(`/classes/${collectPaymentStudent.batchId}/students/${collectPaymentStudent._id}/payments`, tuitionPaymentForm);
      toast.success('Tuition installment recorded successfully!');
      setCollectPaymentStudent(null);
      fetchBatches();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record tuition payment');
    } finally {
      setSubmittingTuitionPayment(false);
    }
  };

  // Open Student Purchases modal
  const openStudentPurchases = async (student) => {
    setSelectedStudent(student);
    setLoadingSales(true);
    try {
      const res = await api.get(`/sales?studentId=${student._id}`);
      setStudentSales(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student purchase history');
    } finally {
      setLoadingSales(false);
    }
  };

  // Helper function to calculate full financial metrics for a single batch
  const getBatchFinancials = (b) => {
    const seatFee = b.seatPrice || 0;
    const studentCount = b.students?.length || 0;
    const expectedRevenue = studentCount * seatFee;

    let collectedRevenue = 0;
    let attendedCount = 0;
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;

    (b.students || []).forEach(s => {
      if (s.attended) attendedCount++;
      const sPaid = typeof s.paidAmount === 'number' ? s.paidAmount : (s.paymentStatus === 'Paid' ? seatFee : 0);
      collectedRevenue += sPaid;

      if (s.paymentStatus === 'Paid' || (sPaid >= seatFee && seatFee > 0)) {
        paidCount++;
      } else if (s.paymentStatus === 'Partial' || (sPaid > 0 && sPaid < seatFee)) {
        partialCount++;
      } else {
        pendingCount++;
      }
    });

    const dueRevenue = Math.max(0, expectedRevenue - collectedRevenue);
    const collectionRate = expectedRevenue > 0 ? Math.round((collectedRevenue / expectedRevenue) * 100) : 0;

    return {
      seatFee,
      studentCount,
      attendedCount,
      paidCount,
      partialCount,
      pendingCount,
      expectedRevenue,
      collectedRevenue,
      dueRevenue,
      collectionRate
    };
  };

  // Filtered Batches based on Date and Search Criteria
  const filteredBatches = useMemo(() => {
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const todayTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    return batches.filter(b => {
      // Specific Batch filter
      if (selectedBatchId !== 'ALL' && b._id !== selectedBatchId) {
        return false;
      }

      // Date Filters
      const bDate = new Date(b.date);
      const bMonthStr = bDate.toISOString().substring(0, 7);
      const bTimestamp = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate()).getTime();

      // Filter by Month picker if set
      if (filterMonth && bMonthStr !== filterMonth) {
        return false;
      }

      // Quick Date Preset
      if (filterDatePreset === 'THIS_MONTH' && bMonthStr !== currentMonthStr) {
        return false;
      }
      if (filterDatePreset === 'UPCOMING' && bTimestamp < todayTimestamp) {
        return false;
      }
      if (filterDatePreset === 'PAST' && bTimestamp >= todayTimestamp) {
        return false;
      }

      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesCode = b.batchNumber?.toLowerCase().includes(q);
        const matchesTopic = b.topic?.toLowerCase().includes(q);
        const matchesLocation = b.location?.toLowerCase().includes(q);
        if (!matchesCode && !matchesTopic && !matchesLocation) return false;
      }

      return true;
    });
  }, [batches, selectedBatchId, filterMonth, filterDatePreset, searchTerm]);

  // Global Analytics / KPI computed from currently filtered batches
  const analytics = useMemo(() => {
    let totalBatches = filteredBatches.length;
    let totalStudents = 0;
    let totalExpectedRevenue = 0;
    let totalCollectedRevenue = 0;
    let totalDueRevenue = 0;
    let totalAttended = 0;
    let totalPaidStudents = 0;
    let totalPartialStudents = 0;
    let totalPendingStudents = 0;

    let topBatch = null;
    let highestDueBatch = null;

    filteredBatches.forEach(b => {
      const fin = getBatchFinancials(b);
      totalStudents += fin.studentCount;
      totalExpectedRevenue += fin.expectedRevenue;
      totalCollectedRevenue += fin.collectedRevenue;
      totalDueRevenue += fin.dueRevenue;
      totalAttended += fin.attendedCount;
      totalPaidStudents += fin.paidCount;
      totalPartialStudents += fin.partialCount;
      totalPendingStudents += fin.pendingCount;

      if (!topBatch || fin.collectedRevenue > topBatch.collectedRevenue) {
        topBatch = { ...b, ...fin };
      }
      if (!highestDueBatch || fin.dueRevenue > highestDueBatch.dueRevenue) {
        highestDueBatch = { ...b, ...fin };
      }
    });

    const overallCollectionRate = totalExpectedRevenue > 0 
      ? Math.round((totalCollectedRevenue / totalExpectedRevenue) * 100) 
      : 0;

    const avgRevenuePerBatch = totalBatches > 0 
      ? Math.round(totalCollectedRevenue / totalBatches) 
      : 0;

    return {
      totalBatches,
      totalStudents,
      totalExpectedRevenue,
      totalCollectedRevenue,
      totalDueRevenue,
      totalAttended,
      totalPaidStudents,
      totalPartialStudents,
      totalPendingStudents,
      overallCollectionRate,
      avgRevenuePerBatch,
      topBatch,
      highestDueBatch
    };
  }, [filteredBatches]);

  // Aggregate All Students list across batches
  const allStudents = useMemo(() => {
    const list = [];
    batches.forEach(b => {
      (b.students || []).forEach(s => {
        list.push({
          ...s,
          batchId: b._id,
          batchNumber: b.batchNumber,
          batchTopic: b.topic,
          seatPrice: b.seatPrice,
          batchDate: b.date,
          batchLocation: b.location
        });
      });
    });
    list.sort((a, b) => new Date(b.enrolledAt || 0) - new Date(a.enrolledAt || 0));
    return list;
  }, [batches]);

  // Filtered Students for All Students Tab
  const filteredStudents = useMemo(() => {
    return allStudents.filter(s => {
      // Batch filter
      if (selectedBatchId !== 'ALL' && s.batchId !== selectedBatchId) {
        return false;
      }

      const seatFee = s.seatPrice || 0;
      const sPaid = typeof s.paidAmount === 'number' ? s.paidAmount : (s.paymentStatus === 'Paid' ? seatFee : 0);
      const isPaid = s.paymentStatus === 'Paid' || (sPaid >= seatFee && seatFee > 0);
      const isPartial = s.paymentStatus === 'Partial' || (sPaid > 0 && sPaid < seatFee);
      const isPending = !isPaid && !isPartial;

      // Status filter
      if (studentStatusFilter === 'PRESENT' && !s.attended) return false;
      if (studentStatusFilter === 'ABSENT' && s.attended) return false;
      if (studentStatusFilter === 'PAID' && !isPaid) return false;
      if (studentStatusFilter === 'PARTIAL' && !isPartial) return false;
      if (studentStatusFilter === 'PENDING' && !isPending) return false;

      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = s.name?.toLowerCase().includes(q);
        const matchesPhone = s.phone?.toLowerCase().includes(q);
        const matchesLocation = s.location?.toLowerCase().includes(q);
        const matchesAddress = s.address?.toLowerCase().includes(q);
        const matchesBatch = s.batchNumber?.toLowerCase().includes(q) || s.batchTopic?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesLocation && !matchesAddress && !matchesBatch) {
          return false;
        }
      }

      return true;
    });
  }, [allStudents, selectedBatchId, studentStatusFilter, searchTerm]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 flex items-center gap-2">
            <GraduationCap className="text-indigo-600" size={28} />
            Classes & Batch Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor training revenue by batch, track tuition fee collections, dues, and enrolled students.
          </p>
        </div>

        <button 
          onClick={openModal}
          className="btn-primary inline-flex items-center justify-center gap-2 shadow-sm py-2.5 px-4 font-semibold text-sm cursor-pointer"
        >
          <Plus size={18} />
          <span>New Batch</span>
        </button>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={openModal}
        className="sm:hidden fixed bottom-20 right-4 z-40 bg-indigo-600 text-white rounded-full p-4 shadow-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[56px] min-w-[56px] flex items-center justify-center"
        title="Create New Batch"
      >
        <Plus size={24} />
      </button>

      {/* Comprehensive KPI Analytics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Batches & Attendance */}
        <div className="bg-white shadow-xs border border-gray-200/80 rounded-2xl p-5 flex items-center border-l-4 border-indigo-600">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 mr-4 shrink-0">
            <BookOpen size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Batches & Attendance</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{analytics.totalBatches} <span className="text-xs font-normal text-gray-400">Batches</span></p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              <span className="font-semibold text-indigo-600">{analytics.totalStudents} Enrolled</span> • {analytics.totalAttended} Present
            </p>
          </div>
        </div>

        {/* Card 2: Gross Potential Revenue */}
        <div className="bg-white shadow-xs border border-gray-200/80 rounded-2xl p-5 flex items-center border-l-4 border-blue-600">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 mr-4 shrink-0">
            <TrendingUp size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Expected</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{formatCurrency(analytics.totalExpectedRevenue)}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Avg: <span className="font-semibold text-gray-700">{formatCurrency(analytics.avgRevenuePerBatch)}</span> / batch
            </p>
          </div>
        </div>

        {/* Card 3: Tuition Revenue Collected */}
        <div className="bg-white shadow-xs border border-emerald-200/80 rounded-2xl p-5 flex items-center border-l-4 border-emerald-600 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 mr-4 shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Tuition Collected</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{formatCurrency(analytics.totalCollectedRevenue)}</p>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              <span className="font-bold">{analytics.overallCollectionRate}%</span> collected ({analytics.totalPaidStudents} Paid)
            </p>
          </div>
        </div>

        {/* Card 4: Outstanding Tuition Dues */}
        <div className="bg-white shadow-xs border border-rose-200/80 rounded-2xl p-5 flex items-center border-l-4 border-rose-500 bg-gradient-to-br from-white to-rose-50/20">
          <div className="p-3 rounded-xl bg-rose-100 text-rose-700 mr-4 shrink-0">
            <IndianRupee size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Outstanding Dues</p>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{formatCurrency(analytics.totalDueRevenue)}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {analytics.totalPartialStudents} Partial • {analytics.totalPendingStudents} Unpaid
            </p>
          </div>
        </div>
      </div>

      {/* Main Container with Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 px-6 pt-4 flex items-center gap-6 bg-gray-50/50 overflow-x-auto">
          {/* Tab 1: Batches */}
          <button
            type="button"
            onClick={() => setActiveTab('BATCHES')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'BATCHES'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen size={17} />
            <span>Training Batches ({filteredBatches.length})</span>
          </button>

          {/* Tab 2: Revenue Analytics by Batches */}
          <button
            type="button"
            onClick={() => setActiveTab('ANALYTICS')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'ANALYTICS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 size={17} />
            <span>Revenue by Batches</span>
          </button>

          {/* Tab 3: All Students List */}
          <button
            type="button"
            onClick={() => setActiveTab('STUDENTS')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'STUDENTS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={17} />
            <span>All Students List ({allStudents.length})</span>
          </button>
        </div>

        {/* Global Filter Toolbar (Date, Batch & Search) */}
        <div className="p-5 border-b border-gray-100 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Search size={13} className="text-gray-400" /> Search
              </label>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter by Specific Batch */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <GraduationCap size={13} className="text-gray-400" /> Filter by Batch
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none transition font-medium text-gray-800"
              >
                <option value="ALL">All Batches ({batches.length})</option>
                {batches.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.batchNumber}: {b.topic}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Month */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" /> Filter by Month
              </label>
              <div className="relative">
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    setFilterDatePreset('ALL');
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none transition"
                />
                {filterMonth && (
                  <button
                    type="button"
                    onClick={() => setFilterMonth('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Date Presets */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Clock size={13} className="text-gray-400" /> Date Schedule
              </label>
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => { setFilterDatePreset('ALL'); setFilterMonth(''); }}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    filterDatePreset === 'ALL' && !filterMonth ? 'bg-white shadow-2xs text-indigo-700' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterDatePreset('THIS_MONTH'); setFilterMonth(''); }}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    filterDatePreset === 'THIS_MONTH' ? 'bg-white shadow-2xs text-indigo-700' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterDatePreset('UPCOMING'); setFilterMonth(''); }}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    filterDatePreset === 'UPCOMING' ? 'bg-white shadow-2xs text-indigo-700' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterDatePreset('PAST'); setFilterMonth(''); }}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    filterDatePreset === 'PAST' ? 'bg-white shadow-2xs text-indigo-700' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Past
                </button>
              </div>
            </div>
          </div>

          {/* Student Status Filter Chips (only active on Students tab) */}
          {activeTab === 'STUDENTS' && (
            <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStudentStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  studentStatusFilter === 'ALL'
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Students ({allStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setStudentStatusFilter('PRESENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  studentStatusFilter === 'PRESENT'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                }`}
              >
                Present ({analytics.totalAttended})
              </button>
              <button
                type="button"
                onClick={() => setStudentStatusFilter('ABSENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  studentStatusFilter === 'ABSENT'
                    ? 'bg-gray-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Absent ({analytics.totalStudents - analytics.totalAttended})
              </button>
              <button
                type="button"
                onClick={() => setStudentStatusFilter('PAID')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  studentStatusFilter === 'PAID'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100'
                }`}
              >
                Fully Paid ({analytics.totalPaidStudents})
              </button>
              <button
                type="button"
                onClick={() => setStudentStatusFilter('PARTIAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  studentStatusFilter === 'PARTIAL'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100'
                }`}
              >
                Partial Advance ({analytics.totalPartialStudents})
              </button>
              <button
                type="button"
                onClick={() => setStudentStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  studentStatusFilter === 'PENDING'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100'
                }`}
              >
                Unpaid / Due ({analytics.totalPendingStudents})
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: TRAINING BATCHES (WITH REVENUE STATS PER BATCH)                     */}
        {/* ========================================================================= */}
        {activeTab === 'BATCHES' && (
          <div>
            {loading ? (
              <div className="p-12 text-center text-gray-500 font-medium">Loading classes...</div>
            ) : filteredBatches.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                  <GraduationCap className="text-gray-400" size={24} />
                </div>
                <h3 className="text-base font-semibold text-gray-900">No classes found</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                  {searchTerm || filterMonth || filterDatePreset !== 'ALL'
                    ? 'No batches match your active search and date filters.' 
                    : 'Get started by creating your first academy training batch.'}
                </p>
                <button 
                  onClick={openModal} 
                  className="mt-4 btn-primary inline-flex items-center gap-2 text-xs py-2 px-3.5 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Create New Batch</span>
                </button>
              </div>
            ) : (
              <div>
                {/* Desktop Batches Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3.5 text-left">Batch Code & Course</th>
                        <th className="px-6 py-3.5 text-left">Schedule & Location</th>
                        <th className="px-6 py-3.5 text-right">Seat Price</th>
                        <th className="px-6 py-3.5 text-center">Enrollment & Attendance</th>
                        <th className="px-6 py-3.5 text-right">Revenue by Batch</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white text-sm">
                      {filteredBatches.map((batch) => {
                        const fin = getBatchFinancials(batch);
                        return (
                          <tr key={batch._id} className="hover:bg-indigo-50/25 transition-colors">
                            {/* Batch Code & Topic */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                                  {batch.batchNumber}
                                </span>
                                <div>
                                  <span className="font-bold text-gray-900 text-sm block">{batch.topic}</span>
                                </div>
                              </div>
                            </td>

                            {/* Schedule & Location */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                <Calendar size={13} className="text-gray-400" />
                                <span>{formatDate(batch.date)}</span>
                              </div>
                              {batch.location && (
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                                  <MapPin size={11} />
                                  <span>{batch.location}</span>
                                </div>
                              )}
                            </td>

                            {/* Seat Price */}
                            <td className="px-6 py-4 whitespace-nowrap text-right font-extrabold text-sm text-gray-900">
                              {formatCurrency(batch.seatPrice)}
                            </td>

                            {/* Enrollment & Attendance */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                  <Users size={12} />
                                  <span>{fin.studentCount} Enrolled</span>
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {fin.attendedCount} Attended
                                </span>
                              </div>
                            </td>

                            {/* Revenue by Batch Analytics */}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-black text-emerald-700">
                                  {formatCurrency(fin.collectedRevenue)}
                                </span>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                                  <span>Gross: {formatCurrency(fin.expectedRevenue)}</span>
                                  {fin.dueRevenue > 0 && (
                                    <span className="font-bold text-rose-600">• Due: {formatCurrency(fin.dueRevenue)}</span>
                                  )}
                                </div>
                                {/* Mini Progress Bar */}
                                {fin.expectedRevenue > 0 && (
                                  <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${
                                        fin.collectionRate === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${fin.collectionRate}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link 
                                to={`/classes/${batch._id}`} 
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                <span>Manage</span>
                                <ArrowRight size={13} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Batches Card View */}
                <div className="lg:hidden divide-y divide-gray-100">
                  {filteredBatches.map((batch) => {
                    const fin = getBatchFinancials(batch);
                    return (
                      <div key={batch._id} className="p-4 flex flex-col gap-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                              {batch.batchNumber}
                            </span>
                            <h4 className="font-bold text-gray-900 text-sm mt-1">{batch.topic}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-700 block">
                              {formatCurrency(fin.collectedRevenue)}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Seat: {formatCurrency(batch.seatPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Batch Revenue Stats Bar */}
                        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Gross Expected:</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(fin.expectedRevenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Collected Tuition:</span>
                            <span className="font-bold text-emerald-700">{formatCurrency(fin.collectedRevenue)} ({fin.collectionRate}%)</span>
                          </div>
                          {fin.dueRevenue > 0 && (
                            <div className="flex justify-between text-rose-600 font-bold">
                              <span>Pending Dues:</span>
                              <span>{formatCurrency(fin.dueRevenue)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                          <div className="flex items-center gap-1">
                            <Calendar size={13} />
                            <span>{formatDate(batch.date)}</span>
                          </div>
                          <div className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {fin.studentCount} enrolled ({fin.attendedCount} present)
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end border-t border-gray-50">
                          <Link
                            to={`/classes/${batch._id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
                          >
                            <span>Manage Batch & Collect</span>
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Table Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Showing {filteredBatches.length} of {batches.length} batches</span>
                  <span>Total Batch Revenue: <strong className="text-emerald-700">{formatCurrency(analytics.totalCollectedRevenue)}</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REVENUE ANALYTICS BY BATCHES                                       */}
        {/* ========================================================================= */}
        {activeTab === 'ANALYTICS' && (
          <div className="p-6 space-y-6">
            {/* Highlights Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Top Earning Batch */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 p-4 rounded-2xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Top Revenue Batch</p>
                {analytics.topBatch ? (
                  <div className="mt-2">
                    <p className="text-base font-extrabold text-gray-900 truncate">{analytics.topBatch.topic}</p>
                    <p className="text-xs text-gray-500">Batch {analytics.topBatch.batchNumber} • {formatDate(analytics.topBatch.date)}</p>
                    <p className="text-xl font-black text-indigo-700 mt-1">
                      {formatCurrency(analytics.topBatch.collectedRevenue)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">No batch data available</p>
                )}
              </div>

              {/* Highest Pending Due Batch */}
              <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 p-4 rounded-2xl border border-rose-100">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Highest Pending Dues</p>
                {analytics.highestDueBatch && analytics.highestDueBatch.dueRevenue > 0 ? (
                  <div className="mt-2">
                    <p className="text-base font-extrabold text-gray-900 truncate">{analytics.highestDueBatch.topic}</p>
                    <p className="text-xs text-gray-500">Batch {analytics.highestDueBatch.batchNumber} • {formatDate(analytics.highestDueBatch.date)}</p>
                    <p className="text-xl font-black text-rose-600 mt-1">
                      {formatCurrency(analytics.highestDueBatch.dueRevenue)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-emerald-600 font-bold mt-2">All filtered batches fully settled!</p>
                )}
              </div>

              {/* Overall Collection Efficiency */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Collection Efficiency</p>
                <div className="mt-2">
                  <p className="text-2xl font-black text-emerald-700">{analytics.overallCollectionRate}%</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatCurrency(analytics.totalCollectedRevenue)} of {formatCurrency(analytics.totalExpectedRevenue)} expected
                  </p>
                  <div className="w-full bg-emerald-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full" 
                      style={{ width: `${analytics.overallCollectionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Performance Breakdown Table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 size={17} className="text-indigo-600" />
                  Financial Performance by Batch
                </h3>
                <span className="text-xs text-gray-500">{filteredBatches.length} batches evaluated</span>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/60 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                      <th className="py-3 px-4">Batch</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-center">Enrolled</th>
                      <th className="py-3 px-4 text-right">Seat Fee</th>
                      <th className="py-3 px-4 text-right">Gross Expected</th>
                      <th className="py-3 px-4 text-right">Tuition Collected</th>
                      <th className="py-3 px-4 text-right">Balance Due</th>
                      <th className="py-3 px-4 text-center w-28">Collection Rate</th>
                      <th className="py-3 px-4 text-right">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredBatches.map(b => {
                      const fin = getBatchFinancials(b);
                      return (
                        <tr key={b._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900">
                            <span className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded mr-1.5 border border-indigo-100">
                              {b.batchNumber}
                            </span>
                            {b.topic}
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                            {formatDate(b.date)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                            {fin.studentCount}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-gray-600">
                            {formatCurrency(b.seatPrice)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-gray-900">
                            {formatCurrency(fin.expectedRevenue)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                            {formatCurrency(fin.collectedRevenue)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold">
                            {fin.dueRevenue > 0 ? (
                              <span className="text-rose-600">{formatCurrency(fin.dueRevenue)}</span>
                            ) : (
                              <span className="text-gray-400 font-normal">₹0</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center gap-1.5 justify-center">
                              <span className="font-bold text-gray-700">{fin.collectionRate}%</span>
                              <div className="w-12 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${fin.collectionRate === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                  style={{ width: `${fin.collectionRate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link 
                              to={`/classes/${b._id}`}
                              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Table Totals Row */}
                  <tfoot className="bg-gray-50/80 border-t-2 border-gray-200 font-bold text-gray-900">
                    <tr>
                      <td colSpan={2} className="py-3 px-4 uppercase tracking-wider text-[10px]">
                        Total Summary ({filteredBatches.length} Batches)
                      </td>
                      <td className="py-3 px-4 text-center">{analytics.totalStudents}</td>
                      <td className="py-3 px-4 text-right">—</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(analytics.totalExpectedRevenue)}</td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-black">{formatCurrency(analytics.totalCollectedRevenue)}</td>
                      <td className="py-3 px-4 text-right text-rose-600 font-black">{formatCurrency(analytics.totalDueRevenue)}</td>
                      <td className="py-3 px-4 text-center font-black">{analytics.overallCollectionRate}%</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Financial Breakdown Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredBatches.map((b) => {
                  const fin = getBatchFinancials(b);
                  return (
                    <div key={b._id} className="p-4 space-y-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {b.batchNumber}
                          </span>
                          <p className="font-bold text-gray-900 text-sm mt-1">{b.topic}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(b.date)}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            {fin.collectionRate}% collected
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {fin.studentCount} students
                          </span>
                        </div>
                      </div>

                      {/* Revenue Grid */}
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5 text-xs">
                        <div className="flex justify-between text-gray-600">
                          <span>Gross Potential:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(fin.expectedRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Collected Revenue:</span>
                          <span className="font-bold text-emerald-700">{formatCurrency(fin.collectedRevenue)}</span>
                        </div>
                        {fin.dueRevenue > 0 ? (
                          <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-gray-200/60">
                            <span>Balance Due:</span>
                            <span>{formatCurrency(fin.dueRevenue)}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between text-emerald-600 font-medium pt-1 border-t border-gray-200/60">
                            <span>Status:</span>
                            <span>Fully Settled</span>
                          </div>
                        )}
                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${fin.collectionRate === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${fin.collectionRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Link 
                          to={`/classes/${b._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
                        >
                          <span>Manage Batch & Dues</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {/* Mobile Totals Summary Card */}
                <div className="p-4 bg-gray-50/90 border-t-2 border-gray-200 space-y-2 text-xs">
                  <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                    Total Summary ({filteredBatches.length} Batches)
                  </p>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Enrolled:</span>
                    <span className="font-bold text-gray-900">{analytics.totalStudents} students</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Gross:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(analytics.totalExpectedRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-black">
                    <span>Total Collected:</span>
                    <span>{formatCurrency(analytics.totalCollectedRevenue)}</span>
                  </div>
                  {analytics.totalDueRevenue > 0 && (
                    <div className="flex justify-between text-rose-600 font-black">
                      <span>Total Balance Due:</span>
                      <span>{formatCurrency(analytics.totalDueRevenue)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-800 font-bold pt-1 border-t border-gray-200">
                    <span>Overall Collection:</span>
                    <span>{analytics.overallCollectionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ALL STUDENTS LIST                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'STUDENTS' && (
          <div>
            {loading ? (
              <div className="p-12 text-center text-gray-500 font-medium">Loading students roster...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                  <Users className="text-gray-400" size={24} />
                </div>
                <h3 className="text-base font-semibold text-gray-900">No students found</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                  {searchTerm || studentStatusFilter !== 'ALL' || selectedBatchId !== 'ALL'
                    ? 'No enrolled students match your active search and filter criteria.' 
                    : 'No students have been enrolled in any training batches yet.'}
                </p>
              </div>
            ) : (
              <div>
                {/* Desktop All Students Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-3.5">Student Information</th>
                        <th className="px-6 py-3.5">Assigned Batch</th>
                        <th className="px-6 py-3.5">Contact & Phone</th>
                        <th className="px-6 py-3.5">Location</th>
                        <th className="px-6 py-3.5 text-center">Tuition & Payment</th>
                        <th className="px-6 py-3.5 text-center">Attendance</th>
                        <th className="px-6 py-3.5 text-right">Purchases</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white text-sm">
                      {filteredStudents.map((student) => {
                        const seatFee = student.seatPrice || 0;
                        const currentPaid = typeof student.paidAmount === 'number' ? student.paidAmount : (student.paymentStatus === 'Paid' ? seatFee : 0);
                        const currentDue = typeof student.dueAmount === 'number' ? student.dueAmount : Math.max(0, seatFee - currentPaid);
                        const isFullyPaid = currentDue === 0 && seatFee > 0;
                        const isPartial = currentPaid > 0 && currentDue > 0;

                        return (
                          <tr key={`${student.batchId}-${student._id}`} className="hover:bg-gray-50/80 transition-colors">
                            {/* Student Name & Avatar */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-100">
                                  {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{student.name}</p>
                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                    Enrolled {formatDate(student.enrolledAt)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Batch Code & Link */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link 
                                to={`/classes/${student.batchId}`}
                                className="group inline-flex flex-col hover:opacity-80 transition"
                              >
                                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 w-fit group-hover:bg-indigo-100">
                                  {student.batchNumber}
                                </span>
                                <span className="text-xs text-gray-600 font-medium mt-0.5 max-w-[180px] truncate">
                                  {student.batchTopic}
                                </span>
                              </Link>
                            </td>

                            {/* Phone */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-gray-700 font-medium text-xs">
                                <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                {student.phone}
                              </div>
                            </td>

                            {/* Location */}
                            <td className="px-6 py-4">
                              <p className="text-gray-900 font-medium text-xs">
                                {student.location || '—'}
                              </p>
                              {student.address && (
                                <p className="text-[11px] text-gray-400 truncate max-w-[180px]" title={student.address}>
                                  {student.address}
                                </p>
                              )}
                            </td>

                            {/* Payment Status & Installment Action */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex flex-col items-center gap-1">
                                {isFullyPaid ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Paid
                                  </span>
                                ) : isPartial ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Partial ({formatCurrency(currentPaid)})</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => openCollectPaymentModal(student)}
                                      className="px-2 py-0.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition cursor-pointer"
                                      title="Collect remaining balance"
                                    >
                                      Collect ₹{currentDue}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Pending</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => openCollectPaymentModal(student)}
                                      className="px-2 py-0.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition cursor-pointer"
                                      title="Record first tuition payment"
                                    >
                                      Collect
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Attendance Status Toggle */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleAttendance(student.batchId, student._id, student.attended)}
                                title={student.attended ? "Mark as Absent" : "Mark as Present"}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                                  student.attended
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:text-gray-900'
                                }`}
                              >
                                {student.attended ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Present
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 text-gray-400" /> Absent
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Purchases */}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={() => openStudentPurchases(student)}
                                className="inline-flex items-center px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-2xs cursor-pointer"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Purchases
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile All Students Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filteredStudents.map((student) => {
                    const seatFee = student.seatPrice || 0;
                    const currentPaid = typeof student.paidAmount === 'number' ? student.paidAmount : (student.paymentStatus === 'Paid' ? seatFee : 0);
                    const currentDue = typeof student.dueAmount === 'number' ? student.dueAmount : Math.max(0, seatFee - currentPaid);
                    const isFullyPaid = currentDue === 0 && seatFee > 0;
                    const isPartial = currentPaid > 0 && currentDue > 0;

                    return (
                      <div key={`${student.batchId}-${student._id}`} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-100">
                              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {student.phone}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => openStudentPurchases(student)}
                            className="inline-flex items-center p-2 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                            title="View Purchases"
                          >
                            <ShoppingBag className="w-4 h-4 text-indigo-500" />
                          </button>
                        </div>

                        {/* Batch & Location Info */}
                        <div className="text-xs bg-gray-50 p-2.5 rounded-lg space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Batch:</span>
                            <Link to={`/classes/${student.batchId}`} className="font-bold text-indigo-700 hover:underline">
                              {student.batchNumber} - {student.batchTopic}
                            </Link>
                          </div>
                          {student.location && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Location:</span>
                              <span className="text-gray-700 font-medium">{student.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Toggles & Payments */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-gray-400 font-medium">Fee:</span>
                            {isFullyPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Paid
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openCollectPaymentModal(student)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  isPartial
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                <span>{isPartial ? `Due ₹${currentDue}` : 'Collect'}</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-gray-400 font-medium">Attended:</span>
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(student.batchId, student._id, student.attended)}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                student.attended
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}
                            >
                              {student.attended ? (
                                <><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Present</>
                              ) : (
                                <><XCircle className="w-3.5 h-3.5 text-gray-400" /> Absent</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Table Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Showing {filteredStudents.length} of {allStudents.length} enrolled students</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CREATE NEW BATCH MODAL                                                    */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Create New Class Batch</h3>
                  <p className="text-xs text-gray-500">Schedule a training batch and set course details</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Batch Number & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Batch Code / Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Course Topic / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Class Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Location / Salon Studio
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Seat Price */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Seat Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.seatPrice}
                  onChange={(e) => setFormData({ ...formData, seatPrice: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Create Batch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COLLECT TUITION PAYMENT / INSTALLMENT MODAL                               */}
      {/* ========================================================================= */}
      {collectPaymentStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Record Tuition Installment</h3>
                  <p className="text-xs text-gray-500">
                    {collectPaymentStudent.name} • Batch {collectPaymentStudent.batchNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCollectPaymentStudent(null)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRecordTuitionPayment} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Financial Summary Card */}
              {(() => {
                const seatFee = collectPaymentStudent.seatPrice || 0;
                const currentPaid = typeof collectPaymentStudent.paidAmount === 'number' ? collectPaymentStudent.paidAmount : (collectPaymentStudent.paymentStatus === 'Paid' ? seatFee : 0);
                const currentDue = typeof collectPaymentStudent.dueAmount === 'number' ? collectPaymentStudent.dueAmount : Math.max(0, seatFee - currentPaid);

                return (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Total Batch Tuition Fee:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(seatFee)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Paid Till Date:</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(currentPaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-amber-200/80">
                      <span className="font-bold text-gray-800">Remaining Balance Due:</span>
                      <span className="font-black text-rose-600 text-base">{formatCurrency(currentDue)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Amount to Collect */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Amount Received Now (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={tuitionPaymentForm.amount}
                  onChange={(e) => setTuitionPaymentForm({ ...tuitionPaymentForm, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-base font-black text-emerald-800 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Payment Method *
                  </label>
                  <select
                    value={tuitionPaymentForm.paymentMethod}
                    onChange={(e) => setTuitionPaymentForm({ ...tuitionPaymentForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none font-medium"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={tuitionPaymentForm.paymentDate}
                    onChange={(e) => setTuitionPaymentForm({ ...tuitionPaymentForm, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Notes / Reference */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Payment Reference / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={tuitionPaymentForm.notes}
                  onChange={(e) => setTuitionPaymentForm({ ...tuitionPaymentForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Previous Installments Log */}
              {collectPaymentStudent.payments && collectPaymentStudent.payments.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Previous Payments Log</h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {collectPaymentStudent.payments.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <div>
                          <span className="font-bold text-gray-900">{formatCurrency(p.amount)}</span>
                          <span className="text-gray-400 ml-1.5">via {p.paymentMethod}</span>
                          {p.notes && <span className="text-gray-500 italic ml-1">({p.notes})</span>}
                        </div>
                        <span className="text-gray-400">{formatDate(p.paymentDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCollectPaymentStudent(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTuitionPayment}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {submittingTuitionPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Record Payment ({formatCurrency(Number(tuitionPaymentForm.amount) || 0)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUDENT PURCHASES MODAL                                                   */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h3>
                  <p className="text-xs text-gray-500">
                    Batch {selectedStudent.batchNumber} • Phone: {selectedStudent.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingSales ? (
                <div className="py-12 text-center text-gray-500">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium">Loading purchases...</p>
                </div>
              ) : studentSales.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-base font-bold text-gray-900 mb-1">No Purchases Found</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                    This student hasn't purchased any inventory or products yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Lifetime Spend Banner */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Lifetime Spend</p>
                      <p className="text-2xl font-black mt-0.5">
                        {formatCurrency(
                          studentSales.reduce((sum, s) => sum + (s.status !== 'VOIDED' ? (s.total || 0) : 0), 0)
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
                        {studentSales.filter(s => s.status !== 'VOIDED').length} Completed Invoices
                      </span>
                    </div>
                  </div>

                  {/* Orders List */}
                  <div className="space-y-3">
                    {studentSales.map((sale) => (
                      <div 
                        key={sale._id} 
                        className={`p-4 rounded-2xl border transition-all ${
                          sale.status === 'VOIDED' 
                            ? 'bg-gray-50/70 border-gray-200 opacity-60' 
                            : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">
                              {sale.invoiceNumber}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(sale.saleDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {sale.status === 'VOIDED' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                VOIDED
                              </span>
                            )}
                            <span className="text-sm font-black text-emerald-600">
                              {formatCurrency(sale.total)}
                            </span>
                          </div>
                        </div>

                        {/* Items Sub-list */}
                        <div className="bg-gray-50/80 rounded-xl p-3 space-y-1.5 border border-gray-100">
                          {sale.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-600">
                              <span>
                                <span className="font-bold text-gray-900">{item.quantity}x</span>{' '}
                                {item.productId?.name || item.product?.name || 'Product'}
                              </span>
                              <span className="font-semibold text-gray-800">
                                {formatCurrency(item.total)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <Link 
                to={`/sales?studentId=${selectedStudent._id}`} 
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Record New Sale
              </Link>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesList;
