"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthformProps = {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean }>;
  isRegister?: boolean;
};

export const AuthForm = ({ action, isRegister = false }: AuthformProps) => {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    if (isRegister) {
      const password = String(formData.get("password") || "");
      const confirm = String(formData.get("confirm_password") || "");

      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    const result = await action(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (isRegister) {
      router.push("/check-email");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 bg-white">
      {error && (
        <div className="rounded-md border border-red-400 bg-white p-3 text-sm text-black">
          {error}
        </div>
      )}

      {/* NAME */}
      {isRegister && (
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Name
          </label>
          <input
            name="name"
            required
            className="w-full rounded-md border border-black px-4 py-2"
            placeholder="Your name"
          />
        </div>
      )}

      {/* EMAIL */}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-black px-4 py-2"
          placeholder="you@example.com"
        />
      </div>

      {/* PASSWORD */}
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Password
        </label>

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="w-full rounded-md border border-black px-4 py-2 pr-10"
            placeholder="Enter password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-black/60"
            aria-label="Toggle password visibility"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {/* CONFIRM PASSWORD (REGISTER ONLY) */}
      {isRegister && (
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Confirm Password
          </label>

          <div className="relative">
            <input
              name="confirm_password"
              type={showConfirm ? "text" : "password"}
              required
              className="w-full rounded-md border border-black px-4 py-2 pr-10"
              placeholder="Confirm password"
            />

            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-black/60"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
      )}

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg border border-black bg-black py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Loading..." : isRegister ? "Sign Up" : "Login"}
      </button>
    </form>
  );
};
