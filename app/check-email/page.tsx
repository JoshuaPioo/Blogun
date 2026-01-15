export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const sp = await searchParams; // ✅ unwrap
  const email = sp.email ?? "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-lg border border-black bg-white p-8 text-center space-y-3">
        <h1 className="text-2xl font-semibold text-black">Confirm your email</h1>
        <p className="text-sm text-black">
          We sent a confirmation link to{" "}
          <span className="font-medium">{email}</span>.
        </p>
        <p className="text-sm text-black">
          Please open your Gmail and click the link to activate your account.
        </p>
        <p className="text-xs text-black/70">
          If you don’t see it, check Spam/Promotions.
        </p>
      </div>
    </div>
  );
}
