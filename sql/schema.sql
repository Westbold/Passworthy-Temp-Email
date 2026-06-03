CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    subject TEXT,
    received_at INTEGER NOT NULL,
    html_content TEXT,
    text_content TEXT
);

CREATE TABLE IF NOT EXISTS claims (
    email_address TEXT PRIMARY KEY,
    auth_key_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
