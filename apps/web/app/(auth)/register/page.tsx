"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, Info, LockKeyhole, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email || !password || !confirmPassword) return;
    if (name.trim().length < 3 || /[^A-Za-z\s]/.test(name))
      return setError("Name must be at least 3 characters and contain only letters.");
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
      return setError("Invalid email address.");
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    )
      return setError(
        "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      );
    if (password !== confirmPassword) return setError("Passwords do not match.");
    const { data, error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "http://localhost:3000/",
    });
    if (error) return setError(error?.message ?? "Error Creating Account. Try Again.");
    if (!data) return setError("Error Creating Account. Try Again.");
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
  };
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Signup Card */}
        <Card className="rounded-lg  shadow-sm">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Start organizing your code snippets in one place.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="John Doe"
                    className="h-11 pl-10"
                    required
                  />
                </div>
              </div>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-11 pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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
              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
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
              </div>
              {/* show error msg */}
              {error && (
                <span className="text-red-500 text-xs flex gap-2 items-center">
                  <Info size={18} />
                  {error}
                </span>
              )}
              {/* show error msg */}
              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <Checkbox id="terms" required className="mt-0.5" />
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal leading-relaxed text-muted-foreground cursor-pointer"
                >
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </Label>
              </div>
              {/* Submit */}
              <Button type="submit" className="h-11 w-full">
                Create account
              </Button>
            </form>
            {/* Divider */}
            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                OR SIGN UP WITH
              </span>
            </div>
            {/* Google Signup */}
            <Button type="button" variant="outline" className="h-11 w-full">
              <svg viewBox="0 0 48 48" className="mr-2 h-5 w-5" aria-hidden="true">
                <path
                  fill="#FFC107"
                  d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.6c3.9-3.6 6.1-8.9 6.1-14.9z"
                />
                <path
                  fill="#34A853"
                  d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.1C9.2 39.5 16 44 24 44z"
                />
                <path
                  fill="#4A90E2"
                  d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.1H5.8a20 20 0 0 0 0 17.6z"
                />
                <path
                  fill="#EA4335"
                  d="M24 12.2c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.2 29.5 4 24 4 16 4 9.2 8.5 5.8 15.2l6.8 5.1c1.6-4.8 6.1-8.1 11.4-8.1z"
                />
              </svg>
              Continue with Google
            </Button>
            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
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
