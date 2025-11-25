// src/app/(marketing)/verify-reset-code/page.tsx
"use client";

import { useState, useEffect } from "react";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function VerifyResetCode() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
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
  }, [searchParams, router]);

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

            <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
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
            <p className="text-muted-foreground mb-2">Didn&apos;t receive the code?</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/forgot-password")}
            >
              Request new code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
