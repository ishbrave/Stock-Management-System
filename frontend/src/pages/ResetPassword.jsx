import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

const API_URL = "http://localhost:5000/api";
const inputClassName =
  "w-full rounded-lg border border-sky-100 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition duration-200 placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100";

export default function ResetPassword() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess(data.message || "Password reset successfully.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="surface-card w-full max-w-lg rounded-xl p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-500">Reset Password</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-800">Create a new password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Choose a new password for your account. Once it is saved, you can sign in again normally.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-lg border border-sky-100 bg-white px-4 py-3 text-sm text-slate-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
              <KeyRound size={16} />
              New password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a new password"
              className={inputClassName}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
              <ShieldCheck size={16} />
              Confirm password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm the new password"
              className={inputClassName}
              required
            />
          </label>

          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck size={16} />
            {loading ? "Saving new password..." : "Reset password"}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 underline decoration-sky-200 underline-offset-4 transition hover:decoration-sky-500"
        >
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </div>
    </div>
  );
}
