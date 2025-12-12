"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

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
      
      fetch("/api/auth/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Subscription fetch failed: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
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
