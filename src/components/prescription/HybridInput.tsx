// src/components/prescription/HybridInput.tsx
"use client";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface HybridInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
}

export function HybridInput({
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder = "",
}: HybridInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsFocused(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <Label className="text-base">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="text-base h-12"
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
                  variant={value === option ? "default" : "outline"}
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
    </div>
  );
}
