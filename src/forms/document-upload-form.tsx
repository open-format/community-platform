"use client";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { uploadDocuments } from "@/lib/openformat";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

export default function DocumentUploadForm({ communitySlug }: { communitySlug: string }) {
  const t = useTranslations("agents");
  const [isUploading, setIsUploading] = useState(false);

  // Zod schema for form validation
  const documentUploadSchema = z.object({
    documents: z
      .instanceof(FileList)
      .refine((files) => files.length > 0, { message: t("form.validation.documentsRequired") }),
  });

  // Form hook with zod resolver
  const form = useForm<z.infer<typeof documentUploadSchema>>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      documents: undefined,
    },
  });

  // Submit handler
  const onSubmit = async (data: z.infer<typeof documentUploadSchema>) => {
    setIsUploading(true);
    const fileArray = Array.from(data.documents);

    try {
      const response = await uploadDocuments(fileArray, communitySlug);

      if (response) {
        toast.success("Documents uploaded successfully");
        form.reset(); // Reset form after successful upload
      }
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error("Failed to upload documents");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="documents"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>{t("fileUpload")}</FormLabel>
              <FormControl>
                <div className="flex flex-col items-center justify-center w-full">
                  <label
                    htmlFor="document-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-gray-500 mb-3" />
                      <p className="mb-2 text-sm text-gray-500">{t("uploadPrompt")}</p>
                      <Input
                        id="document-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.txt,.md,.docx,.mdx"
                        multiple
                        {...field}
                        onChange={(e) => {
                          onChange(e.target.files);
                        }}
                      />
                    </div>
                  </label>
                  {value && value.length > 0 && (
                    <div className="mt-2 w-full">
                      <p className="text-sm text-gray-600">Selected files:</p>
                      <ul className="list-disc list-inside text-sm">
                        {Array.from(value).map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isUploading || !form.formState.isValid}>
          {isUploading ? t("uploading") : t("upload")}
        </Button>
      </form>
    </FormProvider>
  );
}
