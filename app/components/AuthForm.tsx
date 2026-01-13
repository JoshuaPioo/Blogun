"use client"

import { FormEvent, useState, useTransition } from "react";

type AuthformProps = {
  action: (formData: FormData) => Promise<{error?: string } | void>;
    isRegister?: boolean;
};

export const AuthForm = ({action, isRegister = false } :AuthformProps ) => {

    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await action(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    }
     return (
  <form action={handleSubmit} className="w-full space-y-4 bg-white">
    {error && (
      <div className="rounded-md border border-red bg-white text-sm text-black p-3">
        {error}
      </div>
    )}

    {/* Name – show ONLY on register */}
    {isRegister && (
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-black mb-1"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full rounded-md border border-black bg-white px-4 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
          placeholder="Enter your name"
          autoComplete="off"
        />
      </div>
    )}

    {/* Email */}
    <div>
      <label
        htmlFor="email"
        className="block text-sm font-medium text-black mb-1"
      >
        Email
      </label>
      <input
        type="email"
        id="email"
        name="email"
        required
        className="w-full rounded-md border border-black bg-white px-4 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
        placeholder="Enter your email"
        autoComplete="email"
      />
    </div>

    {/* Password */}
    <div>
      <label
        htmlFor="password"
        className="block text-sm font-medium text-black mb-1"
      >
        Password
      </label>
      <input
        type="password"
        id="password"
        name="password"
        required
        className="w-full rounded-md border border-black bg-white px-4 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
        placeholder="Enter your password"
        autoComplete="current-password"
      />
    </div>

    {/* Submit */}
    <button
        type="submit"
        disabled={isPending}
        className="
            w-full rounded-lg border border-black
            bg-black px-4 py-3 text-sm font-medium text-white
            transition-all duration-200 ease-in-out
            hover:bg-white hover:text-black
            hover:shadow-md
            active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
            disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
        {isPending ? "Loading..." : isRegister ? "Sign Up" : "Login"}
        </button>

  </form>
);


};