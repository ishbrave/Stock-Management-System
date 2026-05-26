import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Package2,
  PanelsTopLeft,
  UserCircle2,
  X,
} from "lucide-react";
import { AuthContext } from "../context/AuthContextObject";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Spare Parts", path: "/spare-parts", icon: Package2 },
  { label: "Stock In", path: "/stock-in", icon: ArrowDownToLine },
  { label: "Stock Out", path: "/stock-out", icon: ArrowUpFromLine },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen((current) => !current)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-lg border border-sky-100 bg-white text-slate-700 shadow-lg transition hover:bg-sky-50 hover:text-sky-700 lg:hidden"
        aria-label="Toggle navigation"
      >
        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div
        className={`fixed inset-0 z-30 bg-slate-900/25 transition duration-300 lg:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sky-800/20 bg-gradient-to-b from-sky-700 via-sky-700 to-sky-800 text-white shadow-2xl transition-all duration-300 lg:sticky lg:top-0 lg:self-start ${
          isSidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:w-24 lg:translate-x-0"
        } lg:translate-x-0`}
      >
        <div className="border-b border-white/15 px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-sky-700">
              <PanelsTopLeft size={24} />
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.35em] text-sky-100/75">SIMS</p>
                <h1 className="mt-1 truncate text-lg font-semibold">Stock System</h1>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-white text-sky-800 shadow-lg"
                    : "text-sky-100/80 hover:bg-white/10 hover:text-white"
                } ${!isSidebarOpen ? "lg:justify-center lg:px-0" : ""}`}
              >
                <Icon size={19} className="shrink-0" />
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-4 py-5">
          <div
            className={`mb-4 flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 p-3 ${
              !isSidebarOpen ? "lg:justify-center" : ""
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-sky-700">
              <UserCircle2 size={22} />
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.28em] text-sky-100/70">Signed In</p>
                <p className="truncate text-sm font-semibold text-white">
                  {user?.username || "User"}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsSidebarOpen((current) => !current)}
              className="hidden flex-1 items-center justify-center rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-sky-100/80 transition hover:bg-white/15 hover:text-white lg:flex"
              aria-label="Collapse sidebar"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-sky-800 ${
                isSidebarOpen ? "flex-1" : "flex-1 lg:px-0"
              }`}
            >
              <LogOut size={18} />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
