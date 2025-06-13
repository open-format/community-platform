"use client";

import {
  AlertCircle,
  AsteriskIcon,
  Award,
  Check,
  ChevronsUpDown,
  CircleDollarSign,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { isAddress } from "viem";

export default function TokenSelector({
  tokens,
  badges,
  value,
  onChange,
  onTokenTypeChange,
  includeAllOption,
  forceModal,
}: {
  tokens: Token[];
  badges: Badge[];
  value: string;
  onChange: (value: string) => void;
  onTokenTypeChange?: (isBadge: boolean, value: string) => void;
  includeAllOption?: boolean;
  forceModal?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const t = useTranslations("tokenSelector");

  React.useEffect(() => {
    if (
      value &&
      !(includeAllOption && value === "All") &&
      !tokens.some((token) => token.token.id === value) &&
      !(badges && badges.some((badge) => badge.id === value))
    ) {
      onChange("");
    }
  }, [tokens, badges, value, onChange, includeAllOption]);

  const handleSelect = (currentValue: string) => {
    // Always update with the new value
    onChange(currentValue);

    if (onTokenTypeChange) {
      const isBadge = badges && badges.some((badge) => badge.id === currentValue);
      console.log("Is Badge:", isBadge);
      onTokenTypeChange(isBadge, currentValue);
    }

    setOpen(false);
  };

  const handleCustomInput = (input: string) => {
    if (includeAllOption && input === "All") {
      onChange(input);
      setOpen(false);
    } else if (isAddress(input)) {
      onChange(input.toLowerCase());
      setOpen(false);
    }
  };

  const getDisplayValue = () => {
    // Debug the display value calculation
    const selectedBadge = badges && badges.find((badge) => badge.id === value);
    const selectedToken = tokens.find((item) => item.token?.id === value);

    if (selectedBadge) {
      return selectedBadge.name;
    }

    if (selectedToken) {
      return `${selectedToken.token?.name} (${selectedToken.token?.id})`;
    }

    if (isAddress(value)) {
      return value;
    }

    if (includeAllOption && value === "All") {
      return t("allName");
    }

    return t("searchPlaceholder");
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={forceModal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between flex-1"
        >
          {getDisplayValue()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-sm font-medium mb-2">{t("noTokens")}</p>
                <p className="text-xs text-muted-foreground mb-4">{t("youCan")}:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>{t("enterAddress")}</li>
                  <li>{t("createNew")}</li>
                </ul>
              </div>
            </CommandEmpty>
            {includeAllOption && (
              <CommandGroup heading={t("allHeading")}>
                <CommandItem
                  key={"all-tokens-and-badges-item"}
                  value={"All"}
                  onSelect={() => handleSelect("All")}
                >
                  <AsteriskIcon className={cn("mr-2 h-4 w-4", "opacity-100")} />
                  {t("allName")}
                  <Check
                    className={cn("ml-auto h-4 w-4", value === "All" ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading={t("tokens")}>
              {tokens.map((item) => (
                <CommandItem
                  key={item.token.id}
                  value={item.token.name}
                  onSelect={() => handleSelect(item.token.id)}
                >
                  <CircleDollarSign
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.token.id ? "opacity-100" : "opacity-40",
                    )}
                  />
                  {item.token.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === item.token.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            {badges && badges.length > 0 && (
              <CommandGroup heading={t("badges")}>
                {badges.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => handleSelect(item.id)}
                  >
                    <Award
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.id ? "opacity-100" : "opacity-40",
                      )}
                    />
                    {item.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === item.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
