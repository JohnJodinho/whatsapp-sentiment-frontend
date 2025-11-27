// src/components/dashboard/HeaderBar.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";

import { cn } from "@/lib/utils";


// 1. Define the props interface
interface HeaderBarProps {
  onToggleFilters: () => void;
  isFiltersOpen: boolean;
  onDownload: () => void;
  isLoading?: boolean;
}

export function HeaderBar({ 
  onToggleFilters, 
  isFiltersOpen,
  onDownload,
  isLoading
}: HeaderBarProps) {
  // const handleDownload = () => {
  //   toast.info("Preparing Download", {
  //     description: "Your dashboard download will begin shortly...",
  //   });
  // };
 

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          Chat Analysis Dashboard
        </h2>
        <p className="text-muted-foreground mt-1">
          Deep dive into your conversation metrics and behavior.
        </p>
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
          {isFiltersOpen ? "Hide Filters" : "Filters"}
        </Button>
        <Button
          className="rounded-xl flex-1 xl:flex-none text-white bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] transition-all hover:scale-105 hover:shadow-lg disabled:opacity-70"
          aria-label="Download dashboard as PDF"
          onClick={onDownload}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">⏳</span> Generating...
            </span>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
}