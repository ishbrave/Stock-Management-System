import { useEffect, useMemo, useState } from "react";
import {
  Box,
  PackagePlus,
  PencilLine,
  Shapes,
  Trash2,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const inputClassName =
  "w-full rounded-lg border border-sky-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100";

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="surface-card rounded-xl p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-600 text-white">
        <Icon size={20} />
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default function SpareParts() {
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unitPrice: "",
    description: "",
  });

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const summary = useMemo(() => {
    const categories = new Set(spareParts.map((part) => part.category)).size;

    return { categories };
  }, [spareParts]);

  const fetchSpareParts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/stock/spare-parts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error ${response.status}: Failed to fetch spare parts`);
      }

      const data = await response.json();
      setSpareParts(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch spare parts");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setError(null);
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/stock/spare-parts/${editingId}`
        : `${API_URL}/stock/spare-parts`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP Error ${response.status}`);
      }

      setFormData({ name: "", category: "", quantity: "", unitPrice: "", description: "" });
      setShowModal(false);
      setEditingId(null);
      fetchSpareParts();
    } catch (err) {
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
      description: sparePart.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this spare part?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/stock/spare-parts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete spare part");
      }

      fetchSpareParts();
    } catch (err) {
      setError(err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: "", category: "", quantity: "", unitPrice: "", description: "" });
  };

  return (
    <div className="page-shell px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="surface-card rounded-xl px-6 py-8 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-500">Inventory</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-800">
                Spare Parts Management
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Keep your inventory clean, traceable, and ready for daily stock movement.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              <PackagePlus size={18} />
              Add Spare Part
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={Box} label="Total Records" value={spareParts.length.toLocaleString()} />
          <SummaryCard icon={Shapes} label="Categories" value={summary.categories.toLocaleString()} />
        </section>

        {error && (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">
            {error}
          </div>
        )}

        <section className="surface-card overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-sky-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Inventory Table</h2>
              <p className="mt-1 text-sm text-slate-500">
                View category labels and manage your spare parts.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm uppercase tracking-[0.25em] text-gray-500">
              Loading spare parts
            </div>
          ) : spareParts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700">
                <Box size={28} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-800">No spare parts yet</h3>
              <p className="mt-2 text-sm text-slate-500">Add your first inventory item to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-sky-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em]">Part</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em]">Category</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50">
                  {spareParts.map((part) => (
                    <tr key={part._id} className="transition hover:bg-sky-50/60">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-800">{part.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{part.description || "No description"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="rounded-md border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                          {part.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(part)}
                            className="inline-flex items-center gap-2 rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
                          >
                            <PencilLine size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(part._id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4">
          <div className="surface-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl">
            <div className="flex items-center justify-between border-b border-sky-100 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-500">
                  {editingId ? "Update" : "Create"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-800">
                  {editingId ? "Edit Spare Part" : "Add Spare Part"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg border border-sky-100 bg-sky-50 p-2 text-sky-700 transition hover:bg-sky-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 px-6 py-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Part Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className={inputClassName}
                  placeholder="Battery Pack"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Category</span>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                  className={inputClassName}
                  placeholder="Electronics"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Quantity</span>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  required
                  min="0"
                  className={inputClassName}
                  placeholder="0"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Unit Price (Frw)</span>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleFormChange}
                  required
                  step="0.01"
                  min="0"
                  className={inputClassName}
                  placeholder="0.00"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-600">Description</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className={inputClassName}
                  placeholder="Optional notes about this part"
                  rows="4"
                />
              </label>

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  {editingId ? "Update Part" : "Save Part"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
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
