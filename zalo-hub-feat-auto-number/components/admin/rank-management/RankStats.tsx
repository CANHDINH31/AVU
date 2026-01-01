"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRankStats } from "@/lib/api/user-rank";
import { Award } from "lucide-react";

interface RankStatsProps {
  stats: UserRankStats[];
  isLoading: boolean;
}

export function RankStats({ stats, isLoading }: RankStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.rank.id}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {stat.rank.displayName}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.userCount}
                </p>
                <p className="text-xs text-gray-500">
                  Tối đa: {stat.rank.maxAccounts} tài khoản
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

