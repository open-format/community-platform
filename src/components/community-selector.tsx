"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchAllCommunities } from "@/lib/openformat";
import { cn } from "@/lib/utils";

export default function CommunitySelector() {
  const [open, setOpen] = React.useState(false);
  const [communities, setCommunities] = React.useState<any[]>([]);
  const params = useParams();
  const router = useRouter();
  const currentSlug = params?.slug as string;

  const getCurrentPath = () => {
    if (typeof window === "undefined") return "overview";
    const pathSegments = window.location.pathname.split("/");
    if (pathSegments.length <= 2) return "overview";
    const currentTab = pathSegments[pathSegments.length - 1];
    return currentTab === params.slug ? "overview" : currentTab;
  };

  React.useEffect(() => {
    async function loadCommunities() {
      const data = await fetchAllCommunities();
      if (data) {
        setCommunities(data);
      }
    }
    loadCommunities();
  }, []);

  return (
    <div className="flex items-center">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/communities">Communities</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between font-bold capitalize"
                >
                  {currentSlug
                    ? communities.find((community) => community.id === currentSlug)?.name ?? "Loading..."
                    : "Select community..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search communities..." />
                  <CommandList>
                    <CommandEmpty>No communities found.</CommandEmpty>
                    <CommandGroup>
                      {communities.map((community) => (
                        <CommandItem
                          key={community.id}
                          value={community.name}
                          onSelect={() => {
                            router.push(`/communities/${community.id}/${getCurrentPath()}`);
                            setOpen(false);
                          }}
                          className="font-bold capitalize"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              community.metadata?.slug === currentSlug ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {community.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
