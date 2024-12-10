"use client";

import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { JOURNEY_ITEMS } from "@/dummy_data";
import { timeAgo } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export default function Activity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Journey</CardTitle>
      </CardHeader>
      <CardContent>
        {JOURNEY_ITEMS.map((item, index) => (
          <div key={item.id}>
            <div className="flex items-center space-x-4 py-2">
              <Avatar className="h-9 w-9">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                  <MessageCircle className="h-4 w-4" />
                </div>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{item.action}</p>
                <p className="text-sm text-muted-foreground">{timeAgo(item.date)}</p>
              </div>
            </div>
            {index < JOURNEY_ITEMS.length - 1 && <Separator className="my-2" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
