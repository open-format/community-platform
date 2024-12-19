"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { upsertTiers } from "@/db/queries/tiers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

// Schema for form validation
const tierSchema = z.object({
  tiers: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      points_required: z.coerce
        .number({
          required_error: "Points are required",
          invalid_type_error: "Points are required",
        })
        .min(1, "Points must be at least 1"),
      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color hex code"),
      tier_id: z.string().optional(),
      community_id: z.string().optional(),
    })
  ),
});

type TierFormValues = z.infer<typeof tierSchema>;

export default function TiersForm({ communityId, tiers }: { communityId: string; tiers: Tier[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [deletedTierIds, setDeletedTierIds] = useState<string[]>([]);
  const [currentTiers, setCurrentTiers] = useState(tiers);

  const form = useForm<TierFormValues>({
    resolver: zodResolver(tierSchema),
    defaultValues: {
      tiers: currentTiers.map((tier) => ({
        name: tier.name,
        points_required: tier.points_required,
        color: tier.color,
        tier_id: tier.id,
        community_id: tier.community_id,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tiers",
  });

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Loading tiers...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-muted rounded-md" />
            <div className="h-10 bg-muted rounded-md" />
            <div className="h-10 bg-muted rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  function onSubmit(data: TierFormValues) {
    startTransition(async () => {
      try {
        const freshTiers = await upsertTiers(
          data.tiers.map((tier) => ({
            ...tier,
            community_id: communityId,
            ...(tier.tier_id ? { id: tier.tier_id } : {}),
          })),
          deletedTierIds
        );

        setDeletedTierIds([]);
        setCurrentTiers(freshTiers);
        form.reset({
          tiers: freshTiers.map((tier) => ({
            name: tier.name,
            points_required: tier.points_required,
            color: tier.color,
            tier_id: tier.id,
            community_id: tier.community_id,
          })),
        });
        router.refresh();
      } catch (error) {
        console.error("Error updating tiers:", error);
      }
    });
  }

  function handleDelete(index: number, tierId?: string) {
    if (tierId) {
      setDeletedTierIds((prev) => [...prev, tierId]);
    }
    remove(index);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4">
        {form.formState.errors.tiers?.message && (
          <div className="text-sm text-destructive mb-2">{form.formState.errors.tiers.message}</div>
        )}

        {fields.map((field, index) => (
          <div key={field.id}>
            <div className="flex gap-4">
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
                          message: "Tier name must be unique",
                        });
                      } else {
                        form.clearErrors(`tiers.${index}.name`);
                      }
                    },
                  })}
                  placeholder="Tier Name"
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
                  placeholder="Points Required"
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
                onClick={() => handleDelete(index, field.tier_id)}
                disabled={isPending}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: "", points_required: 0, color: "#000000" })}
          >
            Add Tier
          </Button>
          <Button type="submit" disabled={isPending}>
            Save Tiers
          </Button>
        </div>
      </div>
    </form>
  );
}
