import React, { useState, useEffect } from 'react';
import { Plus, X, Search, FileText, AlertCircle, TrendingDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Void State
  const [voidModalPurchase, setVoidModalPurchase] = useState(null);
  const [viewModalPurchase, setViewModalPurchase] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [revealId, setRevealId] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierName: '',
    productId: '',
    quantity: '',
    unitCost: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purchRes, prodRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/products')
      ]);
      setPurchases(purchRes.data.data);
      setProducts(prodRes.data.data);
      if (prodRes.data.data.length > 0) {
        setFormData(f => ({ ...f, productId: prodRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const quantity = Number(formData.quantity);
      const unitCost = Number(formData.unitCost);
      const itemTotal = quantity * unitCost;

      const payload = {
        invoiceNumber: formData.invoiceNumber,
        supplierName: formData.supplierName,
        subtotal: itemTotal,
        total: itemTotal,
        items: [
          {
            productId: formData.productId,
            quantity: quantity,
            purchasePrice: unitCost,
            total: itemTotal
          }
        ]
      };
      await api.post('/purchases', payload);
      
      // Reset form and refresh
      setFormData({
        invoiceNumber: '',
        supplierName: '',
        productId: products[0]?._id || '',
        quantity: '',
        unitCost: ''
      });
      setShowForm(false);
      fetchData();
      toast.success('Purchase recorded successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record purchase');
    }
  };

  const handleVoid = async (e) => {
    e.preventDefault();
    if (!voidReason.trim()) return toast.error('Void reason is required');
    try {
      await api.post(`/purchases/${voidModalPurchase._id}/void`, { voidReason });
      setVoidModalPurchase(null);
      setVoidReason('');
      fetchData();
      toast.success('Purchase voided successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to void purchase');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Purchases</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="hidden md:block btn-primary"
        >
          {showForm ? 'Cancel' : 'New Purchase'}
        </button>
      </div>

      {/* Floating Action Button for Mobile */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="md:hidden fixed bottom-20 right-4 z-40 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[56px] min-w-[56px] flex items-center justify-center"
        >
          <Plus size={24} />
        </button>
      )}

      {showForm && (
        <div className="card p-6 border-l-4 border-indigo-600 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Record New Purchase</h3>
            <button 
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 p-2 min-h-[44px] min-w-[44px]"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                <input type="text" required value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="input-field mt-1" placeholder="e.g. INV-1001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
                <input type="text" required value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} className="input-field mt-1" />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Item Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} className="input-field mt-1">
                    {products.map(p => <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity Added</label>
                  <input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="input-field mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Cost (₹)</label>
                  <input type="number" required step="0.01" min="0" value={formData.unitCost} onChange={e => setFormData({...formData, unitCost: e.target.value})} className="input-field mt-1" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="btn-primary">Record Purchase & Add Stock</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading purchases...</div>
        ) : purchases.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No purchases recorded yet.</div>
        ) : (
          <div className="overflow-hidden min-h-[16rem]">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(purchase.purchaseDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {purchase.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {purchase.supplierName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {purchase.items.map((item, idx) => (
                        <div key={idx}>
                          {item.quantity}x {item.productId?.name || item.product?.name || 'Unknown Product'}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(purchase.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        purchase.status === 'VOIDED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {purchase.status || 'COMPLETED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(purchase.status !== 'VOIDED') && (
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={() => setRevealId(revealId === purchase._id ? null : purchase._id)} 
                            className="inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-3 py-1.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Action
                            <svg className="-mr-1 ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {revealId === purchase._id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                              <button 
                                onClick={() => {
                                  setViewModalPurchase(purchase);
                                  setRevealId(null);
                                }} 
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Details
                              </button>
                              <button 
                                onClick={() => {
                                  setVoidModalPurchase(purchase);
                                  setRevealId(null);
                                }} 
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Void Transaction
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {purchases.map((purchase) => (
                <div key={purchase._id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-indigo-600 text-sm">{purchase.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">{formatDate(purchase.purchaseDate)}</div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      purchase.status === 'VOIDED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {purchase.status || 'COMPLETED'}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {purchase.supplierName}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 space-y-1">
                      {purchase.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.quantity}x {item.productId?.name || item.product?.name || 'Unknown'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-50 pt-2 mt-1">
                    <div className="font-bold text-gray-900">{formatCurrency(purchase.total)}</div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setViewModalPurchase(purchase)}
                        className="p-2 text-indigo-600 hover:text-indigo-900 min-h-[44px] min-w-[44px]"
                      >
                        <Eye size={20} />
                      </button>
                      {purchase.status !== 'VOIDED' && (
                        <button 
                          onClick={() => setVoidModalPurchase(purchase)}
                          className="p-2 text-red-600 hover:text-red-900 min-h-[44px] min-w-[44px]"
                        >
                          Void
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {voidModalPurchase && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Void Transaction?</h3>
            <p className="text-sm text-gray-500 mb-4">
              This will reverse the inventory changes made by this transaction (Invoice: {voidModalPurchase.invoiceNumber}).
            </p>
            <form onSubmit={handleVoid}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <input 
                  type="text" 
                  required 
                  value={voidReason} 
                  onChange={e => setVoidReason(e.target.value)} 
                  className="input-field mt-1" 
                  placeholder="e.g. Incorrect quantity entered"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setVoidModalPurchase(null)} className="btn-primary bg-gray-500 hover:bg-gray-600">Cancel</button>
                <button type="submit" className="btn-primary bg-red-600 hover:bg-red-700">Void Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModalPurchase && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Purchase Details</h3>
              <button onClick={() => setViewModalPurchase(null)} className="text-gray-400 hover:text-gray-500 text-2xl">&times;</button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong className="text-gray-900">Invoice:</strong> {viewModalPurchase.invoiceNumber}</p>
              <p><strong className="text-gray-900">Supplier:</strong> {viewModalPurchase.supplierName}</p>
              <p><strong className="text-gray-900">Date:</strong> {formatDate(viewModalPurchase.purchaseDate, true)}</p>
              <p><strong className="text-gray-900">Status:</strong> {viewModalPurchase.status || 'COMPLETED'}</p>
              {viewModalPurchase.voidReason && (
                <p><strong className="text-gray-900 text-red-600">Void Reason:</strong> {viewModalPurchase.voidReason}</p>
              )}
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {viewModalPurchase.items.map((item, idx) => (
                    <li key={idx}>
                      {item.quantity}x {item.productId?.name || item.product?.name || 'Unknown Product'} @ {formatCurrency(item.purchasePrice)} = {formatCurrency(item.total)}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-right font-bold text-lg text-gray-900">Total: {formatCurrency(viewModalPurchase.total)}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewModalPurchase(null)} className="btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
