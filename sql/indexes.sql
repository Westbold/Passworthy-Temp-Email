-- Composite index for the main query pattern (filter by to_address, order by received_at)
CREATE INDEX IF NOT EXISTS idx_emails_to_address_received_at ON emails (to_address, received_at DESC);

-- Individual indexes for other query patterns
CREATE INDEX IF NOT EXISTS idx_emails_to_address ON emails (to_address);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails (received_at DESC);

-- Index for cleanup operations (delete old emails) - optimized for covering query
CREATE INDEX IF NOT EXISTS idx_emails_cleanup_covering ON emails (received_at, id) WHERE received_at IS NOT NULL;
