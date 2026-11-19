"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Eye,
    EyeOff,
    LockKeyhole,
    X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const requirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number",
      valid: /[0-9]/.test(password),
    },
    {
      label: "One special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];
  const isPasswordValid = requirements.every((item) => item.valid);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isPasswordValid || !passwordsMatch) return;
    setIsLoading(true);
    try {
      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-md">
   
        <Card className="rounded-lg border-zinc-200 shadow-sm">
          <CardContent className="pt-8 pb-8">
            {!isSubmitted ? (
              <>
                <CardHeader className="p-0 pb-6 space-y-2">
                  <CardTitle className="text-2xl font-bold">Create new password</CardTitle>
                  <CardDescription className="leading-relaxed">
                    Your new password must be different from previously used passwords.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <div className="relative">
                      <LockKeyhole
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="h-11 pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  {/* Password Requirements */}
                  <div className="rounded-lg border bg-zinc-50 p-4 space-y-3">
                    <p className="text-sm font-medium">Password requirements</p>
                    <div className="space-y-2">
                      {requirements.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-sm">
                          {item.valid ? (
                            <Check size={15} className="text-green-600" />
                          ) : (
                            <X size={15} className="text-muted-foreground" />
                          )}
                          <span className={item.valid ? "text-green-700" : "text-muted-foreground"}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <div className="relative">
                      <LockKeyhole
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="h-11 pl-10 pr-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && (
                      <p
                        className={`text-xs flex items-center gap-1 ${
                          passwordsMatch ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {passwordsMatch ? <Check size={13} /> : <X size={13} />}
                        {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                      </p>
                    )}
                  </div>
                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading || !isPasswordValid || !passwordsMatch}
                    className="w-full h-11"
                  >
                    {isLoading ? (
                      "Updating password..."
                    ) : (
                      <>
                        Reset password
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                  <CheckCircle2 size={34} />
                </div>
                <h1 className="text-2xl font-bold mb-3">Password updated!</h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-7">
                  Your password has been successfully changed. You can now sign in using your new
                  password.
                </p>
                <Button className="w-full h-11">
                  <Link href="/login">
                    Continue to login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
            {!isSubmitted && (
              <div className="mt-7 pt-6 border-t">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to sign in
                </Link>
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
