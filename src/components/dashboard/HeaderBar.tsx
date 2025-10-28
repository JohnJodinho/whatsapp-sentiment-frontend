// src/components/dashboard/HeaderBar.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// 1. Define the props interface
interface HeaderBarProps {
  onToggleFilters: () => void;
  isFiltersOpen: boolean;
}

export function HeaderBar({ onToggleFilters, isFiltersOpen }: HeaderBarProps) {
  const handleDownload = () => {
    toast.info("Preparing Download", {
      description: "Your dashboard download will begin shortly...",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Chat Analysis Dashboard
        </h2>
      </div>
      <div className="flex items-center space-x-3">
        {/* 2. The button now uses the prop */}
        <Button
          variant="outline"
          className={cn(
            "rounded-xl transition-all hover:scale-105 hover:shadow-sm",
            isFiltersOpen && "ring-2 ring-ring ring-offset-2 ring-offset-background"
          )}
          aria-label="Toggle filters panel"
          onClick={onToggleFilters} // 3. Call the function from the parent
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        <Button
          className="rounded-xl text-white bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] transition-transform hover:scale-105 hover:shadow-lg"
          aria-label="Download dashboard as PDF"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Dashboard
        </Button>
      </div>
    </div>
  );
}