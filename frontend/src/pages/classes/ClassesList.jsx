import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const ClassesList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    batchNumber: '',
    topic: '',
    date: '',
    location: '',
    seatPrice: ''
  });

  const fetchBatches = async () => {
    try {
      const res = await api.get('/classes');
      setBatches(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/classes', formData);
      setFormData({
        batchNumber: '',
        topic: '',
        date: '',
        location: '',
        seatPrice: ''
      });
      setShowForm(false);
      fetchBatches();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create batch');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Classes & Batches</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Batch</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="card p-6 border-l-4 border-indigo-600">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Class Batch</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch Number</label>
              <input type="text" required value={formData.batchNumber} onChange={e => setFormData({...formData, batchNumber: e.target.value})} className="input-field mt-1" placeholder="e.g. AUG-2024" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Topic / Course Name</label>
              <input type="text" required value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} className="input-field mt-1" placeholder="e.g. Bridal Masterclass" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-field mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="input-field mt-1" placeholder="e.g. Main Studio" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Seat Price (₹)</label>
              <input type="number" required min="0" step="0.01" value={formData.seatPrice} onChange={e => setFormData({...formData, seatPrice: e.target.value})} className="input-field mt-1" />
            </div>
            
            <div className="md:col-span-2 flex justify-end mt-4">
              <button type="submit" className="btn-primary bg-indigo-600 hover:bg-indigo-700">Create Batch</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading classes...</div>
        ) : batches.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No classes created yet.</div>
        ) : (
          <div className="overflow-x-auto min-h-[16rem]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students Enrolled</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches.map((batch) => (
                  <tr key={batch._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {batch.batchNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {batch.topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(batch.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(batch.seatPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        {batch.students?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/classes/${batch._id}`} className="text-indigo-600 hover:text-indigo-900">
                        Manage &rarr;
                      </Link>
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

export default ClassesList;
