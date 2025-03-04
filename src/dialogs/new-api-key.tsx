import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {CopyIcon, Loader2, X} from "lucide-react";
import * as React from "react";
import {useApiKey} from "@/hooks/useApikey";

interface NewApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewApiKeyDialog({
                                          open,
                                          onOpenChange,
                                        }: NewApiKeyDialogProps) {
  const t = useTranslations("profile");

  const {
    apiKey,
    generateNewApiKey,
    processing,
    resetState,
    error,
    copyApiKeyToClipboard,
  } = useApiKey();

  function closeDialog() {
    resetState();
    onOpenChange(true);
  }

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogClose
          onClick={closeDialog}
          className="absolute z-50 right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4"/>
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>{t("apiKey.newApiKey")}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-4">
          {t("apiKey.description")}
        </DialogDescription>
        {error ? <p className="text-destructive">{t("apiKey.error")}</p> : ""}
        <div>
          {apiKey.toString() === "" ? (
            processing ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                {t("apiKey.creatingApiKey")}
              </Button>
            ) : (
              <Button type="submit" onClick={generateNewApiKey}>
                {t("apiKey.createApiKey")}
              </Button>
            )
          ) : (
            <div onClick={copyApiKeyToClipboard}>
              <DialogDescription className="space-y-4">
                {t("apiKey.yourNewApiKey")}
              </DialogDescription>
              <span className="flex">
                {apiKey}
                <CopyIcon className="ml-2"/>
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
