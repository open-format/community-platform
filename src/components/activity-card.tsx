"use client";

import { useTranslations } from 'next-intl';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import RefreshButton from "./refresh-button";
import Activity from "./activity";
import { ActivityExportForm } from '@/forms/activity-export-form';
import { useState } from 'react';

interface ActivityCardProps {
  community: Community;
}

export default function ActivityCard({ community }: ActivityCardProps) {
  const t                                     = useTranslations('overview');
  const [openExportForm, setOpenExportForm]   = useState(false);
  
  return (
    <>
      <Card variant="borderless">
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <h1>{t("activity.title")}</h1>
            <RefreshButton />
          </div>
          <Button onClick={(e) => {
            e.preventDefault();
            setOpenExportForm(true);
          }}>
            {t("activity.export")}
          </Button>
        </div>
        <CardDescription>{t("activity.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Activity rewards={community?.rewards || []} showUserAddress={true} />
      </CardContent>
    </Card>
    <ActivityExportForm open={openExportForm} close={()=>{setOpenExportForm(false)}} community={community} />
  </>
);
}
