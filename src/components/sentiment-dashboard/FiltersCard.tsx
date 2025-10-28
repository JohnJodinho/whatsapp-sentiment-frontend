"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X, Filter } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Type for the filter state passed to the parent
export type SentimentGranularity = "message" | "segment";
export type SentimentLabel = "Positive" | "Negative" | "Neutral";

export interface SentimentFilterState {
  participants: string[];
  dateRange: DateRange | undefined;
  timePeriod: string;
  granularity: SentimentGranularity;
  sentimentTypes: SentimentLabel[];
}

// Props for the FiltersCard
interface SentimentFiltersCardProps {
  participants: string[]; // Passed from parent
  isLoading: boolean;     // Passed from parent
  onApplyFilters: (filters: SentimentFilterState) => void; // Passed from parent
}

const MAX_PARTICIPANTS = 10;
const ALL_SENTIMENTS: SentimentLabel[] = ["Positive", "Negative", "Neutral"];

export function FiltersCard({
  participants,
  isLoading,
  onApplyFilters,
}: SentimentFiltersCardProps) {
  // Internal state for each filter
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("All Day");
  const [date, setDate] = useState<DateRange | undefined>();
  const [granularity, setGranularity] = useState<SentimentGranularity>("message");
  const [selectedSentiments, setSelectedSentiments] = useState<SentimentLabel[]>([...ALL_SENTIMENTS]); // Default to all selected

  // Popover state for participant selector
  const [participantPopoverOpen, setParticipantPopoverOpen] = useState(false);

  // Time period options
  const timePeriods = ["All Day", "Morning", "Afternoon", "Evening", "Night"];

  // --- Participant Selection Logic ---
  const handleParticipantSelect = (participant: string) => {
    if (selectedParticipants.includes(participant)) {
      setSelectedParticipants(selectedParticipants.filter((p) => p !== participant));
    } else {
      if (selectedParticipants.length < MAX_PARTICIPANTS) {
        setSelectedParticipants([...selectedParticipants, participant]);
      } else {
        toast.warning(
          `You can select a maximum of ${MAX_PARTICIPANTS} participants`
        );
      }
    }
  };

  const getParticipantTriggerText = () => {
    if (selectedParticipants.length === 0) return "Select participants...";
    if (selectedParticipants.length === 1) return selectedParticipants[0];
    return `${selectedParticipants.length} participants selected`;
  };

  // --- Sentiment Type Selection Logic ---
  const handleSentimentSelect = (sentiment: SentimentLabel) => {
    setSelectedSentiments(prev =>
      prev.includes(sentiment)
        ? prev.filter(s => s !== sentiment)
        : [...prev, sentiment]
    );
  };

   const getSentimentTriggerText = () => {
      if (selectedSentiments.length === ALL_SENTIMENTS.length) return "All Sentiments";
      if (selectedSentiments.length === 0) return "None selected";
      if (selectedSentiments.length === 1) return selectedSentiments[0];
      return `${selectedSentiments.length} selected`;
   };

  // --- Apply Filters Logic ---
  const handleApplyFilters = () => {
    const filters: SentimentFilterState = {
      participants: selectedParticipants,
      dateRange: date,
      timePeriod: selectedTimePeriod,
      granularity: granularity,
      sentimentTypes: selectedSentiments,
    };
    onApplyFilters(filters);
  };

  return (
    <Card className="rounded-2xl border border-border bg-card px-6 py-4">
      {/* Using grid layout for responsiveness */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        {/* Participant Selector (Takes more space on larger screens) */}
        <div className="space-y-2 lg:col-span-2">
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
                      className={cn(selectedParticipants.length === 0 ? "font-bold" : "")}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedParticipants.length === 0 ? "opacity-100" : "opacity-0")} />
                      All Participants
                    </CommandItem>
                    {/* Real participant list */}
                    {participants.map((p) => {
                       const isSelected = selectedParticipants.includes(p);
                       return (
                         <CommandItem key={p} value={p} onSelect={() => handleParticipantSelect(p)} >
                           <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                           {p}
                         </CommandItem>
                       );
                    })}
                  </CommandList>
                </Command>
            </PopoverContent>
          </Popover>
           {/* Badge display */}
           {selectedParticipants.length > 0 && (
             <div className="flex flex-wrap gap-1 pt-1">
               {selectedParticipants.map((p) => (
                 <Badge key={p} variant="secondary" className="flex items-center gap-1 text-xs" >
                   {p}
                   <button onClick={() => handleParticipantSelect(p)} className="rounded-full hover:bg-muted-foreground/20" aria-label={`Remove ${p}`} >
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
                  "w-full justify-between text-left font-normal", // Use justify-between
                  !date && "text-muted-foreground"
                )}
              >
                <div className="flex items-center"> {/* Group icon and text */}
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
                {/* Clear Button */}
                {date && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setDate(undefined); }} >
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
              <SelectValue placeholder="Select period" />
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

        {/* Granularity & Sentiment (Combined column or separate based on screen size needed) */}
         <div className="flex flex-col md:flex-row md:items-end md:gap-4 lg:col-span-2">

           {/* Analysis Level Toggle */}
           <div className="space-y-2 flex-1 mb-4 md:mb-0">
             <Label className="text-sm text-muted-foreground font-medium">
               Analysis Level
             </Label>
             <ToggleGroup
               type="single"
               value={granularity}
               onValueChange={(value: SentimentGranularity) => {
                 if (value) setGranularity(value); // Prevent unselecting
               }}
               className="w-full grid grid-cols-2 border rounded-md p-0.5"
             >
               <ToggleGroupItem value="message" aria-label="Message Level" className="h-9 text-xs data-[state=on]:bg-muted">Message</ToggleGroupItem>
               <ToggleGroupItem value="segment" aria-label="Segment Level" className="h-9 text-xs data-[state=on]:bg-muted">Segment</ToggleGroupItem>
             </ToggleGroup>
           </div>

           {/* Sentiment Type Dropdown */}
           <div className="space-y-2 flex-1">
             <Label className="text-sm text-muted-foreground font-medium">
               Sentiment Type
             </Label>
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="w-full justify-start text-left font-normal">
                   <Filter className="mr-2 h-4 w-4" />
                   <span className="truncate">{getSentimentTriggerText()}</span>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                 <DropdownMenuLabel>Show Sentiments</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {ALL_SENTIMENTS.map(sentiment => (
                   <DropdownMenuCheckboxItem
                     key={sentiment}
                     checked={selectedSentiments.includes(sentiment)}
                     onCheckedChange={() => handleSentimentSelect(sentiment)}
                     onSelect={(e) => e.preventDefault()} // Prevent closing on check
                   >
                     {sentiment}
                   </DropdownMenuCheckboxItem>
                 ))}
               </DropdownMenuContent>
             </DropdownMenu>
           </div>
         </div>


        {/* Apply Button (Aligned to bottom in its grid cell) */}
        <Button
          onClick={handleApplyFilters}
          disabled={isLoading}
          className="rounded-xl text-white bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] hover:shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-70 w-full lg:w-auto lg:self-end"
        >
          <Check className="w-4 h-4 mr-2" />
          {isLoading ? "Applying..." : "Apply Filters"}
        </Button>
      </div>
    </Card>
  );
}