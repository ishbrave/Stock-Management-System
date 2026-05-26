import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ClipboardList,
  Package2,
  RefreshCcw,
  Truck,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const inputClassName =
  "w-full rounded-lg border border-sky-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100";

export default function StockIn() {
  const [spareParts, setSpareParts] = useState([]);
  const [form, setForm] = useState({
    sparePartId: "",
    stockInQuantity: "",
    stockInUnitPrice: "",
    supplier: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const selectedPart = useMemo(
    () => spareParts.find((part) => part._id === form.sparePartId) || null,
    [form.sparePartId, spareParts],
  );

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
    setSuccess("");
    setError(null);
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/stock/stock-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sparePartId: form.sparePartId,
          stockInQuantity: form.stockInQuantity,
          stockInUnitPrice: form.stockInUnitPrice,
          supplier: form.supplier,
          notes: form.notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to record stock in");
      }

      setForm({ sparePartId: "", stockInQuantity: "", stockInUnitPrice: "", supplier: "", notes: "" });
      setSuccess("Stock in recorded successfully.");
      fetchSpareParts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-shell px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="surface-card rounded-xl px-6 py-8 lg:px-8">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-500">Stock In</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-800">Record incoming stock</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Add inbound quantities, track supplier details, and update available inventory with a clean flow.
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
                <h2 className="text-2xl font-semibold text-slate-800">Stock In Form</h2>
                <p className="mt-2 text-sm text-slate-500">Capture new quantities with supplier information.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-600 text-white">
                <ArrowDownToLine size={20} />
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
                      {part.name} - {part.category}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Quantity</span>
                  <input
                    name="stockInQuantity"
                    value={form.stockInQuantity}
                    onChange={handleChange}
                    required
                    type="number"
                    min="1"
                    className={inputClassName}
                    placeholder="0"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Unit Price</span>
                  <input
                    name="stockInUnitPrice"
                    value={form.stockInUnitPrice}
                    onChange={handleChange}
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClassName}
                    placeholder="0.00"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Supplier</span>
                  <input
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    className={inputClassName}
                    placeholder="Supplier name"
                  />
                </label>

                <div className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Total Price</span>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {form.stockInQuantity && form.stockInUnitPrice
                      ? `${(Number(form.stockInQuantity) * Number(form.stockInUnitPrice)).toFixed(2)} Frw`
                      : "0.00 Frw"}
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Notes</span>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className={inputClassName}
                  rows={4}
                  placeholder="Optional receiving notes"
                />
              </label>

              <div className="flex gap-3">
                <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                  <ArrowDownToLine size={17} />
                  Record Stock In
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ sparePartId: "", stockInQuantity: "", stockInUnitPrice: "", supplier: "", notes: "" })}
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
                  <Package2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Selected Part Summary</h3>
                  <p className="text-sm text-slate-500">Quick context before you save the transaction.</p>
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
                  <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-500">Current Quantity</p>
                    <p className="mt-2 text-lg font-semibold text-slate-800">{selectedPart.quantity}</p>
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
                  Select a spare part to preview its details here.
                </div>
              )}
            </div>

            <div className="surface-card overflow-hidden rounded-xl">
              <div className="flex items-center justify-between border-b border-sky-100 px-6 py-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Available Spare Parts</h3>
                  <p className="text-sm text-slate-500">Choose from your current inventory records.</p>
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
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em]">Unit Price</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em]">Quantity</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.24em]">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-50">
                      {spareParts.map((part) => (
                        <tr key={part._id} className="transition hover:bg-sky-50/60">
                          <td className="px-6 py-4 font-medium text-slate-800">{part.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{part.category}</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">{Number(part.unitPrice).toFixed(2)} Frw</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">{part.quantity}</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">{(Number(part.unitPrice) * Number(part.quantity)).toFixed(2)} Frw</td>
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
