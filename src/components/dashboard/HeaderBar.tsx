"use client";

import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
          Chat Analysis Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Deep dive into your conversation metrics.
        </p>
      </div>
      
      {/* Action Buttons Row */}
      <div className="flex w-full md:w-auto items-center gap-3">
        <Button
          variant="outline"
          className={cn(
            "rounded-xl flex-1 md:flex-none transition-all hover:scale-105 active:scale-95",
            isFiltersOpen && "ring-2 ring-ring ring-offset-2 ring-offset-background bg-accent"
          )}
          aria-label="Toggle filters panel"
          onClick={onToggleFilters}
        >
          <Filter className="w-4 h-4 mr-2" />
          {isFiltersOpen ? "Hide Filters" : "Filters"}
        </Button>
        
        <Button
          className="rounded-xl flex-1 md:flex-none text-white bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] transition-all hover:scale-105 hover:shadow-lg disabled:opacity-70 active:scale-95"
          aria-label="Download dashboard as PDF"
          onClick={onDownload}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center text-sm">
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