// src/components/landing/Hero.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useInView as useFramerInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

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

// Animated Counter Component
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useFramerInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-bold text-primary">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Hero() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const benefits = [
    { icon: "⚡", text: "Save 70% time on prescription writing" },
    { icon: "💾", text: "Auto-save patient records securely" },
    { icon: "📱", text: "Access from any device, anywhere" },
    { icon: "🔄", text: "Easy prescription renewal system" },
  ];

  return (
    <section className="relative bg-background py-20">
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
            Digital Prescription Platform for Doctors
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
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#demo">View Demo</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Animated Statistics */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">
              <AnimatedCounter value={500} suffix="+" />
            </div>
            <p className="text-muted-foreground">Doctors Trust Our Platform</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">
              <AnimatedCounter value={25000} suffix="+" />
            </div>
            <p className="text-muted-foreground">Prescriptions Generated</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">
              <AnimatedCounter value={15000} />
            </div>
            <p className="text-muted-foreground">Hours Saved</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">
              <AnimatedCounter value={98} suffix="%" />
            </div>
            <p className="text-muted-foreground">Satisfaction Rate</p>
          </motion.div>
        </motion.div>

        {/* Platform Preview & Benefits */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col lg:flex-row gap-8 items-center"
        >
          {/* Platform Preview Card */}
          <Card className="w-full lg:w-2/3 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="bg-card border rounded-lg p-8 text-card-foreground text-center">
                <h3 className="text-2xl font-bold mb-4">Platform Preview</h3>
                <div className="bg-muted/50 border rounded-lg p-4">
                  <div className="flex space-x-2 mb-4">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <div className="w-3 h-3 bg-muted-foreground/50 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-left">
                    <div className="bg-background border rounded p-3">
                      <div className="font-semibold text-foreground">Patient Search</div>
                      <div className="text-sm text-muted-foreground">Quick access</div>
                    </div>
                    <div className="bg-background border rounded p-3">
                      <div className="font-semibold text-foreground">Medicine DB</div>
                      <div className="text-sm text-muted-foreground">17,265+ drugs</div>
                    </div>
                    <div className="bg-background border rounded p-3">
                      <div className="font-semibold text-foreground">Templates</div>
                      <div className="text-sm text-muted-foreground">Customizable</div>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground">See actual interface in demo below</p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits List */}
          <div className="w-full lg:w-1/3">
            <h3 className="text-2xl font-bold text-foreground mb-6">Why Doctors Choose Us</h3>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={inView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border"
                >
                  <span className="text-2xl">{benefit.icon}</span>
                  <span className="text-foreground">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">Trusted by medical professionals from</p>
          <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
            <span className="font-semibold">City Hospital</span>
            <span className="font-semibold">MediCare Center</span>
            <span className="font-semibold">HealthPlus Clinic</span>
            <span className="font-semibold">Family Care</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}