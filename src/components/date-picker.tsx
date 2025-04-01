import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  onDateChange: (date: DateRange | undefined) => void;
}

export default function DatePickerWithPresets({onDateChange}: DatePickerProps) {
  const today = new Date();
  const t = useTranslations( "overview.leaderboard" );
  const [date, setDate] = useState<DateRange | undefined>( {
    from: new Date( new Date().setDate( today.getDate() - 7 ) ),
    to: new Date(),
  } );
  const [preset, setPreset] = useState<string>( "5" );
  const [startMonth, setStartMonth] = useState( new Date( new Date().setDate( today.getDate() - 30 ) ) );
  const [endMonth, setEndMonth] = useState( new Date() );
  const presets = {
    "0": "Last month",
    "1": "This month",
    "2": "Three months",
    "3": "All time",
    "4": "Custom",
    "5": "Last week",
  };

  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate( d.getDate() - Math.abs( n ) );
    return d;
  };

  const onDayClick = (day: DateRange | undefined) => {
    setDate( day );
    setPreset( "4" );
  };

  useEffect( () => {
    if (date?.to && date.from && onDateChange) {
      onDateChange( date );
    }
  }, [date] );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon/>
          {date?.from ? (
            date.to ? (
              <>
                {format( date.from, "LLL dd, y" )} -{" "}
                {format( date.to, "LLL dd, y" )}
              </>
            ) : (
              format( date.from, "LLL dd, y" )
            )
          ) : (
            <span>{t( "datePicker.pickDate" )}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex w-auto flex-col space-y-2 p-2"
      >
        <Select
          value={preset}
          onValueChange={(value) => {
            if (value === "0") {
              const newFrom = daysAgo( 30 );
              const newDate: DateRange = {
                from: newFrom,
                to: today,
              };
              setDate( newDate );
              setStartMonth( newFrom );
              setEndMonth( today );
              setPreset( "0" );
            } else if (value === '1') {
              const thisMonth = new Date( today.getFullYear(), today.getMonth(), 1 );
              const newDate: DateRange = {
                from: thisMonth,
                to: today,
              };
              setDate( newDate );
              setStartMonth( thisMonth );
              setPreset( "1" );
            } else if (value === "2") {
              const newFrom = daysAgo( 90 );
              const newDate: DateRange = {
                from: newFrom,
                to: today,
              };
              setDate( newDate );
              setStartMonth( newFrom )
              setEndMonth( today );
              setPreset( "2" );
            } else if (value === "3") {
              const newDate: DateRange = {
                from: new Date( 2022, 3, 2 ),
                to: today,
              };
              setDate( newDate );
              setStartMonth( new Date( 2022, 3, 2 ) )
              setEndMonth( today );
              setPreset( "3" );
            } else if (value === "5") {
              const newFrom = daysAgo( 7 );
              const newDate: DateRange = {
                from: newFrom,
                to: today,
              };
              setDate( newDate );
              setStartMonth( newFrom )
              setEndMonth( today );
              setPreset( "5" );
            }
          }
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={presets[preset]}/>
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="4">{t( "datePicker.custom" )}</SelectItem>
            <SelectItem value="5">{t( "datePicker.lastWeek" )}</SelectItem>
            <SelectItem value="1">{t( "datePicker.thisMonth" )}</SelectItem>
            <SelectItem value="0">{t( "datePicker.lastMonth" )}</SelectItem>
            <SelectItem value="2">{t( "datePicker.threeMonths" )}</SelectItem>
            <SelectItem value="3">{t( "datePicker.allTime" )}</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <Calendar
            initialFocus={true}
            mode="range"
            month={startMonth}
            endMonth={endMonth}
            selected={date}
            onSelect={onDayClick}
            onMonthChange={setStartMonth}
            numberOfMonths={2}
            required
            disabled={{after: new Date(), before: new Date( 2022, 3, 2 )}}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
};