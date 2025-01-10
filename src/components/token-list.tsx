import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getChainFromCommunityOrCookie } from "@/lib/openformat";
import { timeAgo } from "@/lib/utils";
import { ExternalLinkIcon, HelpCircle } from "lucide-react";
import Link from "next/link";

interface TokenListProps {
  tokens: Token[];
}

export default async function TokenList({ tokens }: TokenListProps) {
  const chain = await getChainFromCommunityOrCookie();
  const tokenTypes = {
    Base: "ERC20",
    Point: "Points",
  };

  if (tokens?.length === 0) {
    return <div>No tokens found</div>;
  }

  // @TODO: Ask dev team why subgraph can't sort tokens by createdAt
  const sortedTokens = [...tokens].sort(
    (a, b) => Number.parseInt(b.token.createdAt) - Number.parseInt(a.token.createdAt)
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>ID</TableHead>
          <TableHead className="flex items-center gap-xs">
            Type
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>ERC20: Standard fungible token</p>
                  <p>Points: Non-transferable community points</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTokens.map((token) => (
          <TableRow key={token.id}>
            <TableCell>{token.token.name}</TableCell>
            <TableCell className="flex items-center gap-2">
              {token.token.id}
              {chain?.BLOCK_EXPLORER_URL && (
                <Link
                  href={`${chain.BLOCK_EXPLORER_URL}/token/${token.token.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                </Link>
              )}
            </TableCell>
            <TableCell>{tokenTypes[token.token.tokenType as keyof typeof tokenTypes]}</TableCell>
            <TableCell>{timeAgo(Number.parseInt(token.token.createdAt))}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
