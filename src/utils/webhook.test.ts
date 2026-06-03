import { describe, expect, test } from "bun:test";
import { createWebhookBody, createWebhookSignature } from "./webhook";

describe("webhook signatures", () => {
	test("signs the exact UTF-8 JSON body with HMAC-SHA512 base64", async () => {
		const body = createWebhookBody({
			id: "email_1",
			from_address: "sender@example.com",
			to_address: "inbox@barid.site",
			subject: "Hello",
			received_at: 1753317948,
			html_content: "<p>Hello</p>",
			text_content: "Hello",
		});

		const signature = await createWebhookSignature(body, "top-secret");

		expect(body).toBe(
			'{"id":"email_1","from_address":"sender@example.com","to_address":"inbox@barid.site","subject":"Hello","received_at":1753317948,"html_content":"<p>Hello</p>","text_content":"Hello"}',
		);
		expect(signature).toBe(
			"HMAC-SHA512=9VAQx2i2p4oJbVYCofgUF0IcVqZjqB3OvAZKPW8dLxWmQr+bzEaWAK8tst0+IAGUK4IIp2S8hMB+fpaxyRPUXQ==",
		);
	});
});
