"use client";

import { ChevronsUpDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import { fetchAllCommunities } from "@/lib/openformat";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

export default function CommunitySelector() {
  const [open, setOpen] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const chain = useCurrentChain();
  const router = useRouter();
  const currentSlug = params?.slug as string;
  const chainName = params?.chainName as string;
  const t = useTranslations('communitySelector');

  const getCurrentPath = () => {
    if (typeof window === "undefined") return "overview";
    const pathSegments = window.location.pathname.split("/");
    if (pathSegments.length <= 2) return "overview";
    const currentTab = pathSegments[pathSegments.length - 1];
    return currentTab === params.slug ? "overview" : currentTab;
  };

  useEffect(() => {
    async function loadCommunities() {
      setIsLoading(true);
      try {
        const communities = await fetchAllCommunities(chainName);
        if (communities?.data) {
          setCommunities(communities.data);
        }
      } catch (error) {
        console.error("Failed to load communities:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCommunities();
  }, [chainName]);

  if (isLoading) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between font-bold capitalize"
        >
          {currentSlug
            ? communities.find((community) => community.id === currentSlug)?.name ?? t('loading')
            : t('selectCommunity')}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={t('searchPlaceholder')} />
          <CommandList>
            <CommandEmpty>{t('noResults')}</CommandEmpty>
            <CommandGroup>
              {communities.map((community) => (
                <CommandItem
                  key={community.id}
                  value={community.name}
                  onSelect={() => {
                    router.push(`/${chainName}/communities/${community.id}/${getCurrentPath()}`);
                    setOpen(false);
                  }}
                  className="font-bold capitalize pl-4"
                >
                  {community.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
