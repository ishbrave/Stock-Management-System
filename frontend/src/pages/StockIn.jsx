import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000/api';

export default function StockIn() {
  const [spareParts, setSpareParts] = useState([]);
  const [form, setForm] = useState({ sparePartId: '', stockInQuantity: '', supplier: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const fetchSpareParts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching spare parts for stock in');
      
      const res = await fetch(`${API_URL}/stock/spare-parts`, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('Stock in spare parts response status:', res.status);
      
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

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/stock/stock-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sparePartId: form.sparePartId, stockInQuantity: form.stockInQuantity, supplier: form.supplier, notes: form.notes })
      });
      if (!res.ok) throw new Error('Failed to record stock in');
      setForm({ sparePartId: '', stockInQuantity: '', supplier: '', notes: '' });
      alert('Stock in recorded');
      fetchSpareParts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Record Stock In</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Spare Part</label>
            <select name="sparePartId" value={form.sparePartId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">Select a spare part</option>
              {spareParts.map(p => <option key={p._id} value={p._id}>{p.name} - {p.category}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input name="stockInQuantity" value={form.stockInQuantity} onChange={handleChange} required type="number" min="1" className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <input name="supplier" value={form.supplier} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" rows={3}></textarea>
          </div>

          <div className="flex gap-3">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Record Stock In</button>
            <button type="button" onClick={() => setForm({ sparePartId: '', stockInQuantity: '', supplier: '', notes: '' })} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">Reset</button>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Recent Spare Parts</h2>
          {loading ? <p>Loading...</p> : (
            <div className="bg-white rounded shadow">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2">Name</th>
                    <th className="text-left px-4 py-2">Category</th>
                    <th className="text-right px-4 py-2">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {spareParts.map(p => (
                    <tr key={p._id} className="border-t">
                      <td className="px-4 py-2">{p.name}</td>
                      <td className="px-4 py-2">{p.category}</td>
                      <td className="px-4 py-2 text-right">{p.quantity}</td>
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
