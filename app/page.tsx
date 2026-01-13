import Link from "next/link";
import { signIn } from "./actions/auth";
import { AuthForm } from "./components/AuthForm";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-black">Sign In</h1>
          <p className="mt-2 text-sm text-black">
            Welcome back! Please sign in to your account
          </p>
        </div>

        <div className="rounded-lg border border-black bg-white p-8">
          <AuthForm action={signIn} />

          <div className="mt-6 text-center text-sm text-black">
            <span>Don't have an account? </span>
            <Link href="/register" className="font-medium underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
