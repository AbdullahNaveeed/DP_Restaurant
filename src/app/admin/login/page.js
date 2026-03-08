"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "same-origin",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      toast.success("Welcome back");
      router.push("/admin");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-12 min-[375px]:px-5 min-[480px]:px-6 md:px-8">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="rounded-2xl border border-border-color bg-bg-card p-6 sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="mb-2 font-serif text-2xl font-bold gold-text sm:text-3xl">
              Ghani Shinwari
            </h1>
            <p className="text-sm text-text-muted">Admin Dashboard Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@ghanishinwari.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-text-secondary">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="********"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 w-full rounded-lg"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg-primary border-t-transparent" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-bg-elevated p-3 text-xs text-text-muted sm:p-4 sm:text-sm">
            <p className="mb-1 font-medium text-text-secondary">Demo Credentials</p>
            <p>Email: admin@ghanishinwari.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
