// src/components/landing/Hero.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, Variants, easeOut } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export default function Hero() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            Modern Digital Prescription Platform for Doctors
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-10 max-w-3xl"
          >
            Create professional prescriptions, manage patients, and save time
            with our easy-to-use digital tool.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#demo">View Demo</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero image placeholder */}
        <motion.div
          ref={ref}
          variants={cardVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-16 flex justify-center"
        >
          <Card className="w-full max-w-4xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Sample Prescription
                  </h3>
                  <p className="text-muted-foreground">
                    Dr. John Smith, MBBS, FCPS
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">
                    Date: {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-muted-foreground">
                    Prescription #: DP-2023-001
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Patient Information
                  </h4>
                  <p className="text-muted-foreground">Name: Sarah Johnson</p>
                  <p className="text-muted-foreground">Age: 35 years, Female</p>
                  <p className="text-muted-foreground">
                    Contact: (555) 123-4567
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Diagnosis
                  </h4>
                  <p className="text-muted-foreground">
                    Acute Upper Respiratory Infection
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-2">
                  Medications
                </h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border py-2 px-4 text-left text-foreground">
                        Medicine
                      </th>
                      <th className="border py-2 px-4 text-left text-foreground">
                        Dosage
                      </th>
                      <th className="border py-2 px-4 text-left text-foreground">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border py-2 px-4 text-muted-foreground">
                        Amoxicillin 500mg
                      </td>
                      <td className="border py-2 px-4 text-muted-foreground">
                        1 tablet three times daily
                      </td>
                      <td className="border py-2 px-4 text-muted-foreground">
                        7 days
                      </td>
                    </tr>
                    <tr>
                      <td className="border py-2 px-4 text-muted-foreground">
                        Ibuprofen 400mg
                      </td>
                      <td className="border py-2 px-4 text-muted-foreground">
                        1 tablet as needed for pain
                      </td>
                      <td className="border py-2 px-4 text-muted-foreground">
                        5 days
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Advice</h4>
                  <p className="text-muted-foreground">
                    Take rest, drink plenty of fluids, avoid cold food and
                    beverages.
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    Next visit: After 7 days
                  </p>
                </div>
                <div className="text-center">
                  <div className="mb-1 h-0.5 bg-muted-foreground w-32"></div>
                  <p className="text-muted-foreground">Dr. John Smith</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
