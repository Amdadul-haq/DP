// src/components/ui/CustomIcons.tsx
import {
  Heart,
  Thermometer,
  Weight,
  Calendar,
  User,
  Search,
  Plus,
  X,
  Stethoscope,
  Pill,
  FileText,
  Syringe,
  FlaskConical,
  Badge
} from "lucide-react";

// Create a custom Pulse icon component
export const PulseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 10h2v4h-2" />
    <path d="M14 6h2v12h-2" />
    <path d="M10 14h2v4h-2" />
    <path d="M6 8h2v8h-2" />
  </svg>
);

// Re-export all lucide icons
export {
  Heart,
  Thermometer,
  Weight,
  Calendar,
  User,
  Search,
  Plus,
  X,
  Stethoscope,
  Pill,
  FileText,
  Syringe,
  FlaskConical,
  Badge
};
