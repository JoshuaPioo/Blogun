import Link from "next/link";
import { signUp } from "../actions/auth";
import { AuthForm } from "../components/AuthForm";

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-black">Sign Up</h1>
          <p className="mt-2 text-sm text-black">
            Create your account to get started
          </p>
        </div>

        <div className="rounded-lg border border-black bg-white p-8">
          <AuthForm action={signUp} isRegister />

          <div className="mt-6 text-center text-sm text-black">
            <span>Already have an account? </span>
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
