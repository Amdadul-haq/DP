// src/components/landing/DemoWithPrescriptionTemplate.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { PrescriptionHTMLTemplate } from "@/components/PrescriptionHTMLTemplate";

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

export default function DemoWithPrescriptionTemplate() {
  const router = useRouter();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleGetStarted = () => {
    router.push("/register");
  };

  // Sample prescription data - you can replace this with your actual data
  const samplePrescription = {
    id: 1,
    patient_number: 12345,
    diagnosis: "Hypertension, Hyperlipidemia",
    history: "No significant history",
    cc: "Headache, Dizziness",
    bp: "120/80 mmHg",
    pulse: "72 bpm",
    weight: "70 kg",
    temperature: "98.6°F",
    tests: "CBC, Urine routine, Blood glucose",
    advice:
      "পর্যাপ্ত পানি পান করুন, মানসিক চাপ কমাতে চেষ্টা করুন, পর্যাপ্ত বিশ্রাম নিন, নিয়মিত হাঁটাহাঁটি করুন",
    next_visit_date: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(), // 7 days from now
    created_at: new Date().toISOString(),
    patient_name: "Md. Amdadul Haque",
    patient_age: 25,
    patient_gender: "Male",
    patient_mobile: "01575494393",
    medicines: [
      {
        name: "Cap. Cef-3 DS",
        rules: "১+০+১",
        days: "১৪ দিন",
        notes: "খাওয়ার পরে",
      },
      {
        name: "Tab. Ace plus 500mg",
        rules: "১+১+১",
        days: "৭ দিন",
        notes: "খাওয়ার পরে",
      },
      {
        name: "Tab. Nexum MUPS 40mg",
        rules: "১+১+১",
        days: "১৪ দিন",
        notes: "খাওয়ার আগে",
      },
    ],
  };

  return (
    <section id="demo" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Preview of our professional prescription template that you can
            customize.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={cardVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-background rounded-lg shadow-lg overflow-hidden">
            <PrescriptionHTMLTemplate
              prescription={samplePrescription}
              isForPDF={false}
            />
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <p className="text-lg text-muted-foreground mb-6">
            Ready to create professional prescriptions like this?
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            Get Started Today
          </button>
        </motion.div>
      </div>
    </section>
  );
}
