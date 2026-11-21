"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, Info, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaGithub, FaGooglePlusG } from "react-icons/fa";
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) return;
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });
    if (error) return setError(error?.message ?? "Error Logging In. Try Again.");
    if (!data) return setError("Error Logging In. Try Again.");
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/dashboard";
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <Card className="border-zinc-200 shadow-sm rounded-lg">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
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
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-11 pl-10 pr-10"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && (
                <span className="flex items-center gap-2 text-xs text-red-500">
                  <Info size={18} className="mr-2" />
                  <span>{error}</span>
                </span>
              )}
              {/* Login Button */}
              <Button type="submit" className="w-full h-11">
                Sign in
              </Button>
            </form>
            {/* Divider */}
            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>
            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 mb-2"
              onClick={async () =>
                await authClient.signIn.social({
                  provider: "google",
                  callbackURL: "http://localhost:3000/",
                })
              }
            >
              <FaGooglePlusG size={20} className="mr-2" color="" />
              Continue with Google
            </Button>
            <Button
              variant="outline"
              type="button"
              className="w-full h-11"
              onClick={async () => {
                try {
                  await authClient.signIn.social({
                    provider: "github",
                    callbackURL: "http://localhost:3000/",
                  });
                } catch (error) {
                  console.error("GitHub login failed:", error);
                }
              }}
            >
              <FaGithub size={20} className="mr-2" color="" />
              Continue with GitHub
            </Button>
            {/* Register */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Create account
              </Link>
            </p>
          </CardContent>
        </Card>
        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © Kodhra. All rights reserved.
        </p>
      </div>
    </main>
  );
}
