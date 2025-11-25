// src/app/(marketing)/forgot-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [canResendAt, setCanResendAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const router = useRouter();

  // Countdown timer for resend
  useEffect(() => {
    if (!canResendAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((canResendAt - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [canResendAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setCodeSent(true);
        setMaskedEmail(data.email);
        setCanResendAt(new Date(data.canResendAt).getTime());
        toast.success("Reset code sent!", {
          description: "Check your email for the 6-digit reset code.",
        });

        // Redirect to verify code page after 2 seconds
        setTimeout(() => {
          router.push(`/verify-reset-code?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        toast.error("Error", {
          description: data.error || "Failed to send reset code.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeRemaining > 0) {
      toast.error("Please wait", {
        description: `You can request a new code in ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setCanResendAt(new Date(data.canResendAt).getTime());
        toast.success("New code sent!", {
          description: "Check your email for a new reset code.",
        });
      } else {
        toast.error("Error", {
          description: data.error || "Failed to resend code.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Reset your password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we&apos;ll send you a code to reset your
            password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!codeSent ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending code...
                  </>
                ) : (
                  "Send reset code"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  ✓ Code sent successfully!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Check your email at {maskedEmail}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting to verification page...
              </p>
            </div>
          )}

          <div className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
