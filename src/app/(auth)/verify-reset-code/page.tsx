// src/app/(auth)/verify-reset-code/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// Main content component that uses useSearchParams
function VerifyResetCodeContent() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [canResendAt, setCanResendAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      toast.error("Error", {
        description: "Invalid access. Please start from forgot password.",
      });
      router.push("/forgot-password");
      return;
    }
    setEmail(decodeURIComponent(emailParam));
    // Set initial 5-minute timer
    setCanResendAt(Date.now() + 5 * 60 * 1000);
  }, [searchParams, router]);

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

    if (code.length !== 6) {
      toast.error("Invalid code", {
        description: "Please enter all 6 digits.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Code verified!", {
          description: "Proceeding to set new password...",
        });

        // Store email and code in sessionStorage for next step
        sessionStorage.setItem("resetEmail", email);
        sessionStorage.setItem("resetCode", code);

        setTimeout(() => {
          router.push("/reset-password");
        }, 1500);
      } else {
        toast.error("Invalid code", {
          description: data.error || "Please try again.",
        });
        setCode("");
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Verify reset code
          </CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code we sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="code" className="text-center block">
                Reset Code
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Sent to {email}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                "Verify code"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground mb-2">
              Didn&apos;t receive the code?
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                if (timeRemaining > 0) {
                  toast.error("Please wait", {
                    description: `You can request a new code in ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`,
                  });
                  return;
                }

                setIsResending(true);
                try {
                  const response = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
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
                    description: "Failed to resend code.",
                  });
                } finally {
                  setIsResending(false);
                }
              }}
              disabled={timeRemaining > 0 || isResending}
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Sending...
                </>
              ) : timeRemaining > 0 ? (
                `Resend in ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`
              ) : (
                "Resend code"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function VerifyResetCode() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Verify reset code
              </CardTitle>
              <CardDescription className="text-center">
                Loading...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyResetCodeContent />
    </Suspense>
  );
}
