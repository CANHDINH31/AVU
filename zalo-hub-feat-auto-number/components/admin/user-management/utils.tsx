import React from "react";
import { Shield, UserCheck, Users, UserX } from "lucide-react";

export const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "admin":
      return "destructive";
    case "manager":
      return "default";
    case "user":
      return "secondary";
    default:
      return "outline";
  }
};

export const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return <Shield className="w-4 h-4" />;
    case "manager":
      return <UserCheck className="w-4 h-4" />;
    case "user":
      return <Users className="w-4 h-4" />;
    default:
      return <UserX className="w-4 h-4" />;
  }
};

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toISOString().split("T")[0]; // YYYY-MM-DD
};
