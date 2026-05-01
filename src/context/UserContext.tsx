//src/context/UserContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionWithPlan } from "@/lib/plans";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bmdcReg: string;
  specialty?: string;
  role: string;
  doctor_id?: string;
}

interface UserContextType {
  user: User | null;
  subscription: SubscriptionWithPlan | null;
  isLoadingSubscription: boolean;
  hasPendingPayment: boolean;
  setUser: (user: User | null) => void;
  setSubscription: (sub: SubscriptionWithPlan | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

  const refreshSubscription = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch("/api/auth/subscription", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Subscription fetch failed: ${response.status}`);
    }

    return response.json();
  };

  useEffect(() => {
    // Load user from localStorage after register/checkout
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const rawUser = JSON.parse(storedUser);
      // Map backend fields to frontend context
      let doctorId: string | undefined = undefined;
      if (rawUser.role === "assistant") {
        // Always set doctor_id for assistants
        doctorId = rawUser.doctor_id?.toString() ?? rawUser.doctorId?.toString() ?? undefined;
      }
      setUser({
        id: rawUser.id?.toString(),
        email: rawUser.email,
        firstName: rawUser.first_name ?? rawUser.firstName ?? "",
        lastName: rawUser.last_name ?? rawUser.lastName ?? "",
        bmdcReg: rawUser.bmdc_reg ?? rawUser.bmdcReg ?? "",
        specialty: rawUser.specialty ?? "",
        role: rawUser.role ?? "doctor",
        doctor_id: doctorId
      });
    }

    // Fetch subscription from API if token exists
    const token = localStorage.getItem("token");
    if (token && storedUser) {
      const userRole = JSON.parse(storedUser).role;
      
      // Admins and assistants don't need subscription checks
      if (userRole === "admin" || userRole === "assistant") {
        setIsLoadingSubscription(false);
        return;
      }

      // For doctors, fetch subscription
      setIsLoadingSubscription(true);
      console.log("[UserContext] Fetching subscription for doctor...");
      
      refreshSubscription()
        .then((res) => {
          if (!res) return null;
          return res;
        })
        .then((data) => {
          if (!data) return;
          console.log("[UserContext] Subscription data received:", {
            hasActive: data.hasActiveSubscription,
            planName: data.subscription?.plan_name,
            hasPending: data.hasPendingPayment
          });
          
          // Set subscription if it exists, or set to null if no active subscription
          if (data.hasActiveSubscription && data.subscription) {
            setSubscription(data.subscription);
            setHasPendingPayment(false);
          } else {
            setSubscription(null);
            // Check if user has pending payment waiting for approval
            setHasPendingPayment(data.hasPendingPayment || false);
          }
        })
        .catch((error) => {
          console.error("[UserContext] Failed to fetch subscription:", error);
          setSubscription(null);
        })
        .finally(() => {
          console.log("[UserContext] Subscription loading complete");
          setIsLoadingSubscription(false);
        });
    } else {
      setIsLoadingSubscription(false);
    }
  }, []);

  // Secure fallback: periodically revalidate subscription state for active doctors
  useEffect(() => {
    if (!user || user.role !== "doctor") return;

    let cancelled = false;
    const shouldPoll = !subscription || hasPendingPayment;

    if (!shouldPoll) return;

    const interval = window.setInterval(() => {
      if (cancelled) return;
      refreshSubscription()
        .then((data) => {
          if (!data) return;
          if (data.hasActiveSubscription && data.subscription) {
            setSubscription(data.subscription);
            setHasPendingPayment(false);
           // router.replace("/dashboard");
            window.location.href = "/dashboard";
          } else {
            setSubscription(null);
            setHasPendingPayment(data.hasPendingPayment || false);
          }
        })
        .catch((error) => {
          console.error("[UserContext] Poll subscription failed:", error);
        });
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [hasPendingPayment, router, subscription, user]);

  // Listen for cross-tab payment events (approved/rejected) and refresh subscription
  useEffect(() => {
    if (typeof window === "undefined") return;

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("payments");
      const handler = (ev: MessageEvent) => {
        try {
          const msg = ev.data as { type?: string; userId?: number } | undefined;
          if (!msg || !msg.type) return;

          if (msg.type === "payment-approved" || msg.type === "payment-rejected") {
            const stored = localStorage.getItem("user");
            if (!stored) return;
            const parsed = JSON.parse(stored);
            if (!parsed || !parsed.id) return;

            // Only refresh subscription for the affected user
            if (String(parsed.id) === String(msg.userId)) {
              setIsLoadingSubscription(true);
              refreshSubscription()
                .then((data) => {
                  if (!data) return;
                  if (data.hasActiveSubscription && data.subscription) {
                    setSubscription(data.subscription);
                    setHasPendingPayment(false);
                   // router.replace("/dashboard");
                    window.location.href = "/dashboard";

                  } else {
                    setSubscription(null);
                    setHasPendingPayment(data.hasPendingPayment || false);
                  }
                })
                .catch((err) => {
                  console.error("[UserContext] Broadcast subscription refresh failed:", err);
                })
                .finally(() => setIsLoadingSubscription(false));
            }
          }
        } catch (err) {
          console.error("[UserContext] Broadcast handler error:", err);
        }
      };

      bc.addEventListener("message", handler);
    } catch (err) {
      console.warn("BroadcastChannel unavailable:", err);
    }

    return () => {
      try {
        if (bc) bc.close();
      } catch {}
    };
  }, [router, setSubscription]);

  return (
    <UserContext.Provider value={{ user, subscription, isLoadingSubscription, hasPendingPayment, setUser, setSubscription }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
