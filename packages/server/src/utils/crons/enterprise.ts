import { getPublicIpWithFallback } from "@dokploy/server/wss/utils";

export const LICENSE_KEY_URL =
	// process.env.NODE_ENV === "development"
	// 	? "http://localhost:4002"
	"https://licenses-api.dokploy.com";

export const initEnterpriseBackupCronJobs = async () => {};

export const validateLicenseKey = async (licenseKey: string) => {
	try {
		const ip = await getPublicIpWithFallback();
		const result = await fetch(`${LICENSE_KEY_URL}/licenses/validate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ licenseKey, ip }),
		});

		if (!result.ok) {
			const errorData = await result.json().catch(() => ({}));
			throw new Error(errorData.message || "Failed to validate license key");
		}

		const data = await result.json();
		return data.valid;
	} catch (error) {
		console.error(
			error instanceof Error ? error.message : "Failed to validate license key",
		);
		throw error;
	}
};
