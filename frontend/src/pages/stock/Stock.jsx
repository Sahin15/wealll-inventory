import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateFormatter';

const Stock = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stock');
      setMovements(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'IN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">PURCHASE (IN)</span>;
      case 'OUT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">SALE (OUT)</span>;
      case 'ADJUSTMENT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">ADJUSTMENT</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Stock Ledger</h2>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading stock movements...</div>
        ) : movements.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No stock movements recorded yet.</div>
        ) : (
          <div className="overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference (Invoice)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((m) => (
                  <tr key={m._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(m.createdAt, true)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {m.productId?.name || 'Unknown Product'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(m.type)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${m.type === 'IN' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                      {m.type === 'IN' ? '+' : (m.type === 'OUT' ? '-' : '')}{m.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.referenceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.note || '-'}
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {movements.map((m) => (
                <div key={m._id} className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900">{m.productId?.name || 'Unknown Product'}</div>
                      <div className="text-xs text-gray-500">{formatDate(m.createdAt, true)}</div>
                    </div>
                    <div>{getTypeBadge(m.type)}</div>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <div>
                      <span className="text-gray-500">Ref: </span>
                      <span className="text-gray-900">{m.referenceType || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Qty: </span>
                      <span className={`font-bold ${m.type === 'IN' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                        {m.type === 'IN' ? '+' : (m.type === 'OUT' ? '-' : '')}{m.quantity}
                      </span>
                    </div>
                  </div>
                  {m.note && (
                    <div className="text-xs text-gray-500 italic mt-1 border-t border-gray-50 pt-1">
                      {m.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock;
