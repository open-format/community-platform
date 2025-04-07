"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

type ActionType = 'discord' | 'view-report' | 'command';// command currently not used

interface Action {
  title: string;
  description: string;
  isComingSoon?: boolean;
  action?: {
    type: ActionType;
    label: string;
  };
}

const ACTIONS: Action[] = [
  {
    title: "Chat to your agent in discord",
    description: "Find out more about what has been happening",
    action: {
      type: "discord",
      label: "Open Discord"
    }
  },
  {
    title: "View report",
    description: "Get a summary of your community every week",
    action: {
      type: "view-report",
      label: "View report"
    }
  },
  {
    title: "Reward users directly in discord",
    description: "Use / commands to reward users",
    action: {
      type: "command",
      label: "Send rewards"
    }
  },
  {
    title: "Set up automated rewards",
    description: "Get reward suggestions based on the past activity",
    isComingSoon: true
  },
  {
    title: "Train your agent",
    description: "Train your agent to better understand who to reward",
    isComingSoon: true
  },
  {
    title: "Enable Yolo mode",
    description: "Coming soon",
    isComingSoon: true
  }
];

export function NextSteps() {
  const t = useTranslations("ImpactReports.nextSteps");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ACTIONS.map((step) => (
            <div key={step.title} className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-medium">{t(`actions.${step.action?.type || 'comingSoon'}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`actions.${step.action?.type || 'comingSoon'}.description`)}</p>
              </div>
              {step.isComingSoon ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{t("comingSoon")}</span>
                </div>
              ) : step.action ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    switch (step.action?.type) {
                      case 'discord':
                        // Open Discord
                        window.open('https://discord.com', '_blank');
                        break;
                      case 'view-report':
                        // Handle view report action
                        break;
                      case 'command':
                        // Handle command action
                        break;
                    }
                  }}
                >
                  {step.action.type === 'discord' && <ExternalLink className="h-4 w-4" />}
                  {step.action.type === 'command' && <Sparkles className="h-4 w-4" />}
                  {t(`actions.${step.action.type}.button`)}
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 