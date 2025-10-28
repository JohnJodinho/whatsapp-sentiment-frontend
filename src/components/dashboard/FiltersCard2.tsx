"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Type for the filter state passed to the parent
export interface FilterState {
  participants: string[];
  dateRange: DateRange | undefined;
  timePeriod: string;
}

// Props for the FiltersCard
interface FiltersCardProps {
  participants: string[]; // Passed from parent
  isLoading: boolean; // Passed from parent
  onApplyFilters: (filters: FilterState) => void; // Passed from parent
}

const MAX_PARTICIPANTS = 10;

export function FiltersCard({
  participants,
  isLoading,
  onApplyFilters,
}: FiltersCardProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("All Day");
  const [date, setDate] = useState<DateRange | undefined>();
  const [participantPopoverOpen, setParticipantPopoverOpen] = useState(false);

  // Time period options (keeping this internal as it's static)
  const timePeriods = ["All Day", "Morning", "Afternoon", "Evening", "Night"];

  const handleParticipantSelect = (participant: string) => {
    // Check if participant is already selected
    if (selectedParticipants.includes(participant)) {
      // De-select
      setSelectedParticipants(selectedParticipants.filter((p) => p !== participant));
    } else {
      // Check limit before adding
      if (selectedParticipants.length < MAX_PARTICIPANTS) {
        // Add
        setSelectedParticipants([...selectedParticipants, participant]);
      } else {
        // Show toast warning
        toast.warning(
          `You can select a maximum of ${MAX_PARTICIPANTS} participants`
        );
      }
    }
  };

  const handleApplyFilters = () => {
    // Bundle the filter state
    const filters: FilterState = {
      participants: selectedParticipants, // An empty array means "All Participants"
      dateRange: date,
      timePeriod: selectedTimePeriod,
    };
    // Pass the state up to the parent
    onApplyFilters(filters);
  };

  const getParticipantTriggerText = () => {
    if (selectedParticipants.length === 0) {
      return "Select participants...";
    }
    if (selectedParticipants.length === 1) {
      return selectedParticipants[0];
    }
    return `${selectedParticipants.length} participants selected`;
  };

  return (
    <Card className="rounded-2xl border border-border bg-card px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Participant Selector */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground font-medium">
            Participant
          </Label>
          <Popover
            open={participantPopoverOpen}
            onOpenChange={setParticipantPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={participantPopoverOpen}
                className="w-full justify-start text-left font-normal"
              >
                <span className="truncate">{getParticipantTriggerText()}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search participant..." />
                <CommandList>
                  <CommandEmpty>No participant found.</CommandEmpty>
                  {/* "All Participants" virtual option */}
                  <CommandItem
                    key="all-participants"
                    value="All Participants"
                    onSelect={() => setSelectedParticipants([])}
                    className={cn(
                      selectedParticipants.length === 0 ? "font-bold" : ""
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedParticipants.length === 0
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    All Participants
                  </CommandItem>
                  
                  {/* Real participant list */}
                  {participants.map((p) => {
                    const isSelected = selectedParticipants.includes(p);
                    return (
                      <CommandItem
                        key={p}
                        value={p}
                        onSelect={() => handleParticipantSelect(p)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {p}
                      </CommandItem>
                    );
                  })}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {/* Badge display for selected participants */}
          {selectedParticipants.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {selectedParticipants.map((p) => (
                <Badge
                  key={p}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {p}
                  <button
                    onClick={() => handleParticipantSelect(p)}
                    className="rounded-full hover:bg-muted-foreground/20"
                    aria-label={`Remove ${p}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground font-medium">
            Date Range
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  // 1. Changed from justify-start to justify-between
                  "w-full justify-between text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {/* 2. Grouped the icon and text */}
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </div>

                {/* 3. Add the conditional clear button */}
                {date && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      // 4. Stop propagation and clear the date
                      e.stopPropagation();
                      setDate(undefined);
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear date</span>
                  </Button>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Period Selector */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground font-medium">
            Time of Day
          </Label>
          <Select
            value={selectedTimePeriod}
            onValueChange={setSelectedTimePeriod}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a time period" />
            </SelectTrigger>
            <SelectContent>
              {timePeriods.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Apply Button */}
        <Button
          onClick={handleApplyFilters}
          disabled={isLoading} // Disable button when loading
          className="rounded-xl text-white bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] hover:shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-70"
        >
          <Check className="w-4 h-4 mr-2" />
          {isLoading ? "Applying..." : "Apply Filters"}
        </Button>
      </div>
    </Card>
  );
}