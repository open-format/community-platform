import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getChainFromCommunityOrCookie } from "@/lib/openformat";
import { timeAgo } from "@/lib/utils";
import { ExternalLinkIcon, HelpCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

interface TokenListProps {
  tokens: Token[];
  hiddenTokens?: string[];
}

export default async function TokenList({ tokens, hiddenTokens = [] }: TokenListProps) {
  const chain = await getChainFromCommunityOrCookie();
  const t = await getTranslations("tokens");
  const tokenTypes = {
    Base: "ERC20",
    Point: "Points",
  };

  const visibleTokens = tokens.filter((token) => !hiddenTokens.includes(token.token.id));

  if (visibleTokens.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">{t("noTokens")}</div>;
  }

  const sortedTokens = [...visibleTokens].sort(
    (a, b) => Number.parseInt(b.token.createdAt) - Number.parseInt(a.token.createdAt),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("id")}</TableHead>
          <TableHead className="flex items-center gap-xs">
            {t("type")}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("tooltips.erc20")}</p>
                  <p>{t("tooltips.points")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableHead>
          <TableHead>{t("created")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTokens.map((token) => (
          <TableRow key={token.token.id}>
            <TableCell>
              <div className="font-medium">{token.token.name}</div>
              <div className="text-sm text-muted-foreground">{token.token.symbol}</div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{token.token.id}</span>
                <Link
                  href={`${chain.BLOCK_EXPLORER_URL}/token/${token.token.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={t("ariaLabels.viewToken", { name: token.token.name })}
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                </Link>
              </div>
            </TableCell>
            <TableCell>{tokenTypes[token.token.tokenType as keyof typeof tokenTypes]}</TableCell>
            <TableCell>{timeAgo(Number(token.token.createdAt))}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
