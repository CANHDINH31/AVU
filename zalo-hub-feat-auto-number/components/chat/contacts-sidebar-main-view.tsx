import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import React from "react";
import { ViewType } from "./contacts-sidebar";

type MenuItem = {
  id: string;
  title: string;
  count: number;
  icon: React.ElementType;
  description: string;
};

type MainViewProps = {
  menuItems: MenuItem[];
  setCurrentView: (view: ViewType) => void;
};

export const MainView: React.FC<MainViewProps> = ({
  menuItems,
  setCurrentView,
}) => (
  <div className="space-y-1">
    {menuItems.map((item) => (
      <div
        key={item.id}
        onClick={() => setCurrentView(item.id as ViewType)}
        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
            <item.icon className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="h-6">
            {item.count}
          </Badge>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    ))}
  </div>
);
