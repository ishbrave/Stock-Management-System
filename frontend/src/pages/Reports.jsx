import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000/api';

export default function Reports() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching full stock report');

      const res = await fetch(`${API_URL}/stock/reports`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Reports response status:', res.status);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP Error ${res.status}: failed to load report`);
      }

      const data = await res.json();
      console.log('Report data received:', data);
      setRecords(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const totalIn = records.filter(r => r.type === 'IN').length;
  const totalOut = records.filter(r => r.type === 'OUT').length;
  const totalValueOut = records
    .filter(r => r.type === 'OUT' && r.totalPrice)
    .reduce((sum, r) => sum + r.totalPrice, 0);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Stock Report</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-xl font-semibold">{records.length}</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-600">Stock In Entries</p>
            <p className="text-xl font-semibold">{totalIn}</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-600">Stock Out Entries</p>
            <p className="text-xl font-semibold">{totalOut}</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-600">Total Out Value</p>
            <p className="text-xl font-semibold">{totalValueOut.toFixed(2)} Frw</p>
          </div>
        </div>

        {loading ? (
          <p>Loading report...</p>
        ) : records.length === 0 ? (
          <p className="text-gray-600">No transactions recorded yet.</p>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Spare Part</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Unit/Price/Supplier</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-left">Issued To / Supplier</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                  <th className="px-4 py-2 text-left">User</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => {
                  const date = new Date(r.date).toLocaleString();
                  const name = r.sparePart?.name || '-';
                  const category = r.sparePart?.category || '-';
                  const unitOrInfo = r.type === 'OUT'
                    ? `${r.unitPrice?.toFixed(2)}Frw` // unit price
                    : r.supplier || '-';
                  const total = r.type === 'OUT' && r.totalPrice ? `${r.totalPrice.toFixed(2)}Frw` : '-';
                  const issuedOrSupplier = r.type === 'OUT' ? (r.issuedTo || '-') : (r.supplier || '-');
                  const user = r.createdBy?.username || '-';

                  return (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{date}</td>
                      <td className="px-4 py-2 text-sm font-medium">{r.type}</td>
                      <td className="px-4 py-2 text-sm">{name}</td>
                      <td className="px-4 py-2 text-sm">{category}</td>
                      <td className="px-4 py-2 text-sm text-right">{r.quantity}</td>
                      <td className="px-4 py-2 text-sm text-right">{unitOrInfo}</td>
                      <td className="px-4 py-2 text-sm text-right">{total}</td>
                      <td className="px-4 py-2 text-sm">{issuedOrSupplier}</td>
                      <td className="px-4 py-2 text-sm">{r.notes || '-'}</td>
                      <td className="px-4 py-2 text-sm">{user}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
