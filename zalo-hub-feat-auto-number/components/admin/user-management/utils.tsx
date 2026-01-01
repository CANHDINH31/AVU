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

export const getRankBadgeColor = (rankName: string | undefined) => {
  if (!rankName) return "bg-gray-50 text-gray-700 border-gray-200";

  switch (rankName.toLowerCase()) {
    case "kim_cuong":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "vang":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "bac":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "dong":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};
