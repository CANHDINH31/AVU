"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
}

export function ActionButton({
  onClick,
  children,
  icon,
  variant = "default",
  size = "default",
  className,
  disabled = false,
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      className={cn("bg-blue-600 hover:bg-blue-700 text-white", className)}
    >
      {icon || <Plus className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}
