import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BadgeInfo, KeyRound, Mail } from "lucide-react";

const API_URL = "http://localhost:5000/api";
const inputClassName =
  "w-full rounded-lg border border-sky-100 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition duration-200 placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetPath, setResetPath] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setResetPath("");

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to request password reset");
      }

      setSuccess(data.message || "Password reset request submitted.");
      if (data.resetPath) {
        setResetPath(data.resetPath);
      }
    } catch (err) {
      setError(err.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="surface-card w-full max-w-lg rounded-xl p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-500">Password Recovery</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-800">Reset your password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Enter the email address linked to your account and we will generate a reset token for you.
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

        {resetPath && (
          <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50 px-4 py-4 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <BadgeInfo size={16} className="mt-0.5 text-sky-700" />
              <div>
                <p className="font-medium text-slate-800">Development reset link</p>
                <p className="mt-1">No email service is configured yet, so you can continue with the generated reset link below.</p>
                <Link
                  to={resetPath}
                  className="mt-3 inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  Continue to reset password
                </Link>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
              <Mail size={16} />
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your account email"
              className={inputClassName}
              required
            />
          </label>

          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound size={16} />
            {loading ? "Generating reset link..." : "Send reset link"}
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
