import type { Email } from "@/schemas/emails";
import { logError } from "@/utils/logger";

export const WEBHOOK_SIGNATURE_HEADER_NAME = "X-Webhook-Signature";
const WEBHOOK_SIGNATURE_PREFIX = "HMAC-SHA512=";

export function createWebhookBody(email: Email): string {
	return JSON.stringify({
		id: email.id,
		from_address: email.from_address,
		to_address: email.to_address,
		subject: email.subject,
		received_at: email.received_at,
		html_content: email.html_content,
		text_content: email.text_content,
	});
}

export async function createWebhookSignature(body: string, secret: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-512" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
	return `${WEBHOOK_SIGNATURE_PREFIX}${arrayBufferToBase64(signature)}`;
}

export async function sendEmailWebhook(email: Email, env: CloudflareBindings): Promise<void> {
	if (!env.WEBHOOK_URL || !env.WEBHOOK_SECRET) {
		return;
	}

	try {
		const body = createWebhookBody(email);
		const signature = await createWebhookSignature(body, env.WEBHOOK_SECRET);
		const response = await fetch(env.WEBHOOK_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				[WEBHOOK_SIGNATURE_HEADER_NAME]: signature,
			},
			body,
		});

		if (!response.ok) {
			throw new Error(`Webhook request failed with ${response.status} ${response.statusText}`);
		}
	} catch (error) {
		logError("Failed to send email webhook", error as Error);
	}
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";

	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary);
}
