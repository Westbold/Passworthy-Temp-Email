import { describe, expect, test } from "bun:test";
import { extractBearerToken, hashAuthorizationKey } from "./auth";

describe("claim authorization", () => {
	test("extracts bearer tokens from authorization headers", () => {
		expect(extractBearerToken("Bearer claim-secret")).toBe("claim-secret");
		expect(extractBearerToken("Bearer    claim-secret")).toBe("claim-secret");
	});

	test("rejects missing or malformed authorization headers", () => {
		expect(extractBearerToken(null)).toBeNull();
		expect(extractBearerToken("claim-secret")).toBeNull();
		expect(extractBearerToken("Basic claim-secret")).toBeNull();
		expect(extractBearerToken("Bearer")).toBeNull();
	});

	test("hashes authorization keys before storage", async () => {
		await expect(hashAuthorizationKey("claim-secret")).resolves.toBe(
			"H4TSsQTbiAeus6NjPdD7FX4yjP8KstXtajUPJ3Y4U20=",
		);
	});
});
