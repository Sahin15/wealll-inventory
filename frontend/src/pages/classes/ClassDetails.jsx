import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const ClassDetails = () => {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    location: '',
    address: '',
    paymentStatus: 'Pending'
  });

  const fetchBatch = async () => {
    try {
      const res = await api.get(`/classes/${id}`);
      setBatch(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load batch details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [id]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/classes/${id}/students`, studentForm);
      setStudentForm({ name: '', phone: '', location: '', address: '', paymentStatus: 'Pending' });
      setShowStudentForm(false);
      fetchBatch();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add student');
    }
  };

  const toggleAttendance = async (studentId, currentStatus) => {
    try {
      await api.put(`/classes/${id}/students/${studentId}`, { attended: !currentStatus });
      fetchBatch();
    } catch (err) {
      setError('Failed to update attendance');
    }
  };

  const togglePayment = async (studentId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
      await api.put(`/classes/${id}/students/${studentId}`, { paymentStatus: newStatus });
      fetchBatch();
    } catch (err) {
      setError('Failed to update payment status');
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading details...</div>;
  if (!batch) return <div className="p-6 text-center text-red-500">Batch not found.</div>;

  const totalRevenue = batch.students.filter(s => s.paymentStatus === 'Paid').length * batch.seatPrice;
  const attendedCount = batch.students.filter(s => s.attended).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/classes" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Batch: {batch.batchNumber}</h2>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Batch Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Topic</p>
          <p className="text-lg font-semibold text-gray-900 truncate">{batch.topic}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Date & Location</p>
          <p className="text-lg font-semibold text-gray-900">{new Date(batch.date).toLocaleDateString()}</p>
          <p className="text-sm text-gray-600 truncate">{batch.location || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Seat Price</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(batch.seatPrice)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-600 font-medium">Paid Revenue</p>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <h3 className="text-xl font-bold text-gray-900">Enrolled Students ({batch.students.length})</h3>
        <button 
          onClick={() => setShowStudentForm(!showStudentForm)} 
          className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center"
        >
          {showStudentForm ? 'Cancel' : <><UserPlus className="w-4 h-4 mr-2" /> Add Student</>}
        </button>
      </div>

      <div className="mb-2 text-sm text-gray-600">
        Attendance: <span className="font-semibold">{attendedCount} / {batch.students.length}</span> present
      </div>

      {showStudentForm && (
        <div className="card p-6 border-l-4 border-indigo-600">
          <h4 className="text-md font-medium text-gray-900 mb-4">Enroll New Student</h4>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Name</label>
              <input type="text" required value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="input-field mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="text" required value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} className="input-field mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Status</label>
              <select value={studentForm.paymentStatus} onChange={e => setStudentForm({...studentForm, paymentStatus: e.target.value})} className="input-field mt-1">
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location / City</label>
              <input type="text" value={studentForm.location} onChange={e => setStudentForm({...studentForm, location: e.target.value})} className="input-field mt-1" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Full Address</label>
              <input type="text" value={studentForm.address} onChange={e => setStudentForm({...studentForm, address: e.target.value})} className="input-field mt-1" />
            </div>
            
            <div className="lg:col-span-3 flex justify-end mt-2">
              <button type="submit" className="btn-primary bg-indigo-600 hover:bg-indigo-700">Add Student</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {batch.students.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No students enrolled yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batch.students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{student.location || '-'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{student.address || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => togglePayment(student._id, student.paymentStatus)}
                        className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white focus:outline-none ${student.paymentStatus === 'Paid' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                      >
                        {student.paymentStatus}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => toggleAttendance(student._id, student.attended)}
                        className="focus:outline-none"
                      >
                        {student.attended ? (
                          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto hover:text-emerald-600" />
                        ) : (
                          <XCircle className="w-8 h-8 text-gray-300 mx-auto hover:text-gray-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetails;
