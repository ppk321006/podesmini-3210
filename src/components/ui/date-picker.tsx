
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface DatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
  setDate?: React.Dispatch<React.SetStateAction<Date>>;
  disableFutureDates?: boolean;
}

export function DatePicker({
  date,
  onSelect,
  disabled,
  className,
  setDate,
  disableFutureDates = false
}: DatePickerProps) {
  // Handle both callback patterns
  const handleSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate);
    if (setDate && selectedDate) {
      setDate(selectedDate);
    }
  };

  // Function to check if a date should be disabled
  const isDateDisabled = (date: Date) => {
    if (disableFutureDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date > today;
    }
    return false;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"} ${className}`}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: id }) : "Pilih tanggal"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={isDateDisabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
