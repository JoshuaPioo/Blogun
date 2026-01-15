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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //  PREVENT PAGE RELOAD
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await action(formData);

    setLoading(false);

    if (result?.error) {
      setError(result.error); //  RED BOX SHOWS HERE
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

      {isRegister && (
        <div>
          <label className="text-sm font-medium text-black">Name</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-md border border-black px-3 py-2"
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-black">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-black px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-black">Password</label>
        <input
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded-md border border-black px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black py-3 text-white disabled:opacity-60"
      >
        {loading ? "Loading..." : isRegister ? "Sign Up" : "Login"}
      </button>
    </form>
  );
};
