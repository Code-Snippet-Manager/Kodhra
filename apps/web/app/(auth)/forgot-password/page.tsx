"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        
        {/* Card */}
        <Card className="rounded-lg  shadow-sm">
          <CardContent className="pt-8 pb-8">
            {!isSubmitted ? (
              <>
                <CardHeader className="p-0 pb-6 space-y-2">
                  <CardTitle className="text-2xl font-bold">Forgot your password?</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    No worries! Enter the email address associated with your account and we&apos;ll send
                    you a link to reset your password.
                  </CardDescription>
                </CardHeader>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-11">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h1 className="text-2xl font-bold mb-3">Check your email</h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  If an account exists for
                </p>
                <p className="font-semibold text-foreground mb-3 break-all">{email}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-7">
                  you will receive instructions to reset your password. Please check your inbox and
                  spam folder.
                </p>
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try another email
                </Button>
              </div>
            )}
            {/* Back to Login */}
            <div className="mt-7 pt-6 border-t">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} />
                Back to sign in
              </Link>
            </div>
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
