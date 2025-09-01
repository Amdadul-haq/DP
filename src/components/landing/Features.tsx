// src/components/landing/Features.tsx
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: "🔐",
    title: "Secure Doctor Login & Profile",
    description:
      "Secure authentication with doctor verification and customizable professional profiles.",
  },
  {
    icon: "💊",
    title: "Medicine Database & Search",
    description:
      "Comprehensive medicine database with search functionality and custom medicine options.",
  },
  {
    icon: "📄",
    title: "Beautiful Prescription Design",
    description:
      "Professional, structured prescription templates that maintain medical standards.",
  },
  {
    icon: "💳",
    title: "Subscription Packages",
    description:
      "Flexible subscription plans to suit different practice needs and sizes.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Medical Professionals
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create, manage, and organize digital
            prescriptions efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
