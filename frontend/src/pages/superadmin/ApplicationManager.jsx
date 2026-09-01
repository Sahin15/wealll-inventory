import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateFormatter';
import { toast } from 'react-hot-toast';
import { useDialog } from '../../context/DialogContext';

const ApplicationManager = () => {
  const { confirm } = useDialog();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED
  
  // Modals state
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/superadmin/applications');
      setApplications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id) => {
    const isConfirmed = await confirm({
      title: 'Approve Application',
      message: 'Are you sure you want to approve this application and create a tenant?',
      type: 'success',
      confirmText: 'Yes, Approve'
    });
    if (!isConfirmed) return;
    try {
      await api.post(`/superadmin/applications/${id}/approve`);
      setSelectedApp(null);
      fetchApplications();
      toast.success('Application approved successfully. Tenant and Admin account created.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve application');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/superadmin/applications/${selectedApp._id}/reject`, { rejectionReason: rejectReason });
      setShowRejectModal(false);
      setSelectedApp(null);
      setRejectReason('');
      fetchApplications();
      toast.success('Application rejected.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject application');
    }
  };

  const filteredApps = applications.filter(app => app.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Registration Applications</h2>
        <div className="flex space-x-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === status 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading applications...</div>
        ) : filteredApps.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No {filter.toLowerCase()} applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApps.map((app) => (
                  <tr key={app._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.businessName}
                      <div className="text-xs text-gray-500 font-normal">{app.businessType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.applicantName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.applicantEmail}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(app.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && !showRejectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-500">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              {selectedApp.status === 'REJECTED' && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                  <h4 className="text-sm font-medium text-red-800">Rejection Reason</h4>
                  <p className="mt-1 text-sm text-red-700">{selectedApp.rejectionReason}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-3">Business Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="block text-xs text-gray-500">Business Name</span><span className="text-sm">{selectedApp.businessName}</span></div>
                  <div><span className="block text-xs text-gray-500">Business Type</span><span className="text-sm">{selectedApp.businessType}</span></div>
                  <div><span className="block text-xs text-gray-500">Email</span><span className="text-sm">{selectedApp.businessEmail}</span></div>
                  <div><span className="block text-xs text-gray-500">Phone</span><span className="text-sm">{selectedApp.businessPhone}</span></div>
                  <div className="col-span-2"><span className="block text-xs text-gray-500">Address</span><span className="text-sm">{selectedApp.businessAddress}, {selectedApp.city}, {selectedApp.state} {selectedApp.pinCode}</span></div>
                  <div><span className="block text-xs text-gray-500">GSTIN</span><span className="text-sm">{selectedApp.gstin || 'N/A'}</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-3">Applicant Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="block text-xs text-gray-500">Name</span><span className="text-sm">{selectedApp.applicantName}</span></div>
                  <div><span className="block text-xs text-gray-500">Email</span><span className="text-sm">{selectedApp.applicantEmail}</span></div>
                  <div><span className="block text-xs text-gray-500">Phone</span><span className="text-sm">{selectedApp.applicantPhone}</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-3">Usage & Referral</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="block text-xs text-gray-500">Expected Products</span><span className="text-sm">{selectedApp.expectedProductCount || 'N/A'}</span></div>
                  <div><span className="block text-xs text-gray-500">Expected Users</span><span className="text-sm">{selectedApp.expectedUserCount || 'N/A'}</span></div>
                  <div><span className="block text-xs text-gray-500">Using Excel?</span><span className="text-sm">{selectedApp.currentlyUsingExcel ? 'Yes' : 'No'}</span></div>
                  <div><span className="block text-xs text-gray-500">Source</span><span className="text-sm">{selectedApp.referralSource || 'N/A'}</span></div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 sticky bottom-0">
              <button onClick={() => setSelectedApp(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Close
              </button>
              {selectedApp.status === 'PENDING' && (
                <>
                  <button onClick={() => setShowRejectModal(true)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
                    Reject
                  </button>
                  <button onClick={() => handleApprove(selectedApp._id)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700">
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reject Application</h3>
            </div>
            <form onSubmit={handleReject}>
              <div className="px-6 py-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                <textarea
                  required
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="input-field"
                  placeholder="Provide a reason for rejection..."
                />
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManager;
