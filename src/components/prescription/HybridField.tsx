// src/components/prescription/HybridField.tsx
"use client";
import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface HybridFieldProps {
  label: string;
  value: string;
  onChange: (value: string, option?: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
}

export function HybridField({
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder = "",
}: HybridFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOptionClick = (option: string) => {
    const currentValues = value.split(", ").filter(Boolean);
    if (currentValues.includes(option)) {
      onChange(currentValues.filter((v) => v !== option).join(", "));
    } else {
      onChange([...currentValues, option].join(", "));
    }
    setIsFocused(false);
    textareaRef.current?.focus();
  };

  const currentValues = value.split(", ").filter(Boolean);

  return (
    <div className="space-y-3">
      <Label className="text-base">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          rows={2}
          className="resize-none text-base min-h-[80px]"
        />

        {isFocused && options.length > 0 && (
          <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1 p-3 max-h-48 overflow-y-auto">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">
              Quick Select Options
            </h4>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <Badge
                  key={option}
                  variant={
                    currentValues.includes(option) ? "default" : "outline"
                  }
                  className="cursor-pointer transition-colors text-sm"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleOptionClick(option);
                  }}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {currentValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentValues.map((val) => (
            <Badge key={val} variant="secondary" className="text-sm">
              {val}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
