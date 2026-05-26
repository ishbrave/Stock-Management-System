import { useContext, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Boxes,
  CircleDollarSign,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { AuthContext } from "../context/AuthContextObject";

const API_URL = "http://localhost:5000/api";
const chartColors = ["#38bdf8", "#60a5fa", "#93c5fd", "#dbeafe"];

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} Frw`;

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="surface-card rounded-xl p-5 transition duration-300 hover:-translate-y-1">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-600 text-white">
          <Icon size={22} />
        </div>
        <span className="text-xs uppercase tracking-[0.24em] text-sky-500">Overview</span>
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-800">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{hint}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalSpareParts: 0,
    totalStockValue: 0,
    stockInCount: 0,
    stockOutCount: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/stock/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP Error ${response.status}: Failed to fetch stats`);
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch statistics");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const chartData = useMemo(
    () => [
      { name: "Stock In", value: stats.stockInCount },
      { name: "Stock Out", value: stats.stockOutCount },
      { name: "Low Stock", value: stats.lowStockItems },
      {
        name: "Active Parts",
        value: Math.max(stats.totalSpareParts - stats.lowStockItems, 0),
      },
    ].filter((item) => item.value > 0),
    [stats],
  );

  if (loading) {
    return (
      <div className="page-shell px-4 py-8 lg:px-8">
        <div className="surface-card mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Loading Dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="surface-card overflow-hidden rounded-xl">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-500">Dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-800">
                Welcome back, {user?.username}.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
                Here is a clean snapshot of your stock movement, inventory value,
                and parts that need attention.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-sky-200 bg-sky-600 px-4 py-4 text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-50/85">Inventory Value</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(stats.totalStockValue)}</p>
                </div>
                <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-500">Transactions</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">
                    {stats.stockInCount + stats.stockOutCount}
                  </p>
                </div>
                <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-500">Attention Needed</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">{stats.lowStockItems}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/80 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-sky-500">Visual Overview</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-800">Stock Activity Mix</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-600 text-white">
                  <BarChart3 size={20} />
                </div>
              </div>

              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={86}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-sky-200 text-sm text-slate-500">
                    No dashboard data yet.
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {chartData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3 rounded-lg bg-white px-3 py-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="text-sm text-slate-500">{item.name}</span>
                    <span className="ml-auto text-sm font-semibold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">
            {error}
          </div>
        )}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={Boxes}
            label="Total Spare Parts"
            value={stats.totalSpareParts.toLocaleString()}
            hint="All spare part records currently stored in the system."
          />
          <StatCard
            icon={CircleDollarSign}
            label="Total Stock Value"
            value={formatCurrency(stats.totalStockValue)}
            hint="Live valuation based on quantity and unit price across parts."
          />
          <StatCard
            icon={ArrowDownToLine}
            label="Stock In Records"
            value={stats.stockInCount.toLocaleString()}
            hint="Inbound transactions recorded into your inventory."
          />
          <StatCard
            icon={ArrowUpFromLine}
            label="Stock Out Records"
            value={stats.stockOutCount.toLocaleString()}
            hint="Outbound transactions issued from available stock."
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock Items"
            value={stats.lowStockItems.toLocaleString()}
            hint="Parts currently at or below the low-stock threshold."
          />
        </section>

      </div>
    </div>
  );
}
