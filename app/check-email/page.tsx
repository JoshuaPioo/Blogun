"use client";

export default function CheckEmailPage() {
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
          Please check your email and verify your account to continue.
        </p>
      </div>
    </div>
  );
}
