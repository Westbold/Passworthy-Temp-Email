const BEARER_PREFIX = "Bearer";

export function extractBearerToken(authorizationHeader: string | null): string | null {
	if (!authorizationHeader) return null;

	const [scheme, ...rest] = authorizationHeader.trim().split(/\s+/);
	const token = rest.join(" ");

	if (scheme !== BEARER_PREFIX || token === "") return null;
	return token;
}

export async function hashAuthorizationKey(key: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
	return arrayBufferToBase64(digest);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";

	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary);
}
