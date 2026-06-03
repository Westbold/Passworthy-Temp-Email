/**
 * Application constants
 */

// HTML processing constants
export const HTML_PROCESSING = {
	WORDWRAP_LENGTH: 130,
	MAX_CONVERSION_SIZE: 900 * 1024, // 900KB limit for HTML to text conversion
} as const;

// Cache constants
export const CACHE = {
	DOMAINS_TTL: 3600, // 1 hour
} as const;
