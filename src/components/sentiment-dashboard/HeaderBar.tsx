import { Button } from "@/components/ui/button";
import { Filter,  Download} from "lucide-react";

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
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
      {/* Dashboard Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sentiment Analysis Dashboard ✨
        </h1>
        <p className="text-muted-foreground mt-1">
          Emotional tone and engagement metrics breakdown.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Toggle Filters Button */}
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
              Download Report PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
}