"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { updateTokenVisibility } from "@/db/queries/tokens";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import { timeAgo } from "@/lib/utils";
import { ExternalLinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";

interface TokenVisibilityManagerProps {
  tokens: any[];
  communityId: string;
  hiddenTokens: string[];
}

export function TokenVisibilityManager({
  tokens,
  communityId,
  hiddenTokens,
}: TokenVisibilityManagerProps) {
  const t = useTranslations("tokens");

  const tokenTypes = {
    Base: "ERC20",
    Point: "Points",
  };

  const visibleTokens = tokens.filter((token) => !hiddenTokens.includes(token.token.id));
  const hiddenTokensList = tokens.filter((token) => hiddenTokens.includes(token.token.id));

  const handleToggleVisibility = async (tokenId: string, hidden: boolean) => {
    try {
      const result = await updateTokenVisibility(communityId, tokenId, hidden);
      if (result.success) {
        toast.success(hidden ? t("tokenHidden") : t("tokenUnhidden"));
      } else {
        toast.error(t("errorUpdatingVisibility"));
      }
    } catch (error) {
      toast.error(t("errorUpdatingVisibility"));
    }
  };

  const TokenRow = ({ token, isHidden }: { token: any; isHidden: boolean }) => {
    const chain = useCurrentChain();
    const isLastVisibleToken = !isHidden && visibleTokens.length === 1;

    return (
      <div key={token.token.id} className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-12">
          <div className="min-w-[200px]">
            <h3 className="font-medium">{token.token.name}</h3>
            <p className="text-sm text-muted-foreground">{token.token.symbol}</p>
          </div>
          <div className="min-w-[200px]">
            <span className="text-sm text-muted-foreground">{t("table.id")}:</span>
            <div className="flex items-center gap-2">
              {token.token.id}
              <Link
                href={`${chain?.BLOCK_EXPLORER_URL}/token/${token.token.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm hover:underline"
              >
                <ExternalLinkIcon className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
          <div className="min-w-[120px]">
            <span className="text-sm text-muted-foreground">{t("table.type")}:</span>
            <div>{tokenTypes[token.token.tokenType as keyof typeof tokenTypes]}</div>
          </div>
          <div className="min-w-[150px]">
            <span className="text-sm text-muted-foreground">{t("table.created")}:</span>
            <div>{timeAgo(Number(token.token.createdAt))}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleVisibility(token.token.id, !isHidden)}
                    disabled={isLastVisibleToken}
                  >
                    {isHidden ? t("unhideToken") : t("hideToken")}
                  </Button>
                </div>
              </TooltipTrigger>
              {isLastVisibleToken && (
                <TooltipContent>
                  <p>{t("atLeastOneVisibleToken")}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Visible Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>{t("visibleTokens")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visibleTokens.map((token) => (
              <TokenRow key={token.token.id} token={token} isHidden={false} />
            ))}
            {visibleTokens.length === 0 && (
              <p className="text-center text-muted-foreground py-4">{t("noVisibleTokens")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>{t("hiddenTokens")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hiddenTokensList.map((token) => (
              <TokenRow key={token.token.id} token={token} isHidden={true} />
            ))}
            {hiddenTokensList.length === 0 && (
              <p className="text-center text-muted-foreground py-4">{t("noHiddenTokens")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
