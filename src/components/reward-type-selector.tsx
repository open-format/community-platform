"use client";

import { AsteriskIcon, Award, Check, ChevronsUpDown, CircleDollarSign } from "lucide-react";
import * as React from "react";
import { useTranslations } from 'next-intl';

import { Button } from "@/components/ui/button";
import {
  Command, CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { isAddress } from "viem";

enum RewardTokenType {
  ALL = "All",
  BADGE = "Badge",
  TOKEN = "Token",
}

export default function RewardTypeSelector({
  value,
  onChange,
  onSelectedItemChange,
  includeAllOption,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelectedItemChange?: (value: string) => void;
  includeAllOption?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const t = useTranslations('rewardTypeSelector');

  React.useEffect(() => {
    if (value && 
        !(includeAllOption && value == RewardTokenType.ALL) &&
        value !== RewardTokenType.BADGE && 
        value !== RewardTokenType.TOKEN) {
      onChange("");
    }
  }, [value, onChange, includeAllOption]);

  const handleSelect = (currentValue: string) => {
    console.log('HandleSelect - Current:', currentValue);
    console.log('HandleSelect - Previous:', value);
    
    // Always update with the new value
    onChange(currentValue);

    if (onSelectedItemChange) {
      onSelectedItemChange(currentValue);
    }

    setOpen(false);
  };

  const handleCustomInput = (input: string) => {
    if (includeAllOption && input === RewardTokenType.ALL) {
      onChange(input);
      setOpen(false);
    } else if (isAddress(input)) {
      onChange(input.toLowerCase());
      setOpen(false);
    }
  };

  const getDisplayValue = () => {
    console.log('GetDisplayValue - Current Value:', value);

    if (value == RewardTokenType.BADGE) {
      return t('badgeName');
    }

    if (value == RewardTokenType.TOKEN) {
      return t('tokenName');
    }

    if (includeAllOption && value === 'All') {
      return t('allName');
    }

    return t('searchPlaceholder');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between flex-1">
          {getDisplayValue()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandList>
            {includeAllOption && <CommandGroup>
                <CommandItem key={'all-ts-n-bs'} value={RewardTokenType.ALL} onSelect={() => handleSelect(RewardTokenType.ALL)}>
                  <AsteriskIcon className={cn("mr-2 h-4 w-4","opacity-100")} />
                  {t('allName')}
                  <Check className={cn("ml-auto h-4 w-4",value === 'All' ? "opacity-100" : "opacity-0")} />
                </CommandItem>

                <CommandItem key={'badges-item'} value={RewardTokenType.BADGE} onSelect={() => handleSelect(RewardTokenType.BADGE)}>
                  <CircleDollarSign className={cn("mr-2 h-4 w-4",value === RewardTokenType.BADGE ? "opacity-100" : "opacity-40")} />
                  {t('badgeName')}
                  <Check className={cn("ml-auto h-4 w-4",value === RewardTokenType.BADGE ? "opacity-100" : "opacity-0")} />
                </CommandItem>

                <CommandItem key={'tokens-item'} value={RewardTokenType.TOKEN} onSelect={() => handleSelect(RewardTokenType.TOKEN)}>
                  <Award className={cn("mr-2 h-4 w-4", value === RewardTokenType.TOKEN ? "opacity-100" : "opacity-40")} />
                  {t('tokenName')}
                  <Check className={cn("ml-auto h-4 w-4", value === RewardTokenType.TOKEN ? "opacity-100" : "opacity-0")} />
                </CommandItem>

            </CommandGroup>}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
