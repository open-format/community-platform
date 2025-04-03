import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

interface DatePickerProps {
  onDateChange: (date: DateRange | undefined) => void;
}

export default function DatePickerWithPresets({ onDateChange }: DatePickerProps) {
  const t = useTranslations("overview.leaderboard");
  const [date, setDate] = useState<DateRange | undefined>({
    from: dayjs().subtract(6, "day").toDate(),
    to: dayjs().endOf("day").toDate(),
  });

  useEffect(() => {
    if (date?.to && date.from && onDateChange) {
      onDateChange({ from: date.from, to: new Date(date.to.setHours(23, 59, 59, 999)) });
    }
  }, [date]);

  function handlePresetChange(value: string) {
    setDate({
      from: dayjs().subtract(Number.parseInt(value), "day").toDate(),
      to: dayjs().endOf("day").toDate(),
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon />
          {date?.from ? (
            dayjs(date.from).format("MMM DD, YYYY") +
            (date.to ? ` - ${dayjs(date.to).format("MMM DD, YYYY")}` : "")
          ) : (
            <span>{t("datePicker.pickDate")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-auto flex-col space-y-2 p-2">
        <Select onValueChange={handlePresetChange} defaultValue="6">
          <SelectTrigger>
            <SelectValue placeholder={t("datePicker.pickDate")} />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="0">{t("datePicker.today")}</SelectItem>
            <SelectItem value="6">{t("datePicker.last7Days")}</SelectItem>
            <SelectItem value="29">{t("datePicker.last30Days")}</SelectItem>
            <SelectItem value="89">{t("datePicker.last90Days")}</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <Calendar
            initialFocus={true}
            mode="range"
            selected={date}
            defaultMonth={date?.from}
            onSelect={setDate}
            numberOfMonths={2}
            disabled={{ after: new Date(), before: new Date(2022, 3, 2) }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
