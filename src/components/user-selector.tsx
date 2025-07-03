"use client";
import { findUserByHandle } from "@/lib/privy";
import { cn } from "@/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { isAddress } from "viem";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface User {
	type?: "discord" | "telegram" | "github";
	wallet: string;
	username: string;
	discordUserId?: string;
}

interface UserSelectorProps {
	field: ControllerRenderProps<Record<string, unknown>, "user">;
	onUserFound?: (userData: {
		wallet: string;
		discordUserId?: string;
		discordUsername?: string;
		platform?: "discord" | "telegram" | "github";
	}) => void;
}

export default function UserSelector({
	field,
	onUserFound,
}: UserSelectorProps) {
	const [displayValue, setDisplayValue] = useState<string>(field.value || "");
	const [userState, setUserState] = useState<{
		status: "idle" | "loading" | "exists" | "not_found";
		data: User | null;
	}>({ status: "idle", data: null });
	const t = useTranslations("userSelector");

	// @TODO Add more icons when we support more platforms in getUserByHandle
	function renderIcon(type: "discord" | "telegram" | "github") {
		if (type === "discord") {
			return (
				<Image
					src="/icons/discord.svg"
					alt={t("icons.discord")}
					width={20}
					height={20}
				/>
			);
		}
		return (
			<Image
				src="/icons/discord.svg"
				alt={t("icons.telegram")}
				width={20}
				height={20}
			/>
		);
	}

	return (
		<div className="flex space-x-2">
			<div className="relative w-full">
				<div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
					{userState.data?.type && renderIcon(userState.data.type)}
				</div>
				<Input
					{...field}
					value={displayValue}
					className={cn("", { "pl-2xl": userState.data?.type })}
					placeholder={t("inputPlaceholder")}
					onChange={(e) => {
						setDisplayValue(e.target.value);
						field.onChange(e.target.value);
						if (userState.status !== "idle") {
							setUserState({ status: "idle", data: null });
						}
						if (isAddress(e.target.value)) {
							setUserState({
								status: "exists",
								data: {
									wallet: e.target.value,
									username: e.target.value,
								},
							});
						}
					}}
				/>
				<div className="absolute right-3 top-1/2 -translate-y-1/2">
					{userState.status === "exists" && (
						<CheckIcon
							className="text-green-600"
							aria-label={t("ariaLabels.userFound")}
						/>
					)}
					{userState.status === "not_found" && (
						<XIcon
							className="text-red-600"
							aria-label={t("ariaLabels.userNotFound")}
						/>
					)}
				</div>
			</div>
			<Button
				type="button"
				disabled={userState.status === "loading" || isAddress(displayValue)}
				onClick={async () => {
					const handle = displayValue;
					setUserState({ status: "loading", data: null });
					const user = await findUserByHandle(handle);

					if (user && user.wallet && user.username) {
						setUserState({ status: "exists", data: user });
						field.onChange(user.wallet);
						setDisplayValue(`${user.username} (${user.wallet})`);

						// Call the callback with user data for notifications
						if (onUserFound) {
							const userData = {
								wallet: user.wallet,
								discordUserId: user.discordUserId || undefined,
								discordUsername:
									user.type === "discord" ? user.username : undefined,
								platform: user.type,
							};
							onUserFound(userData);
						}
					} else {
						setUserState({ status: "not_found", data: null });
					}
				}}
			>
				{userState.status === "loading" ? t("finding") : t("findUser")}
			</Button>
		</div>
	);
}
