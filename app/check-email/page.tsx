"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckEmailPage() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-lg border border-black bg-white p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-black">
          Success ✅
        </h1>

        <p className="text-sm text-black">
          Your account was created successfully.
        </p>

        <p className="text-xs text-black/70">
          Redirecting to dashboard {" "}
          <span className="font-medium">{seconds}</span> seconds…
        </p>
      </div>
    </div>
  );
}
