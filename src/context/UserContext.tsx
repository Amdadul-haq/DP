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
  setUser: (user: User | null) => void;
  setSubscription: (sub: SubscriptionWithPlan | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);

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

    // Optionally, fetch subscription from API if token exists
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.subscription) setSubscription(data.subscription);
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, subscription, setUser, setSubscription }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
