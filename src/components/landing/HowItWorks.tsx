// src/components/landing/HowItWorks.tsx
const steps = [
  {
    step: 1,
    title: "Sign up & Subscribe",
    description:
      "Create your account as a verified doctor and choose a subscription plan that fits your practice.",
  },
  {
    step: 2,
    title: "Add Patient & Search Medicines",
    description:
      "Add patient information and search from our extensive medicine database to create prescriptions.",
  },
  {
    step: 3,
    title: "Generate & Print Prescription",
    description:
      "Create beautiful, structured prescriptions and download or print them for your patients.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Simple steps to transform your prescription process with our digital
            platform.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {steps.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center max-w-xs mx-auto"
            >
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
