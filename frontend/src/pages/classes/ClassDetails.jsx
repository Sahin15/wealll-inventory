import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  ShoppingBag, 
  Users, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  BookOpen, 
  Search, 
  X, 
  Check, 
  Clock, 
  Phone, 
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';

const ClassDetails = () => {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student Purchases Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSales, setStudentSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);

  // Enroll Student Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [submittingStudent, setSubmittingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    location: '',
    address: '',
    paymentStatus: 'Pending',
    paidAmount: '',
    paymentMethod: 'CASH',
    notes: ''
  });

  // Collect Tuition Payment Modal State
  const [collectPaymentStudent, setCollectPaymentStudent] = useState(null);
  const [tuitionPaymentForm, setTuitionPaymentForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().substring(0, 10),
    notes: ''
  });
  const [submittingTuitionPayment, setSubmittingTuitionPayment] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PRESENT' | 'ABSENT' | 'PAID' | 'PARTIAL' | 'PENDING'

  const fetchBatch = async () => {
    try {
      const res = await api.get(`/classes/${id}`);
      setBatch(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [id]);

  const openEnrollModal = () => {
    setStudentForm({
      name: '',
      phone: '',
      location: '',
      address: '',
      paymentStatus: 'Pending',
      paidAmount: '',
      paymentMethod: 'CASH',
      notes: ''
    });
    setIsEnrollModalOpen(true);
  };

  const closeEnrollModal = () => {
    setIsEnrollModalOpen(false);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.name.trim()) return toast.error('Student name is required');
    if (!studentForm.phone.trim()) return toast.error('Phone number is required');

    const seatFee = batch?.seatPrice || 0;

    // Validate partial amount if selected
    if (studentForm.paymentStatus === 'Partial') {
      const parsed = Number(studentForm.paidAmount);
      if (isNaN(parsed) || parsed <= 0) {
        return toast.error('Please enter the advance amount paid for partial payment');
      }
      if (parsed > seatFee) {
        return toast.error(`Advance amount cannot exceed seat fee of ${formatCurrency(seatFee)}`);
      }
    }

    setSubmittingStudent(true);
    try {
      await api.post(`/classes/${id}/students`, {
        ...studentForm,
        paidAmount: studentForm.paymentStatus === 'Partial' ? Number(studentForm.paidAmount) : undefined
      });
      toast.success('Student enrolled successfully!');
      closeEnrollModal();
      fetchBatch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to enroll student');
    } finally {
      setSubmittingStudent(false);
    }
  };

  const toggleAttendance = async (studentId, currentStatus) => {
    try {
      await api.put(`/classes/${id}/students/${studentId}`, { attended: !currentStatus });
      toast.success(!currentStatus ? 'Marked as Present' : 'Marked as Absent');
      fetchBatch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update attendance');
    }
  };

  // Open Collect Tuition Payment Modal
  const openCollectPaymentModal = (student) => {
    const seatFee = batch?.seatPrice || 0;
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

    const seatFee = batch?.seatPrice || 0;
    const currentPaid = typeof collectPaymentStudent.paidAmount === 'number' ? collectPaymentStudent.paidAmount : (collectPaymentStudent.paymentStatus === 'Paid' ? seatFee : 0);
    const currentDue = typeof collectPaymentStudent.dueAmount === 'number' ? collectPaymentStudent.dueAmount : Math.max(0, seatFee - currentPaid);

    if (payAmt > currentDue) {
      return toast.error(`Payment amount cannot exceed remaining balance due of ${formatCurrency(currentDue)}`);
    }

    setSubmittingTuitionPayment(true);
    try {
      await api.post(`/classes/${id}/students/${collectPaymentStudent._id}/payments`, tuitionPaymentForm);
      toast.success('Tuition payment recorded successfully!');
      setCollectPaymentStudent(null);
      fetchBatch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record tuition payment');
    } finally {
      setSubmittingTuitionPayment(false);
    }
  };

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

  // Metrics Calculations (supporting partial payments)
  const metrics = useMemo(() => {
    if (!batch || !batch.students) {
      return { 
        total: 0, 
        attended: 0, 
        absent: 0, 
        paid: 0, 
        partial: 0, 
        pending: 0, 
        paidRevenue: 0, 
        dueRevenue: 0, 
        expectedRevenue: 0, 
        attendanceRate: 0 
      };
    }
    const seatFee = batch.seatPrice || 0;
    const total = batch.students.length;
    const attended = batch.students.filter(s => s.attended).length;
    const absent = total - attended;

    let paid = 0;
    let partial = 0;
    let pending = 0;
    let paidRevenue = 0;

    batch.students.forEach(s => {
      const sPaid = typeof s.paidAmount === 'number' ? s.paidAmount : (s.paymentStatus === 'Paid' ? seatFee : 0);
      paidRevenue += sPaid;

      if (s.paymentStatus === 'Paid' || (sPaid >= seatFee && seatFee > 0)) {
        paid++;
      } else if (s.paymentStatus === 'Partial' || (sPaid > 0 && sPaid < seatFee)) {
        partial++;
      } else {
        pending++;
      }
    });

    const expectedRevenue = total * seatFee;
    const dueRevenue = Math.max(0, expectedRevenue - paidRevenue);
    const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0;

    return { total, attended, absent, paid, partial, pending, paidRevenue, dueRevenue, expectedRevenue, attendanceRate };
  }, [batch]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    if (!batch?.students) return [];
    const seatFee = batch.seatPrice || 0;

    return batch.students.filter(s => {
      const sPaid = typeof s.paidAmount === 'number' ? s.paidAmount : (s.paymentStatus === 'Paid' ? seatFee : 0);
      const isPaid = s.paymentStatus === 'Paid' || (sPaid >= seatFee && seatFee > 0);
      const isPartial = s.paymentStatus === 'Partial' || (sPaid > 0 && sPaid < seatFee);
      const isPending = !isPaid && !isPartial;

      // Status Filter
      if (statusFilter === 'PRESENT' && !s.attended) return false;
      if (statusFilter === 'ABSENT' && s.attended) return false;
      if (statusFilter === 'PAID' && !isPaid) return false;
      if (statusFilter === 'PARTIAL' && !isPartial) return false;
      if (statusFilter === 'PENDING' && !isPending) return false;

      // Text Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = s.name?.toLowerCase().includes(query);
        const matchesPhone = s.phone?.toLowerCase().includes(query);
        const matchesLocation = s.location?.toLowerCase().includes(query);
        const matchesAddress = s.address?.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesLocation && !matchesAddress) return false;
      }

      return true;
    });
  }, [batch, statusFilter, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-gray-600">Loading batch details...</p>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 max-w-lg mx-auto mt-12 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Batch Not Found</h3>
        <p className="text-sm text-gray-500 mb-6">The requested training batch does not exist or has been removed.</p>
        <Link 
          to="/classes" 
          className="inline-flex items-center justify-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Classes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link 
            to="/classes" 
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-rose-600 mb-2 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Back to All Batches
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 tracking-wide uppercase">
              {batch.batchNumber}
            </span>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{batch.topic}</h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage enrolled students, attendance record, and track installment tuition payments.
          </p>
        </div>

        <button 
          onClick={openEnrollModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-rose-200 transition-all hover:shadow-md cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Enroll Student
        </button>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={openEnrollModal}
        className="sm:hidden fixed bottom-20 right-4 z-40 bg-rose-600 text-white rounded-full p-4 shadow-xl hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 min-h-[56px] min-w-[56px] flex items-center justify-center"
        title="Enroll Student"
      >
        <UserPlus size={24} />
      </button>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Schedule & Location */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500">Class Schedule</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{formatDate(batch.date)}</p>
            <div className="flex items-center text-xs text-gray-500 mt-1 truncate">
              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
              <span className="truncate">{batch.location || 'Main Studio'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Seat Price & Potential */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500">Tuition Per Seat</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">{formatCurrency(batch.seatPrice)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Gross: <span className="font-semibold text-gray-700">{formatCurrency(metrics.expectedRevenue)}</span>
            </p>
          </div>
        </div>

        {/* Card 3: Tuition Revenue Collected & Dues */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/40 shadow-xs hover:border-emerald-300 transition-all flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-emerald-700">Tuition Collected</p>
            <p className="text-xl font-black text-emerald-800 mt-0.5">{formatCurrency(metrics.paidRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Due: <span className="font-bold text-rose-600">{formatCurrency(metrics.dueRevenue)}</span> • {metrics.paid} Paid, {metrics.partial} Partial
            </p>
          </div>
        </div>

        {/* Card 4: Attendance Summary */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500">Attendance Rate</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">
              {metrics.attendanceRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-semibold text-purple-700">{metrics.attended} Present</span> • {metrics.absent} Absent
            </p>
          </div>
        </div>
      </div>

      {/* Main Student Roster Section */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Section Header & Filters */}
        <div className="p-5 border-b border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Enrolled Students
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-100">
                  {batch.students?.length || 0}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Click on attendance chip or "Collect" to record installment payments and clear tuition dues.
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  statusFilter === 'ALL' 
                    ? 'bg-gray-900 text-white shadow-xs' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({metrics.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PRESENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  statusFilter === 'PRESENT' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                }`}
              >
                Present ({metrics.attended})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ABSENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  statusFilter === 'ABSENT' 
                    ? 'bg-gray-700 text-white shadow-xs' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Absent ({metrics.absent})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PAID')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  statusFilter === 'PAID' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                }`}
              >
                Paid ({metrics.paid})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PARTIAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  statusFilter === 'PARTIAL' 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100'
                }`}
              >
                Partial ({metrics.partial})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  statusFilter === 'PENDING' 
                    ? 'bg-rose-600 text-white shadow-xs' 
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100'
                }`}
              >
                Pending ({metrics.pending})
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Student Roster Table (Desktop) */}
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-gray-900 mb-1">
              {batch.students?.length === 0 ? 'No Students Enrolled' : 'No Matching Students'}
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-4">
              {batch.students?.length === 0 
                ? 'Get started by enrolling the first attendee in this class batch.' 
                : 'No students matched the active search and filter criteria.'}
            </p>
            {batch.students?.length === 0 && (
              <button
                type="button"
                onClick={openEnrollModal}
                className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Enroll First Student
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-3.5 px-6">Student Information</th>
                    <th className="py-3.5 px-6">Contact & Phone</th>
                    <th className="py-3.5 px-6">City / Location</th>
                    <th className="py-3.5 px-6 text-center">Tuition & Payment</th>
                    <th className="py-3.5 px-6 text-center">Attendance</th>
                    <th className="py-3.5 px-6 text-right">Student Purchases</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredStudents.map((student) => {
                    const seatFee = batch?.seatPrice || 0;
                    const currentPaid = typeof student.paidAmount === 'number' ? student.paidAmount : (student.paymentStatus === 'Paid' ? seatFee : 0);
                    const currentDue = typeof student.dueAmount === 'number' ? student.dueAmount : Math.max(0, seatFee - currentPaid);
                    const isFullyPaid = currentDue === 0 && seatFee > 0;
                    const isPartial = currentPaid > 0 && currentDue > 0;

                    return (
                      <tr key={student._id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Name & Enrolled Date */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-700 font-black flex items-center justify-center text-xs shrink-0 border border-rose-100">
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

                        {/* Phone */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center text-gray-700 font-medium text-xs">
                            <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {student.phone}
                          </div>
                        </td>

                        {/* Location & Address */}
                        <td className="py-4 px-6">
                          <p className="text-gray-900 font-medium text-xs">
                            {student.location || '—'}
                          </p>
                          {student.address && (
                            <p className="text-[11px] text-gray-400 truncate max-w-[220px]" title={student.address}>
                              {student.address}
                            </p>
                          )}
                        </td>

                        {/* Payment Status & Installment Collection */}
                        <td className="py-4 px-6 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center gap-1">
                            {isFullyPaid ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Paid
                              </div>
                            ) : isPartial ? (
                              <div className="flex items-center gap-1.5">
                                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Partial ({formatCurrency(currentPaid)})</span>
                                </div>
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
                                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Pending</span>
                                </div>
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

                        {/* Attendance (Toggleable Chip) */}
                        <td className="py-4 px-6 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => toggleAttendance(student._id, student.attended)}
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

                        {/* Student Purchases */}
                        <td className="py-4 px-6 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => openStudentPurchases(student)}
                            className="inline-flex items-center px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all shadow-2xs cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-rose-500" /> Purchases
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Student Roster Cards (Mobile View) */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredStudents.map((student) => {
                const seatFee = batch?.seatPrice || 0;
                const currentPaid = typeof student.paidAmount === 'number' ? student.paidAmount : (student.paymentStatus === 'Paid' ? seatFee : 0);
                const currentDue = typeof student.dueAmount === 'number' ? student.dueAmount : Math.max(0, seatFee - currentPaid);
                const isFullyPaid = currentDue === 0 && seatFee > 0;
                const isPartial = currentPaid > 0 && currentDue > 0;

                return (
                  <div key={student._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-700 font-bold flex items-center justify-center text-xs shrink-0 border border-rose-100">
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
                        className="inline-flex items-center p-2 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                        title="View Purchases"
                      >
                        <ShoppingBag className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>

                    {(student.location || student.address) && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                        <p className="font-medium text-gray-700">{student.location || 'Location Not Specified'}</p>
                        {student.address && <p className="text-gray-400 text-[11px] truncate">{student.address}</p>}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      {/* Payment Status & Collect Button */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-400 font-medium">Fee:</span>
                        {isFullyPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" /> Paid
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

                      {/* Attendance Toggle */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-400 font-medium">Attended:</span>
                        <button
                          type="button"
                          onClick={() => toggleAttendance(student._id, student.attended)}
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
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ENROLL NEW STUDENT MODAL                                                  */}
      {/* ========================================================================= */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Enroll New Student</h3>
                  <p className="text-xs text-gray-500">
                    Register attendee for {batch.batchNumber} • Seat Fee: {formatCurrency(batch.seatPrice)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEnrollModal}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddStudent} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Student Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all font-medium text-gray-900"
                />
              </div>

              {/* Phone & Payment Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all font-medium text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tuition Payment
                  </label>
                  <select
                    value={studentForm.paymentStatus}
                    onChange={(e) => setStudentForm({ ...studentForm, paymentStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all font-medium text-gray-900"
                  >
                    <option value="Pending">Pending (Unpaid)</option>
                    <option value="Partial">Partial (Advance payment)</option>
                    <option value="Paid">Paid (Full tuition received)</option>
                  </select>
                </div>
              </div>

              {/* Partial / Paid Details */}
              {studentForm.paymentStatus !== 'Pending' && (
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Payment Method
                      </label>
                      <select
                        value={studentForm.paymentMethod}
                        onChange={(e) => setStudentForm({ ...studentForm, paymentMethod: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                      >
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI / GPay / PhonePe</option>
                        <option value="CARD">Debit / Credit Card</option>
                        <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {studentForm.paymentStatus === 'Partial' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Advance Paid (₹) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={batch.seatPrice}
                          required
                          value={studentForm.paidAmount}
                          onChange={(e) => setStudentForm({ ...studentForm, paidAmount: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-bold text-rose-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {studentForm.paymentStatus === 'Partial' && (
                    <div className="flex justify-between items-center text-xs text-gray-600 pt-2 border-t border-rose-200/60">
                      <span>Tuition: <strong className="text-gray-900">{formatCurrency(batch.seatPrice)}</strong></span>
                      <span>Advance: <strong className="text-emerald-700">{formatCurrency(Number(studentForm.paidAmount) || 0)}</strong></span>
                      <span>Balance Due: <strong className="text-rose-600">{formatCurrency(Math.max(0, batch.seatPrice - (Number(studentForm.paidAmount) || 0)))}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* City / Location */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  City / Location
                </label>
                <input
                  type="text"
                  value={studentForm.location}
                  onChange={(e) => setStudentForm({ ...studentForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all font-medium text-gray-900"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Residential / Salon Address
                </label>
                <textarea
                  rows={2}
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all font-medium text-gray-900 resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEnrollModal}
                  disabled={submittingStudent}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStudent}
                  className="inline-flex items-center px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-md shadow-rose-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingStudent ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1.5" /> Complete Enrollment
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
                    {collectPaymentStudent.name} • Batch {batch.batchNumber}
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
                const seatFee = batch?.seatPrice || 0;
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
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none font-medium"
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
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none font-medium"
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
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h3>
                  <p className="text-xs text-gray-500">
                    Phone: {selectedStudent.phone} • Student Purchase History
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
                  <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-rose-100 uppercase tracking-wider">Lifetime Spend</p>
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
                className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
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

export default ClassDetails;
