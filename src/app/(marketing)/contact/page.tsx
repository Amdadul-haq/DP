"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Globe2,
  Headphones,
  Github,
  Lightbulb,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  MessageSquareText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 18, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const quickActions = [
  {
    title: "Company hotline",
    description: "Speak with our support team during business hours.",
    href: "tel:+8801522115653",
    icon: Phone,
  },
  {
    title: "Email support",
    description: "Best for detailed questions, onboarding, and follow-up.",
    href: "mailto:milon.s2k21@gmail.com",
    icon: Mail,
  },
  {
    title: "Virtual service",
    description: "We currently provide support online only, with no physical office visits.",
    href: "#support-form",
    icon: Globe2,
  },
];

const supportHighlights = [
  "Fast response for product and account support",
  "Online-first service model for doctors and staff",
  "Guidance for onboarding, billing, and plan selection",
  "Secure handling of your inquiries and account details",
];

const ownerPhoto = "https://res.cloudinary.com/dx5b8xdgt/image/upload/v1760313945/new_pxkwiq.jpg";

const faqs = [
  {
    question: "Do you have a physical office I can visit?",
    answer:
      "No. We currently operate virtually and provide service online only.",
  },
  {
    question: "What is the fastest way to reach you?",
    answer:
      "Call our hotline for urgent issues or use the email form for detailed support requests.",
  },
  {
    question: "What type of issues can I contact you about?",
    answer:
      "You can contact us for onboarding, subscription help, account access, billing questions, and product support.",
  },
  {
    question: "How soon do you reply?",
    answer:
      "We aim to respond within one business day, and often sooner for active support cases.",
  },
];

const dedicationPoints = [
  "Built with care to make digital prescription management simpler and more reliable.",
  "Designed to support virtual service delivery with a professional, modern experience.",
  "Continuously improved based on real user needs and practical clinical workflows.",
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(formState.subject || "Contact from website");
    const body = encodeURIComponent(
      `Name: ${formState.name}\nEmail: ${formState.email}\n\n${formState.message}`
    );

    window.location.href = `mailto:milon.s2k21@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="relative overflow-hidden bg-background py-14 sm:py-18 lg:py-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,oklch(0.929_0.013_255.508/0.55),transparent_28%),radial-gradient(circle_at_top_right,oklch(0.704_0.04_256.788/0.14),transparent_22%),radial-gradient(circle_at_bottom,oklch(0.968_0.007_247.896/0.65),transparent_30%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.section
          className="mx-auto max-w-6xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="overflow-hidden border-border/60 shadow-xl">
            <CardContent className="space-y-7 p-6 sm:p-8 lg:p-10">
              <div className="space-y-6 text-center lg:text-left">
                <Badge variant="secondary" className="mx-auto rounded-full px-4 py-1 lg:mx-0">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Virtual-first support
                </Badge>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    Contact Digital Prescription
                  </h1>
                  <p className="mx-auto max-w-5xl text-lg leading-8 text-muted-foreground lg:mx-0 sm:text-xl">
                    We provide service online only. Reach us for support, onboarding, billing, or product questions through the hotline, email, or message form. Fast response for product and account support. Online-first service model for doctors and staff. Guidance for onboarding, billing, and plan selection. Secure handling of your inquiries and account details. Support channel: virtual only, no office visits. Service approach: professional, responsive, and practical.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                  {supportHighlights.map((item) => (
                    <span key={item} className="rounded-full border bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                  <a href="tel:+8801522115653" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]">
                    <Phone className="h-4 w-4" />
                    Call Hotline
                  </a>
                  <a href="mailto:milon.s2k21@gmail.com" className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-transform hover:scale-[1.02] hover:border-primary/40 hover:bg-primary/5">
                    <Mail className="h-4 w-4" />
                    Email Support
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.div
          className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Headphones className="h-5 w-5 text-primary" />
                  Contact information
                </CardTitle>
                <CardDescription>
                  Direct channels for virtual support and business communication.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company hotline</p>
                      <a href="tel:+8801522115653" className="font-semibold text-foreground hover:text-primary">
                        01522115653
                      </a>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href="mailto:milon.s2k21@gmail.com" className="font-semibold text-foreground hover:text-primary">
                        milon.s2k21@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4 sm:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Github className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">GitHub</p>
                      <a href="https://github.com/Amdadul-haq" target="_blank" rel="noreferrer" className="font-semibold text-foreground hover:text-primary">
                        github.com/Amdadul-haq
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  About the owner
                </CardTitle>
                <CardDescription>
                  Personal and leadership information behind the company.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-5 rounded-3xl border bg-muted/20 p-5 sm:flex-row sm:items-start">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border bg-background shadow-sm sm:h-32 sm:w-32">
                    {ownerPhoto ? (
                      <img
                        src={ownerPhoto}
                        alt="Amdadul Haque Milon"
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-lg font-semibold text-primary">
                        M
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Name
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        Amdadul Haque Milon
                      </p>
                      <p className="mt-2 text-sm font-medium text-primary">
                        Founder &amp; Owner
                      </p>
                    </div>

                    <p className="text-sm leading-6 text-muted-foreground">
                      I am a final year CSE student at Jagannath University, Dhaka, and I built Digital Prescription with a strong focus on simplicity, reliability, and a better experience for doctors working in a virtual-first environment.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl bg-primary/5 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    My dedication
                  </div>
                  <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
                    {dedicationPoints.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Frequently asked questions</CardTitle>
                <CardDescription>
                  Quick answers to common questions before you contact us.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={faq.question} value={`faq-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-xl" id="support-form">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a message</CardTitle>
                <CardDescription>
                  Use the form below to start an email with your details prefilled.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" name="name" value={formState.name} onChange={handleChange} placeholder="Dr. Example" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" name="email" type="email" value={formState.email} onChange={handleChange} placeholder="doctor@example.com" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" value={formState.subject} onChange={handleChange} placeholder="How can we help?" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      placeholder="Tell us a little about your question or the support you need."
                      className="min-h-40"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Send message
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This will open your email app with the details ready to send to milon.s2k21@gmail.com.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}