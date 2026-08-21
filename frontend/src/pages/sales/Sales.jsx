import React, { useState, useEffect } from 'react';
import { Plus, Eye } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Void State
  const [voidModalSale, setVoidModalSale] = useState(null);
  const [viewModalSale, setViewModalSale] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [revealId, setRevealId] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerName: '',
    productId: '',
    quantity: '',
    unitPrice: '',
    discount: '0'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, prodRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products')
      ]);
      setSales(salesRes.data.data);
      setProducts(prodRes.data.data);
      if (prodRes.data.data.length > 0) {
        setFormData(f => ({ ...f, productId: prodRes.data.data[0]._id, unitPrice: prodRes.data.data[0].sellingPrice }));
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

  const handleProductChange = (e) => {
    const pId = e.target.value;
    const prod = products.find(p => p._id === pId);
    setFormData({
      ...formData,
      productId: pId,
      unitPrice: prod ? prod.sellingPrice : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        invoiceNumber: formData.invoiceNumber,
        customerName: formData.customerName,
        items: [
          {
            productId: formData.productId,
            quantity: Number(formData.quantity),
            unitPrice: Number(formData.unitPrice),
            discount: Number(formData.discount)
          }
        ]
      };
      await api.post('/sales', payload);
      
      // Reset form and refresh
      setFormData({
        invoiceNumber: '',
        customerName: '',
        productId: products[0]?._id || '',
        quantity: '',
        unitPrice: products[0]?.sellingPrice || '',
        discount: '0'
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record sale');
    }
  };

  const handleVoid = async (e) => {
    e.preventDefault();
    if (!voidReason.trim()) return alert('Void reason is required');
    try {
      await api.post(`/sales/${voidModalSale._id}/void`, { voidReason });
      setVoidModalSale(null);
      setVoidReason('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to void sale');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Sales</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary bg-emerald-600 hover:bg-emerald-700"
        >
          {showForm ? 'Cancel' : 'New Sale'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 border-l-4 border-emerald-600">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Record New Sale</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                <input type="text" required value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="input-field mt-1" placeholder="e.g. SALE-1001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input type="text" required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="input-field mt-1" />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Item Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <select required value={formData.productId} onChange={handleProductChange} className="input-field mt-1">
                    {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.currentStock})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="input-field mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Price (₹)</label>
                  <input type="number" required step="0.01" min="0" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} className="input-field mt-1" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Discount Amount (₹)</label>
                  <input type="number" step="0.01" min="0" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="input-field mt-1" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="btn-primary bg-emerald-600 hover:bg-emerald-700">Complete Sale & Reduce Stock</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading sales...</div>
        ) : sales.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No sales recorded yet.</div>
        ) : (
          <div className="overflow-x-auto min-h-[16rem]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                      {sale.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sale.items.map((item, idx) => (
                        <div key={idx}>
                          {item.quantity}x {item.product?.name || 'Unknown Product'}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sale.status === 'VOIDED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {sale.status || 'COMPLETED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(sale.status !== 'VOIDED') && (
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={() => setRevealId(revealId === sale._id ? null : sale._id)} 
                            className="inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-3 py-1.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            Action
                            <svg className="-mr-1 ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {revealId === sale._id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                              <button 
                                onClick={() => {
                                  setViewModalSale(sale);
                                  setRevealId(null);
                                }} 
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Details
                              </button>
                              <button 
                                onClick={() => {
                                  setVoidModalSale(sale);
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
        )}
      </div>

      {voidModalSale && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Void Transaction?</h3>
            <p className="text-sm text-gray-500 mb-4">
              This will reverse the inventory changes made by this transaction (Invoice: {voidModalSale.invoiceNumber}).
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
                <button type="button" onClick={() => setVoidModalSale(null)} className="btn-primary bg-gray-500 hover:bg-gray-600">Cancel</button>
                <button type="submit" className="btn-primary bg-red-600 hover:bg-red-700">Void Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModalSale && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sale Details</h3>
              <button onClick={() => setViewModalSale(null)} className="text-gray-400 hover:text-gray-500 text-2xl">&times;</button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong className="text-gray-900">Invoice:</strong> {viewModalSale.invoiceNumber}</p>
              <p><strong className="text-gray-900">Customer:</strong> {viewModalSale.customerName}</p>
              <p><strong className="text-gray-900">Date:</strong> {new Date(viewModalSale.saleDate).toLocaleString()}</p>
              <p><strong className="text-gray-900">Status:</strong> {viewModalSale.status || 'COMPLETED'}</p>
              {viewModalSale.voidReason && (
                <p><strong className="text-gray-900 text-red-600">Void Reason:</strong> {viewModalSale.voidReason}</p>
              )}
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {viewModalSale.items.map((item, idx) => (
                    <li key={idx}>
                      {item.quantity}x {item.product?.name || 'Unknown Product'} @ {formatCurrency(item.unitPrice)} 
                      {item.discount > 0 && ` (-${formatCurrency(item.discount)} disc)`} 
                      = {formatCurrency(item.unitPrice * item.quantity - item.discount)}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-right font-bold text-lg text-gray-900">Total: {formatCurrency(viewModalSale.total)}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewModalSale(null)} className="btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
