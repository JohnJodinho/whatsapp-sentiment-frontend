import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal } from "lucide-react";

interface HeaderBarProps {
  onToggleFilters: () => void;
  isFiltersOpen: boolean;
}

export function HeaderBar({ onToggleFilters, isFiltersOpen }: HeaderBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
      {/* Dashboard Title */}
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Sentiment Analysis Dashboard ✨
      </h1>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Toggle Filters Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          aria-expanded={isFiltersOpen}
          className="flex items-center"
        >
          {isFiltersOpen ? (
            <SlidersHorizontal className="mr-2 h-4 w-4" />
          ) : (
            <Filter className="mr-2 h-4 w-4" />
          )}
          Filters
        </Button>

        {/* Optional: Add other buttons like Download later if needed */}
        {/* <Button
          variant="default" // Or your gradient style
          size="sm"
          className="flex items-center bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button> */}
      </div>
    </div>
  );
}