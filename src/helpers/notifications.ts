export interface NotificationData {
	rewardId: string;
	communityId: string;
	contributorName: string;
	platform: "discord" | "telegram";
	platformUserId?: string;
	points: number;
	summary: string;
	description: string;
	transactionHash: string;
}

export const sendRewardNotification = async (
	notificationData: NotificationData,
	actionType: "badge" | "mint" | "transfer",
): Promise<void> => {
	try {
		const response = await fetch("/api/notifications/send-reward", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(notificationData),
		});

		if (!response.ok) {
			console.error(`Failed to send ${actionType} notification`);
		}
	} catch (notificationError) {
		console.error(
			`Failed to send ${actionType} notification:`,
			notificationError,
		);
	}
}; 