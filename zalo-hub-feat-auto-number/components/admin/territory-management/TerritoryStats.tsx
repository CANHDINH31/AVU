"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, Users, UserCheck, Building } from "lucide-react";

interface TerritoryStatsProps {
  territoriesStats: {
    totalTerritories: number;
    totalManagers: number;
    totalMembers: number;
    activeTerritories: number;
  };
  isLoading: boolean;
}

export function TerritoryStats({
  territoriesStats,
  isLoading,
}: TerritoryStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Tổng nhóm",
      value: territoriesStats.totalTerritories,
      icon: Map,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Quản lý",
      value: territoriesStats.totalManagers,
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Thành viên",
      value: territoriesStats.totalMembers,
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Đang hoạt động",
      value: territoriesStats.activeTerritories,
      icon: Building,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
