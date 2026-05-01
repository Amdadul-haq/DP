// src/context/UserContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
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
  refreshSubscription: () => Promise<SubscriptionApiResponse | null>;
}

interface SubscriptionApiResponse {
  hasActiveSubscription: boolean;
  subscription: SubscriptionWithPlan | null;
  hasPendingPayment?: boolean;
  isAdmin?: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(
    null,
  );
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

  // Ref to prevent multiple simultaneous refreshes
  const refreshingRef = useRef(false);

  const refreshSubscription = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    if (refreshingRef.current) {
      console.log(
        "[UserContext] Refresh already in progress, skipping duplicate call",
      );
      return null;
    }

    refreshingRef.current = true;

    try {
      console.log("[UserContext] Refreshing subscription from API");
      const response = await fetch("/api/auth/subscription", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Subscription fetch failed: ${response.status}`);
      }

      const data = (await response.json()) as SubscriptionApiResponse;

      console.log("[UserContext] Subscription data received:", {
        hasActive: data.hasActiveSubscription,
        planName: data.subscription?.plan_name,
        planId: data.subscription?.plan_id,
        hasPending: data.hasPendingPayment,
        isAdmin: data.isAdmin,
      });

      return data;
    } catch (error) {
      console.error("[UserContext] Failed to fetch subscription:", error);
      return null;
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const rawUser = JSON.parse(storedUser);
        let doctorId: string | undefined = undefined;
        if (rawUser.role === "assistant") {
          doctorId =
            rawUser.doctor_id?.toString() ??
            rawUser.doctorId?.toString() ??
            undefined;
        }
        setUser({
          id: rawUser.id?.toString(),
          email: rawUser.email,
          firstName: rawUser.first_name ?? rawUser.firstName ?? "",
          lastName: rawUser.last_name ?? rawUser.lastName ?? "",
          bmdcReg: rawUser.bmdc_reg ?? rawUser.bmdcReg ?? "",
          specialty: rawUser.specialty ?? "",
          role: rawUser.role ?? "doctor",
          doctor_id: doctorId,
        });
      } catch (error) {
        console.error("[UserContext] Failed to parse stored user:", error);
      }
    }
  }, []);

  // Fetch subscription for doctors on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      setIsLoadingSubscription(false);
      return;
    }

    let userRole = "";
    try {
      userRole = JSON.parse(storedUser).role;
    } catch {
      setIsLoadingSubscription(false);
      return;
    }

    // Admins and assistants don't need subscription checks
    if (userRole === "admin" || userRole === "assistant") {
      setIsLoadingSubscription(false);
      return;
    }

    // For doctors, fetch subscription
    setIsLoadingSubscription(true);
    console.log("[UserContext] Fetching subscription for doctor...");

    refreshSubscription()
      .then((data) => {
        if (!data) return;

        if (data.isAdmin) {
          console.warn(
            "[UserContext] Subscription API returned admin context during doctor bootstrap",
          );
          setSubscription(null);
          setHasPendingPayment(false);
          return;
        }

        if (data.hasActiveSubscription && data.subscription) {
          setSubscription(data.subscription);
          setHasPendingPayment(false);
        } else {
          setSubscription(null);
          setHasPendingPayment(data.hasPendingPayment || false);
        }
      })
      .catch((error) => {
        console.error("[UserContext] Subscription fetch error:", error);
        setSubscription(null);
      })
      .finally(() => {
        setIsLoadingSubscription(false);
      });
  }, [refreshSubscription]);

  // BroadcastChannel listener for cross-tab payment events
  useEffect(() => {
    if (typeof window === "undefined") return;

    let bc: BroadcastChannel | null = null;
    let isMounted = true;

    try {
      bc = new BroadcastChannel("payments");

      const handler = (ev: MessageEvent) => {
        if (!isMounted) return;

        try {
          const msg = ev.data as
            | { type?: string; userId?: number | string }
            | undefined;
          if (!msg?.type) return;

          if (
            msg.type === "payment-approved" ||
            msg.type === "payment-rejected"
          ) {
            const stored = localStorage.getItem("user");
            if (!stored) return;

            const parsed = JSON.parse(stored);
            if (!parsed?.id) return;

            if (parsed.role !== "doctor") {
              console.log(
                "[UserContext] Ignoring payment broadcast for non-doctor role:",
                parsed.role,
              );
              return;
            }

            if (String(parsed.id) === String(msg.userId)) {
              console.log(
                "[UserContext] Payment broadcast received, refreshing subscription",
                {
                  type: msg.type,
                  userId: parsed.id,
                },
              );

              setIsLoadingSubscription(true);
              refreshSubscription()
                .then((data) => {
                  if (!data || !isMounted) return;

                  if (data.isAdmin) {
                    console.warn(
                      "[UserContext] Broadcast refresh received admin context",
                    );
                    return;
                  }

                  if (data.hasActiveSubscription && data.subscription) {
                    console.log(
                      "[UserContext] Active subscription confirmed via broadcast, redirecting...",
                    );
                    setSubscription(data.subscription);
                    setHasPendingPayment(false);
                    window.location.href = "/dashboard";
                  } else {
                    setSubscription(null);
                    setHasPendingPayment(data.hasPendingPayment || false);
                  }
                })
                .catch((err) => {
                  console.error("[UserContext] Broadcast refresh failed:", err);
                })
                .finally(() => {
                  if (isMounted) setIsLoadingSubscription(false);
                });
            }
          }
        } catch (err) {
          console.error("[UserContext] Broadcast handler error:", err);
        }
      };

      bc.addEventListener("message", handler);
    } catch (err) {
      console.warn("[UserContext] BroadcastChannel unavailable:", err);
    }

    return () => {
      isMounted = false;
      if (bc) {
        try {
          bc.close();
        } catch {
          // ignore
        }
      }
    };
  }, [refreshSubscription]);

  return (
    <UserContext.Provider
      value={{
        user,
        subscription,
        isLoadingSubscription,
        hasPendingPayment,
        setUser,
        setSubscription,
        refreshSubscription,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
