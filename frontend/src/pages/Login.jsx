import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  KeyRound,
  LogIn,
  Package2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AuthContext } from "../context/AuthContextObject";

const inputClassName =
  "w-full rounded-lg border border-sky-100 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition duration-200 placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100";

function CurvedDivider({ reverse = false }) {
  return (
    <div className="pointer-events-none absolute inset-y-10 left-1/2 hidden w-40 -translate-x-1/2 xl:block">
      <svg
        viewBox="0 0 160 720"
        className={`h-full w-full ${reverse ? "-scale-x-100" : ""}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M78 0 L78 205 C78 335 118 382 118 510 C118 610 91 670 82 720"
          fill="none"
          stroke="rgba(96, 165, 250, 0.35)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M84 0 L84 210 C84 332 48 392 48 516 C48 607 69 664 78 720"
          fill="none"
          stroke="rgba(191, 219, 254, 0.55)"
          strokeWidth="18"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function BrandPanel() {
  return (
    <section className="auth-fade-in relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-xl border border-sky-200 bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 px-8 py-10 text-white shadow-[0_24px_64px_rgba(59,130,246,0.24)] lg:px-10">
      <div className="auth-float absolute right-8 top-8 h-24 w-24 rounded-full border border-white/20 bg-white/10 blur-[1px]" />
      <div className="absolute bottom-8 left-8 h-28 w-28 rounded-full border border-white/20 bg-white/10" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/20 bg-white text-sky-700 shadow-lg">
          <Package2 size={28} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-sky-100/90">SIMS</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[0.22em]">Stock Inventory</h1>
        </div>
      </div>

      <div className="relative z-10 max-w-md space-y-6">
        <div className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/90">
          <ShieldCheck size={14} />
          Secure Access
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-sky-100/85">Welcome Back</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight">
            Professional stock control built around clarity.
          </h2>
        </div>

        <p className="max-w-sm text-sm leading-7 text-sky-50/90">
          Manage spare parts, track movement, and review reports from one clean
          dashboard designed for focused daily work.
        </p>
      </div>
    </section>
  );
}

function LoginCard({ form, setForm, loading, localError, handleSubmit }) {
  return (
    <section className="auth-fade-in relative z-10 w-full max-w-xl rounded-xl border border-sky-100 bg-white/95 p-8 shadow-[0_24px_56px_rgba(30,58,95,0.08)] backdrop-blur xl:p-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-500">Login</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-800">Access your SIMS workspace</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
            Sign in with your existing credentials. Your backend authentication
            flow remains connected exactly as before.
          </p>
        </div>

        <div className="hidden rounded-lg border border-sky-100 bg-sky-50 p-3 text-sky-700 md:flex">
          <LogIn size={22} />
        </div>
      </div>

      {localError && (
        <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          {localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <UserRound size={16} />
            Username
          </span>
          <input
            type="text"
            placeholder="Enter your username"
            className={inputClassName}
            value={form.username}
            onChange={(event) =>
              setForm((current) => ({ ...current, username: event.target.value }))
            }
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <KeyRound size={16} />
            Password
          </span>
          <input
            type="password"
            placeholder="Enter your password"
            className={inputClassName}
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            required
          />
        </label>

        <button
          disabled={loading}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
          <ArrowRight
            size={16}
            className="transition duration-200 group-hover:translate-x-0.5"
          />
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        Do not have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-sky-700 underline decoration-sky-200 underline-offset-4 transition hover:decoration-sky-500"
        >
          Register here
        </Link>
      </p>

      <Link
        to="/forgot-password"
        className="mt-3 inline-flex text-sm font-medium text-sky-600 transition hover:text-sky-700"
      >
        Forgot your password?
      </Link>
    </section>
  );
}

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setLocalError("");

    try {
      await login(form);
      navigate("/");
    } catch (error) {
      setLocalError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(125,211,252,0.16),_transparent_28%)] bg-fixed" />
      <div className="pointer-events-none absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-[-6rem] h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />

      <CurvedDivider />

      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-8 px-4 py-8 md:px-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-16 xl:px-12">
        <LoginCard
          form={form}
          setForm={setForm}
          loading={loading}
          localError={localError}
          handleSubmit={handleSubmit}
        />
        <BrandPanel />
      </div>
    </div>
  );
};

export default Login;
