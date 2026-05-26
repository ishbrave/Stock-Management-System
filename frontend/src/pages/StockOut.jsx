import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpFromLine,
  BadgeDollarSign,
  ClipboardList,
  RefreshCcw,
  Send,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const inputClassName =
  "w-full rounded-lg border border-sky-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100";

export default function StockOut() {
  const [spareParts, setSpareParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [form, setForm] = useState({
    sparePartId: "",
    stockOutQuantity: "",
    stockOutUnitPrice: "",
    issuedTo: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const totalCost = useMemo(() => {
    if (!form.stockOutQuantity || !form.stockOutUnitPrice) {
      return "0.00";
    }

    return (Number(form.stockOutQuantity) * Number(form.stockOutUnitPrice)).toFixed(2);
  }, [form.stockOutQuantity, form.stockOutUnitPrice]);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSuccess("");
    setError(null);

    setForm((current) => ({ ...current, [name]: value }));

    if (name === "sparePartId") {
      const part = spareParts.find((item) => item._id === value) || null;
      setSelectedPart(part);
      setForm((current) => ({
        ...current,
        sparePartId: value,
        stockOutUnitPrice: part ? part.unitPrice : "",
      }));
    }
  };

  const resetForm = () => {
    setForm({
      sparePartId: "",
      stockOutQuantity: "",
      stockOutUnitPrice: "",
      issuedTo: "",
      notes: "",
    });
    setSelectedPart(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");

    if (!selectedPart) {
      setError("Please select a spare part");
      return;
    }

    if (Number(form.stockOutQuantity) > Number(selectedPart.quantity)) {
      setError(`Insufficient stock. Available: ${selectedPart.quantity}`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/stock/stock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sparePartId: form.sparePartId,
          stockOutQuantity: form.stockOutQuantity,
          stockOutUnitPrice: form.stockOutUnitPrice,
          issuedTo: form.issuedTo,
          notes: form.notes,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || err.error || `HTTP Error ${response.status}`);
      }

      resetForm();
      setSuccess("Stock out recorded successfully.");
      fetchSpareParts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-shell px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="surface-card rounded-xl px-6 py-8 lg:px-8">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-500">Stock Out</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-800">Issue parts with clarity</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Record outgoing parts, track recipients, and keep your inventory levels consistent.
          </p>
        </section>

        {(error || success) && (
          <div
            className={`px-5 py-4 text-sm ${
              error ? "rounded-lg border border-sky-200 bg-sky-50 text-sky-800" : "rounded-lg border border-sky-100 bg-white text-slate-700"
            }`}
          >
            {error || success}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-card rounded-xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-800">Stock Out Form</h2>
                <p className="mt-2 text-sm text-slate-500">Issue stock and keep outbound movement well documented.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-600 text-white">
                <ArrowUpFromLine size={20} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Spare Part</span>
                <select
                  name="sparePartId"
                  value={form.sparePartId}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                >
                  <option value="">Select a spare part</option>
                  {spareParts.map((part) => (
                    <option key={part._id} value={part._id}>
                      {part.name} - {part.category} (Qty: {part.quantity})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Quantity to Issue</span>
                  <input
                    name="stockOutQuantity"
                    value={form.stockOutQuantity}
                    onChange={handleChange}
                    required
                    type="number"
                    min="1"
                    className={inputClassName}
                    placeholder="0"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Unit Price (Frw)</span>
                  <input
                    name="stockOutUnitPrice"
                    value={form.stockOutUnitPrice}
                    onChange={handleChange}
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputClassName}
                    placeholder="0.00"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white">
                    <BadgeDollarSign size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-500">Total Cost</p>
                    <p className="mt-1 text-xl font-semibold text-slate-800">{totalCost} Frw</p>
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Issued To</span>
                <input
                  name="issuedTo"
                  value={form.issuedTo}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Department or person"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Notes</span>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className={inputClassName}
                  rows={4}
                  placeholder="Optional issue notes"
                />
              </label>

              <div className="flex gap-3">
                <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                  <Send size={17} />
                  Record Stock Out
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                >
                  <RefreshCcw size={17} />
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="surface-card rounded-xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Availability Snapshot</h3>
                  <p className="text-sm text-slate-500">Review the selected item before issuing it.</p>
                </div>
              </div>

              {selectedPart ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-500">Part</p>
                    <p className="mt-2 text-lg font-semibold text-slate-800">{selectedPart.name}</p>
                  </div>
                  <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-500">Category</p>
                    <p className="mt-2 text-lg font-semibold text-slate-800">{selectedPart.category}</p>
                  </div>
                  <div className="rounded-lg border border-sky-200 bg-sky-600 p-4 text-white">
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-50/85">Available Quantity</p>
                    <p className="mt-2 text-lg font-semibold">{selectedPart.quantity}</p>
                  </div>
                  <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-500">Unit Price</p>
                    <p className="mt-2 text-lg font-semibold text-slate-800">
                      {Number(selectedPart.unitPrice).toFixed(2)} Frw
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-sky-200 px-4 py-10 text-center text-sm text-slate-500">
                  Select a spare part to see its stock availability.
                </div>
              )}
            </div>

            <div className="surface-card overflow-hidden rounded-xl">
              <div className="flex items-center justify-between border-b border-sky-100 px-6 py-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Inventory Reference</h3>
                  <p className="text-sm text-slate-500">Current quantities available for issue.</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-600 text-white">
                  <ClipboardList size={19} />
                </div>
              </div>

              {loading ? (
                <div className="flex h-56 items-center justify-center text-sm uppercase tracking-[0.25em] text-gray-500">
                  Loading inventory
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-sky-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em]">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em]">Category</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em]">Quantity</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em]">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-50">
                      {spareParts.map((part) => (
                        <tr key={part._id} className="transition hover:bg-sky-50/60">
                          <td className="px-6 py-4 font-medium text-slate-800">{part.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{part.category}</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">{part.quantity}</td>
                          <td className="px-6 py-4 text-right text-sm text-slate-500">
                            {Number(part.totalPrice).toFixed(2)} Frw
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
