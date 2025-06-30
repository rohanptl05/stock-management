"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ResetPasswordOTP, verifyOtpAndResetPassword } from "@/app/api/actions/useractions"; // This should trigger sending OTP to email
import { toast } from "sonner";
import Link from "next/link";


const Page = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/dashboard");
    }
  }, [sessionStatus, router]);

  const isValidEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

const handleOtpSend = async (e) => {
  e.preventDefault();
  setError("");

  if (!isValidEmail(email)) {
    const msg = "Invalid email format.";
    setError(msg);
    toast.error(msg);
    return;
  }

  try {
    setIsSubmitting(true);
    const res = await ResetPasswordOTP(email);

    if (res.success) {
      toast.success(res.message || "OTP sent to your email.");
      setShowPasswordForm(true);
    } else {
      const msg = res.message || "Failed to send OTP.";
      setError(msg);
      toast.error(msg);
    }
  } catch (err) {
    console.error(err);
    toast.error("Unexpected error occurred while sending OTP.");
  } finally {
    setIsSubmitting(false);
  }
};


  const handleResetPassword = async (e) => {
  e.preventDefault();
  setError("");

  if (!email || !otp || !newPass || !confirmPass) {
    const msg = "All fields are required.";
    setError(msg);
    toast.warning(msg);
    return;
  }

  if (newPass !== confirmPass) {
    const msg = "Passwords do not match.";
    setError(msg);
    toast.warning(msg);
    return;
  }

  if (newPass.length < 8) {
    const msg = "Password must be at least 8 characters.";
    setError(msg);
    toast.warning(msg);
    return;
  }

  try {
    setIsSubmitting(true);
    const res = await verifyOtpAndResetPassword(email, otp, newPass);

    if (res.status === 200) {
      toast.success(res.message || "Password reset successfully!");
      router.push("/");
    } else {
      const msg = res.message || "Invalid OTP or expired.";
      setError(msg);
      toast.error(msg);
    }
  } catch (err) {
    console.error(err);
    toast.error("Error resetting password.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="bg-gradient-to-tr from-red-600 to-green-400 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-4xl text-center font-semibold mb-8">Forgot Password</h1>

        {/* Step 1: Email input */}
        {!showPasswordForm && (
          <form onSubmit={handleOtpSend}>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 text-black rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-400"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP and new password input */}
        {showPasswordForm && (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 text-black rounded px-3 py-2 focus:outline-none focus:border-blue-400"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full border border-gray-300 text-black rounded px-3 py-2 focus:outline-none focus:border-blue-400"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full border border-gray-300 text-black rounded px-3 py-2 focus:outline-none focus:border-blue-400"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Error display */}
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        <div className="text-center text-gray-100 mt-6">- OR -</div>
        <Link
          className="block text-center text-white underline mt-2"
          href="/"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default Page;
