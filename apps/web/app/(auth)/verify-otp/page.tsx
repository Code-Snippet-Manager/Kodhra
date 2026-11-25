"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
export default function VerifyOtp() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpValue = otp.join("");
  const isComplete = otpValue.length === OTP_LENGTH && /^\d{6}$/.test(otpValue);
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updatedOtp = [...otp];
    updatedOtp[index] = digit;
    setOtp(updatedOtp);
    setError("");
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedOtp = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pastedOtp) return;
    const updatedOtp = Array(OTP_LENGTH).fill("");
    pastedOtp.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });
    setOtp(updatedOtp);
    setError("");
    const nextIndex = Math.min(pastedOtp.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };
  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isComplete) return;
    setIsLoading(true);
    setError("");
    try {
      // TODO: Connect your OTP verification API.
      //
      // const response = await fetch("/api/auth/verify-otp", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email,
      //     otp: otpValue,
      //   }),
      // });
      //
      // if (!response.ok) {
      //   throw new Error("Invalid or expired OTP");
      // }
      setIsVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError("");
    try {
      // TODO: Connect your resend OTP API.
      //
      // await fetch("/api/auth/resend-otp", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // });
      setOtp(Array(OTP_LENGTH).fill(""));
      setCountdown(RESEND_SECONDS);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Unable to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };
  return (
    <main className="min-h-screen flex items-center justify-center  px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="rounded-lg  shadow-sm">
          <CardContent className="pt-8 pb-8">
            {!isVerified ? (
              <>
                <CardHeader className="p-0 pb-7 space-y-2">
                  <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                  <CardDescription className="leading-relaxed">
                    We&apos;ve sent a 6-digit verification code to your registered email address.
                    Enter the code below to continue.
                  </CardDescription>
                </CardHeader>
                {/* OTP Form */}
                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Verification code</span>
                      <span className="text-xs text-muted-foreground">6 digits</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2 sm:gap-3">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          autoComplete={index === 0 ? "one-time-code" : "off"}
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleChange(e.target.value, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onPaste={handlePaste}
                          className="h-12 sm:h-14 text-center text-xl font-semibold rounded-xl"
                          aria-label={`OTP digit ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Error */}
                  {error && (
                    <p role="alert" className="text-sm text-red-500">
                      {error}
                    </p>
                  )}
                  {/* Verify Button */}
                  <Button type="submit" className="w-full h-11" disabled={!isComplete || isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify email
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
                {/* Resend OTP */}
                <div className="mt-7 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
                  <Button
                    type="button"
                    variant="link"
                    disabled={countdown > 0 || isResending}
                    onClick={handleResend}
                    className="h-auto p-0"
                  >
                    {isResending
                      ? "Sending..."
                      : countdown > 0
                        ? `Resend code in ${countdown}s`
                        : "Resend verification code"}
                  </Button>
                </div>
                {/* Back */}
                <div className="mt-7 pt-6 border-t">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back to sign in
                  </Link>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                  <CheckCircle2 size={34} />
                </div>
                <h1 className="text-2xl font-bold mb-3">Email verified!</h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-7">
                  Your email address has been successfully verified. You can now continue to your
                  Kodhra account.
                </p>
                <Button className="w-full h-11">
                  <Link href="/login">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kodhra. All rights reserved.
        </p>
      </div>
    </main>
  );
}
