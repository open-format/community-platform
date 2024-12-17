"use client";

import { startTransition } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { isSlugAvailable, updateCommunity } from "@/db/queries/communities";
import { revalidate } from "@/lib/openformat";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CommunityConfigForm({ community }: { community: Community }) {
  const FormSchema = z.object({
    title: z.string().min(3).max(32),
    description: z.string().min(3),
    primary_color: z.string().min(3),
    slug: z
      .string()
      .min(3)
      .max(32)
      .transform((value) =>
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      ),
    secondary_color: z.string().min(3),
    logo_url: z.string().min(3),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: community.pageConfiguration?.title ?? "",
      description: community.pageConfiguration?.description ?? "",
      primary_color: community.pageConfiguration?.primary_color ?? "#000000",
      slug: community.pageConfiguration?.slug ?? "",
      secondary_color: community.pageConfiguration?.secondary_color ?? "#FFFFFF",
      logo_url: community.pageConfiguration?.logo_url ?? "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  function handleFormSubmission(data: z.infer<typeof FormSchema>) {
    startTransition(async () => {
      try {
        await updateCommunity(community.id, data);
        toast.success("Community updated successfully");
        await revalidate();
      } catch (err) {
        console.error(err);
      }
    });
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-4" onSubmit={form.handleSubmit(handleFormSubmission)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>The name of your community.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Describe your community" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>A brief description of what your community is about.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="community-name"
                  {...field}
                  onBlur={async (e) => {
                    const transformed = e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    field.onChange(transformed);

                    if (transformed === community.pageConfiguration.slug) return;

                    const isAvailable = await isSlugAvailable(transformed, community.id);
                    if (!isAvailable) {
                      form.setError("slug", {
                        message: "This slug is already taken. Please choose another.",
                      });
                    } else {
                      form.clearErrors("slug");
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>The URL-friendly version of your community name.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primary_color"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Primary Color</FormLabel>
              <FormControl>
                <Input type="color" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>Main color for your community theme.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="secondary_color"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Secondary Color</FormLabel>
              <FormControl>
                <Input type="color" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>Accent color for your community theme.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>URL to your community logo image.</FormDescription>
            </FormItem>
          )}
        />

        {isSubmitting ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </Button>
        ) : (
          <Button disabled={!form.formState.isValid} type="submit">
            Update
          </Button>
        )}
      </form>
    </Form>
  );
}
