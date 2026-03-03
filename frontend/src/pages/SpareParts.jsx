import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000/api';

export default function SpareParts() {
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unitPrice: '',
    description: '',
  });

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const fetchSpareParts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching spare parts with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_URL}/stock/spare-parts`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Spare parts response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error ${response.status}: Failed to fetch spare parts`);
      }
      
      const data = await response.json();
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setError(null); // Clear error when user starts typing
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${API_URL}/stock/spare-parts/${editingId}`
        : `${API_URL}/stock/spare-parts`;

      console.log('Submitting form data:', formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP Error ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Success:', data);
      setFormData({ name: '', category: '', quantity: '', unitPrice: '', description: '' });
      setShowModal(false);
      setEditingId(null);
      fetchSpareParts();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message);
    }
  };

  const handleEdit = (sparePart) => {
    setEditingId(sparePart._id);
    setFormData({
      name: sparePart.name,
      category: sparePart.category,
      quantity: sparePart.quantity,
      unitPrice: sparePart.unitPrice,
      description: sparePart.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this spare part?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/stock/spare-parts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete spare part');
      fetchSpareParts();
    } catch (err) {
      setError(err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', category: '', quantity: '', unitPrice: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black">Spare Parts Management</h1>
            <p className="text-gray-600 mt-2">Manage your inventory of spare parts</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
          >
            + Add Spare Part
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading spare parts...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {spareParts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">No spare parts found. Add one to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">Quantity</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">Unit Price</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">Total Price</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {spareParts.map((part) => (
                      <tr key={part._id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{part.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                            {part.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className={part.quantity <= 5 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                            {part.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                          {part.unitPrice.toFixed(2)}Frw
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                          {part.totalPrice.toFixed(2)}Frw
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <button
                            onClick={() => handleEdit(part)}
                            className="text-blue-600 hover:text-blue-800 font-semibold mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(part._id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-black text-white px-6 py-4">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Edit Spare Part' : 'Add New Spare Part'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Battery Pack"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Electronics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (Frw) *</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleFormChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-lg transition duration-200"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
