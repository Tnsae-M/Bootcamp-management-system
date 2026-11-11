# 0009 — Telegram Bot is the external notification channel; email is deferred

Status: accepted

We decided that the only external notification channel in v1 is a **Telegram Bot**. Email notifications are explicitly out of scope for v1.

CSEC-ASTU's student body communicates primarily through Telegram. Email open rates in this population are low. Telegram Bot integration requires no per-email infrastructure (SMTP, deliverability, bounce handling) and delivers real-time push messages directly into the channels students already monitor.

## Considered Options

- **Email only (original SRS):** Standard for web platforms. Rejected for v1 — the target audience (university students in an active Telegram-native community) will not reliably open email for time-sensitive events like an attendance window opening.
- **Email + Telegram:** Both channels. Rejected for v1 — doubles notification infrastructure complexity for marginal benefit. Email can be added in v2 once the platform is live and actual delivery patterns are observable.
- **In-app only:** No external push. Rejected — attendance window open notifications are time-sensitive (30-minute window); polling the app is not a reliable delivery mechanism.

## Consequences

- Backend requires a Telegram Bot token (environment variable) and must call the Telegram Bot API's `sendMessage` endpoint for external notifications.
- Users provide their Telegram username or chat ID during registration (optional in sign-up, prompted on first login).
- In-app notifications are the authoritative record; Telegram is best-effort (failures are logged, not retried in v1).
- Users can configure which notification types reach Telegram via their notification preferences.
