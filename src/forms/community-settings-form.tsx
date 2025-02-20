"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from 'next-intl';

import CommunityPreview from "@/components/community-preview";
import TokenSelector from "@/components/token-selector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Chain } from "@/constants/chains";
import { isSlugAvailable, updateCommunity } from "@/db/queries/communities";
import { revalidate } from "@/lib/openformat";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CommunitySettingsForm({
  community,
  leaderboard,
  badges,
}: {
  community: Community;
  leaderboard: LeaderboardEntry[];
  badges: BadgeWithCollectedStatus[];
  chain: Chain;
}) {
  const t = useTranslations('settings.form');

  const FormSchema = z.object({
    title: z.string()
      .min(1, t('validation.titleRequired'))
      .max(32, t('validation.titleMax')),
    description: z.string()
      .min(3, t("validation.descriptionMin"))
      .max(2000, t("validation.descriptionMax"))
      .optional()
      .or(z.literal("")),
    accent_color: z.string().min(3),
    user_label: z.string().min(3),
    token_label: z.string().min(3),
    dark_mode: z.boolean().default(false),
    token_to_display: z.string().min(3),
    slug: z.string()
      .min(1, t('validation.slugRequired'))
      .transform((str) =>
        str
          .toLowerCase()
          .replace(/[^a-z0-9-_]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      ),
    banner_url: z
      .string()
      .optional()
      .refine((val) => {
        return !val || (val.startsWith("http") && val.match(/\.(jpg|jpeg|png|gif|webp)$/i));
      }, t('validation.invalidImageUrl')),
    show_social_handles: z.boolean().default(false),
    tiers: z.array(
      z.object({
        name: z.string().min(1, t('validation.nameRequired')),
        points_required: z.coerce
          .number({
            required_error: t('validation.pointsRequired'),
            invalid_type_error: t('validation.pointsRequired'),
          })
          .min(0, t('validation.pointsMin')),
        color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t('validation.invalidColorHex')),
        tier_id: z.string().optional(),
        community_id: z.string().optional(),
      })
    ),
  });

  type FormValues = z.infer<typeof FormSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: {
      title: community.metadata?.title ?? "",
      description: community.metadata?.description ?? "",
      accent_color: community.metadata?.accent_color ?? "#6366F1",
      user_label: community.metadata?.user_label ?? t('sections.language.fields.userLabel.defaultValue'),
      token_label: community.metadata?.token_label ?? t('sections.language.fields.tokenLabel.defaultValue'),
      slug: community.metadata?.slug ?? "",
      dark_mode: community.metadata?.dark_mode ?? false,
      banner_url: community.metadata?.banner_url ?? "",
      token_to_display: community.metadata.token_to_display ?? community.tokens[0]?.id,
      show_social_handles: community.metadata?.show_social_handles ?? false,
      tiers:
        community.metadata?.tiers?.map((tier) => ({
          name: tier.name,
          points_required: tier.points_required,
          color: tier.color,
          tier_id: tier.id,
          community_id: tier.community_id,
        })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tiers",
  });

  const {
    formState: { isSubmitting },
  } = form;

  function handleFormSubmission(data: FormValues) {
    startTransition(async () => {
      try {
        // Track deleted tiers
        const originalTierIds = new Set(community.metadata?.tiers?.map((tier) => tier.id) || []);
        const currentTierIds = new Set(
          data.tiers.map((tier) => tier.tier_id).filter((id): id is string => id !== undefined)
        );

        const deletedTierIds = Array.from(originalTierIds).filter((id) => !currentTierIds.has(id));

        await updateCommunity(community.id, {
          ...data,
          deletedTierIds,
        });

        toast.success(t('messages.updateSuccess'));
        await revalidate();
      } catch (err) {
        console.error(err);
        toast.error(t('messages.updateError'));
      }
    });
  }

  const previewValues = form.watch();

  return (
    <div className="grid grid-cols-3">
      <div className="col-span-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmission)}>
            <Accordion type="multiple" defaultValue={["general"]}>
              <AccordionItem value="general">
                <AccordionTrigger>{t('sections.general.title')}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sections.general.fields.name.label')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('sections.general.fields.name.placeholder')} 
                            {...field}
                            onBlur={(e) => {
                              field.onBlur();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>{t('sections.general.fields.name.description')}</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sections.general.fields.description.label')}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t('sections.general.fields.description.placeholder')} 
                            {...field}
                            onBlur={(e) => {
                              field.onBlur();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>{t('sections.general.fields.description.description')}</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sections.general.fields.slug.label')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('sections.general.fields.slug.placeholder')}
                            {...field}
                            onBlur={async (e) => {
                              field.onBlur();
                              const transformed = e.target.value
                                .toLowerCase()
                                .trim()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-+|-+$/g, "");
                              field.onChange(transformed);

                              // Only check availability if there's a value and it's different from current
                              if (transformed && transformed !== community.metadata.slug) {
                                const isAvailable = await isSlugAvailable(transformed, community.id);
                                if (!isAvailable) {
                                  form.setError("slug", {
                                    message: t('messages.slugTaken'),
                                  });
                                }
                                // Only clear errors if we're checking availability
                                else if (form.getFieldState('slug').error?.message === t('messages.slugTaken')) {
                                  form.clearErrors("slug");
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>{t('sections.general.fields.slug.description')}</FormDescription>
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="appearance">
                <AccordionTrigger>{t('sections.appearance.title')}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dark_mode"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-4">
                        <FormLabel>{t('sections.appearance.fields.darkMode.label')}</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>{t('sections.appearance.fields.darkMode.description')}</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accent_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sections.appearance.fields.accentColor.label')}</FormLabel>
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
                        <FormDescription>{t('sections.appearance.fields.accentColor.description')}</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="banner_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sections.appearance.fields.bannerImage.label')}</FormLabel>
                        {field.value && (
                          <div className="mb-2">
                            <img
                              src={field.value}
                              alt={t('sections.appearance.fields.bannerImage.altText')}
                              className="h-20 w-20 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                form.setError("banner_url", {
                                  message: t('messages.imageLoadError'),
                                });
                              }}
                            />
                          </div>
                        )}
                        <FormControl>
                          <Input
                            placeholder={t('sections.appearance.fields.bannerImage.placeholder')}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.clearErrors("banner_url");
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          {t('sections.appearance.fields.bannerImage.description')}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="show_social_handles"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t('sections.appearance.fields.socialHandles.label')}</FormLabel>
                          <FormDescription>
                            {t('sections.appearance.fields.socialHandles.description')}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="language">
                <AccordionTrigger>{t('sections.language.title')}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="user_label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sections.language.fields.userLabel.label')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>{t('sections.language.fields.userLabel.description')}</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="token_label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sections.language.fields.tokenLabel.label')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>{t('sections.language.fields.tokenLabel.description')}</FormDescription>
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tiers">
                <AccordionTrigger>{t('sections.tiers.title')}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4">
                      <div className="flex flex-col flex-1">
                        <Input
                          {...form.register(`tiers.${index}.name`, {
                            onBlur: () => {
                              const values = form.getValues("tiers");
                              const currentName = values[index].name.toLowerCase();
                              const duplicateExists = values.some(
                                (tier, i) => i !== index && tier.name.toLowerCase() === currentName
                              );

                              if (duplicateExists) {
                                form.setError(`tiers.${index}.name`, {
                                  type: "manual",
                                  message: t('messages.tierNameUnique'),
                                });
                              } else {
                                form.clearErrors(`tiers.${index}.name`);
                              }
                            },
                          })}
                          placeholder={t('sections.tiers.fields.name.placeholder')}
                        />
                        {form.formState.errors.tiers?.[index]?.name?.message && (
                          <span className="text-sm text-destructive mt-1">
                            {form.formState.errors.tiers[index]?.name?.message}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col flex-1">
                        <Input
                          {...form.register(`tiers.${index}.points_required`, {
                            valueAsNumber: true,
                          })}
                          type="number"
                          placeholder={t('sections.tiers.fields.points.placeholder')}
                        />
                        {form.formState.errors.tiers?.[index]?.points_required?.message && (
                          <span className="text-sm text-destructive mt-1">
                            {form.formState.errors.tiers[index]?.points_required?.message}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <Input {...form.register(`tiers.${index}.color`)} type="color" className="w-20" />
                        {form.formState.errors.tiers?.[index]?.color?.message && (
                          <span className="text-sm text-destructive mt-1">
                            {form.formState.errors.tiers[index]?.color?.message}
                          </span>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={isSubmitting}
                      >
                        {t('buttons.remove')}
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ name: "", points_required: 0, color: "#000000" })}
                  >
                    {t('buttons.addTier')}
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tokens">
                <AccordionTrigger>{t('sections.tokens.title')}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Tiers Token */}
                  {/* Token */}
                  <FormField
                    control={form.control}
                    name="token_to_display"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormDescription>{t('sections.tokens.description')}</FormDescription>
                        <FormControl>
                          <TokenSelector
                            tokens={community.tokens}
                            badges={[]}
                            value={field.value}
                            onChange={field.onChange}
                            defaultValue={form.getValues("token_to_display")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex py-4">
              {isSubmitting ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('buttons.updating')}
                </Button>
              ) : (
                <Button type="submit">
                  {t('buttons.update')}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
      <div className="col-span-2">
        <CommunityPreview
          community={community}
          previewValues={previewValues}
          leaderboard={leaderboard}
          badges={badges}
        />
      </div>
    </div>
  );
}
