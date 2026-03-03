import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000/api';

export default function StockOut() {
  const [spareParts, setSpareParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [form, setForm] = useState({ sparePartId: '', stockOutQuantity: '', stockOutUnitPrice: '', issuedTo: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const fetchSpareParts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching spare parts for stock out');
      
      const res = await fetch(`${API_URL}/stock/spare-parts`, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('Stock out spare parts response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error ${res.status}: Failed to fetch spare parts`);
      }
      
      const data = await res.json();
      console.log('Spare parts received:', data);
      setSpareParts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching spare parts:', err);
      setError(err.message || 'Failed to fetch spare parts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Update selected part when spare part changes
    if (name === 'sparePartId') {
      const part = spareParts.find(p => p._id === value);
      setSelectedPart(part);
      setForm(prev => ({ ...prev, stockOutUnitPrice: part ? part.unitPrice : '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPart) {
      setError('Please select a spare part');
      return;
    }

    if (parseInt(form.stockOutQuantity) > selectedPart.quantity) {
      setError(`Insufficient stock. Available: ${selectedPart.quantity}`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/stock/stock-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          sparePartId: form.sparePartId,
          stockOutQuantity: form.stockOutQuantity,
          stockOutUnitPrice: form.stockOutUnitPrice,
          issuedTo: form.issuedTo,
          notes: form.notes
        })
      });

      console.log('Stock out response status:', res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errorMessage = err.message || err.error || `HTTP Error ${res.status}`;
        console.error('Stock out error:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log('Stock out success:', result);
      setForm({ sparePartId: '', stockOutQuantity: '', stockOutUnitPrice: '', issuedTo: '', notes: '' });
      setSelectedPart(null);
      alert('Stock out recorded successfully');
      fetchSpareParts();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message);
    }
  };

  const totalCost = form.stockOutQuantity && form.stockOutUnitPrice 
    ? (parseFloat(form.stockOutQuantity) * parseFloat(form.stockOutUnitPrice)).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Record Stock Out</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Spare Part</label>
            <select name="sparePartId" value={form.sparePartId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">Select a spare part</option>
              {spareParts.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} - {p.category} (Qty: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Issue</label>
              <input
                name="stockOutQuantity"
                value={form.stockOutQuantity}
                onChange={handleChange}
                required
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {selectedPart && (
                <p className="text-xs text-gray-600 mt-1">Available: {selectedPart.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (Frw)</label>
              <input
                name="stockOutUnitPrice"
                value={form.stockOutUnitPrice}
                onChange={handleChange}
                required
                type="number"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="mb-4 p-3 bg-gray-100 rounded border border-gray-300">
            <p className="text-sm text-black">
              <strong>Total Cost:</strong> {totalCost}Frw
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Issued To</label>
            <input name="issuedTo" value={form.issuedTo} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" rows={3}></textarea>
          </div>

          <div className="flex gap-3">
            <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded font-semibold">Record Stock Out</button>
            <button type="button" onClick={() => { setForm({ sparePartId: '', stockOutQuantity: '', stockOutUnitPrice: '', issuedTo: '', notes: '' }); setSelectedPart(null); }} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">Reset</button>
          </div>
        </form>

        <div>
          <h2 className="text-xl font-semibold mb-3">Stock Inventory</h2>
          {loading ? <p>Loading...</p> : (
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="text-left px-4 py-2">Name</th>
                    <th className="text-left px-4 py-2">Category</th>
                    <th className="text-right px-4 py-2">Quantity</th>
                    <th className="text-right px-4 py-2">Unit Price</th>
                    <th className="text-right px-4 py-2">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {spareParts.map(p => (
                    <tr key={p._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{p.name}</td>
                      <td className="px-4 py-2">{p.category}</td>
                      <td className={`px-4 py-2 text-right ${p.quantity <= 5 ? 'text-red-600 font-semibold' : ''}`}>
                        {p.quantity}
                      </td>
                      <td className="px-4 py-2 text-right">{p.unitPrice.toFixed(2)}Frw</td>
                      <td className="px-4 py-2 text-right font-semibold">{p.totalPrice.toFixed(2)}Frw</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
