// src/components/landing/Demo.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion ,Variants} from "framer-motion";
import { useInView } from "react-intersection-observer";

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

export default function Demo() {
  const router = useRouter();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleGetStarted = () => {
    router.push("/register");
  };

  return (
    <section id="demo" className="py-20 bg-muted">
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
          className="bg-background p-8 rounded-lg shadow-lg max-w-4xl mx-auto"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Digital Prescription
              </h3>
              <p className="text-muted-foreground">
                123 Medical Center Drive, Healthcare City
              </p>
              <p className="text-muted-foreground">
                Phone: (555) 123-4567 | Email: info@digitalprescription.com
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">
                Date: {new Date().toLocaleDateString()}
              </p>
              <p className="text-muted-foreground">
                Prescription #: DP-2023-00125
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-2 border-b pb-1">
                Doctor Information
              </h4>
              <p className="font-medium text-foreground">
                Dr. Sarah Johnson, MD
              </p>
              <p className="text-muted-foreground">
                Internal Medicine Specialist
              </p>
              <p className="text-muted-foreground">BMDC Reg: 12345</p>
              <p className="text-muted-foreground">Phone: (555) 987-6543</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2 border-b pb-1">
                Patient Information
              </h4>
              <p className="text-muted-foreground">Name: Michael Thompson</p>
              <p className="text-muted-foreground">Age: 42 years, Male</p>
              <p className="text-muted-foreground">Contact: (555) 456-7890</p>
              <p className="text-muted-foreground">
                Weight: 82 kg | Height: 178 cm
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold text-foreground mb-2 border-b pb-1">
              Diagnosis
            </h4>
            <p className="text-muted-foreground">Hypertension, Stage 1</p>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold text-foreground mb-2 border-b pb-1">
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
                    Frequency
                  </th>
                  <th className="border py-2 px-4 text-left text-foreground">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border py-2 px-4 text-muted-foreground">
                    Lisinopril 10mg
                  </td>
                  <td className="border py-2 px-4 text-muted-foreground">
                    1 tablet
                  </td>
                  <td className="border py-2 px-4 text-muted-foreground">
                    Once daily
                  </td>
                  <td className="border py-2 px-4 text-muted-foreground">
                    30 days
                  </td>
                </tr>
                <tr>
                  <td className="border py-2 px-4 text-muted-foreground">
                    Amlodipine 5mg
                  </td>
                  <td className="border py-2 px-4 text-muted-foreground">
                    1 tablet
                  </td>
                  <td className="border py-2 px-4 text-muted-foreground">
                    Once daily
                  </td>
                  <td className="border py-2 px-4 text-muted-foreground">
                    30 days
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold text-foreground mb-2 border-b pb-1">
              Advice
            </h4>
            <ul className="list-disc pl-5 text-muted-foreground">
              <li>Reduce sodium intake in diet</li>
              <li>Exercise for 30 minutes at least 5 days a week</li>
              <li>Monitor blood pressure twice weekly</li>
              <li>Avoid alcohol and tobacco products</li>
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-foreground">
                Next visit: After 4 weeks
              </p>
              <p className="text-sm text-muted-foreground">
                Please bring your blood pressure log
              </p>
            </div>
            <div className="text-center">
              <div className="mb-1 h-0.5 bg-muted-foreground w-32"></div>
              <p className="text-muted-foreground">Dr. Sarah Johnson, MD</p>
            </div>
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
