"use client";

import { startTransition } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { isSlugAvailable, updateCommunity } from "@/db/queries/communities";
import { revalidate } from "@/lib/openformat";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CommunityConfigForm({ community }: { community: Community }) {
  const FormSchema = z.object({
    title: z.string().min(0).max(32),
    description: z.string().min(3, "Description must be at least 3 characters").optional().or(z.literal("")),
    background_color: z.string().min(3),
    text_color: z.string().min(3),
    accent_color: z.string().min(3),
    button_color: z.string().min(3),
    slug: z
      .string()
      .min(1, "Slug is required")
      .transform((str) =>
        str
          .toLowerCase()
          .replace(/[^a-z0-9-_]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      ),
    logo_url: z
      .string()
      .optional()
      .refine((val) => {
        return !val || (val.startsWith("http") && val.match(/\.(jpg|jpeg|png|gif|webp)$/i));
      }, "Please provide a valid image URL"),
    show_social_handles: z.boolean().default(false),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: community.metadata?.title ?? "",
      description: community.metadata?.description ?? "",
      background_color: community.metadata?.background_color ?? "#000000",
      text_color: community.metadata?.text_color ?? "#FFFFFF",
      accent_color: community.metadata?.accent_color ?? "#6366F1",
      button_color: community.metadata?.button_color ?? "#6366F1",
      slug: community.metadata?.slug ?? "",
      logo_url: community.metadata?.logo_url ?? "",
      show_social_handles: community.metadata?.show_social_handles ?? false,
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

                    if (transformed === community.metadata.slug) return;

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

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="background_color"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Background Color</FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    {...field}
                    className="w-12 h-12 p-0 border-2 rounded-full overflow-hidden cursor-pointer"
                    style={{
                      backgroundColor: field.value,
                      appearance: "none",
                      WebkitAppearance: "none",
                    }}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>Main color for your community theme.</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="text_color"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Text Color</FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    {...field}
                    className="w-12 h-12 p-0 border-2 rounded-full overflow-hidden cursor-pointer"
                    style={{
                      backgroundColor: field.value,
                      appearance: "none",
                      WebkitAppearance: "none",
                    }}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>Text color for your community theme.</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accent_color"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Accent Color</FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    {...field}
                    className="w-12 h-12 p-0 border-2 rounded-full overflow-hidden cursor-pointer"
                    style={{
                      backgroundColor: field.value,
                      appearance: "none",
                      WebkitAppearance: "none",
                    }}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>Accent color for your community theme.</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="button_color"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Button Color</FormLabel>
                <FormControl>
                  <Input
                    type="color"
                    {...field}
                    className="w-12 h-12 p-0 border-2 rounded-full overflow-hidden cursor-pointer"
                    style={{
                      backgroundColor: field.value,
                      appearance: "none",
                      WebkitAppearance: "none",
                    }}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>Button color for your community theme.</FormDescription>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Logo URL</FormLabel>
              {field.value && (
                <div className="mb-2">
                  <img
                    src={field.value}
                    alt="Logo preview"
                    className="h-20 w-20 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      form.setError("logo_url", {
                        message: "Unable to load image from URL. Please check the URL and try again.",
                      });
                    }}
                  />
                </div>
              )}
              <FormControl>
                <Input
                  placeholder="https://example.com/logo.png"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    form.clearErrors("logo_url");
                  }}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>Optional URL to your community logo image (JPG, PNG, GIF, or WebP).</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="show_social_handles"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Show Social Handles</FormLabel>
                <FormDescription>
                  Display social handles in the leaderboard when available (wallet addresses will be shown as fallback)
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
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
