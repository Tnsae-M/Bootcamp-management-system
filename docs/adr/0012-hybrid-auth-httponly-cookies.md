# 0012 — Hybrid Authentication with HttpOnly Refresh Cookies and Bearer Access Tokens

Status: accepted

We decided to adopt a **Hybrid Authentication Model** across the backend and frontend:
- **Long-lived Refresh Token (7 days):** Stored exclusively in an `httpOnly`, `Secure` (production), `SameSite=Lax` browser cookie. Inaccessible to JavaScript (XSS immune).
- **Short-lived Access Token (2 hours):** Maintained in memory / client state and transmitted via the standard `Authorization: Bearer <token>` HTTP header on every authenticated API request.
- **Silent Refresh:** When an access token expires, the client calls `POST /api/auth/refresh`. The browser automatically transmits the `httpOnly` cookie; the server validates it and returns a new access token without requiring user interaction.

## Context

The CSEC-ASTU Bootcamp Management System manages sensitive student academic standing, instructor evaluations, and administrative overrides. Storing long-lived refresh tokens in browser `localStorage` exposes accounts to permanent credential theft via Cross-Site Scripting (XSS). Conversely, relying purely on session cookies makes non-browser clients (such as future CLI utilities or Telegram Bot webhooks) difficult to authenticate.

## Considered Options

- **Local Storage Only (Option A):** Both access and refresh tokens stored in `localStorage`. Rejected due to high XSS exposure for privileged accounts (Super Admins, Division Admins, Instructors).
- **Pure Cookie Sessions (Option C Pure):** All authentication managed via session cookies. Rejected because non-browser clients and microservices struggle with browser cookie simulation.
- **Hybrid HttpOnly Cookie + Bearer Token (Accepted):** The industry standard pattern (Auth0, Supabase, Stripe). The refresh token is locked down in an `httpOnly` cookie; the short-lived access token is held in application memory/state and sent as a Bearer header.

## Consequences

### Backend
1. `cookie-parser` is added to Express middleware.
2. `login` and `register` controllers set the `refreshToken` cookie with `{ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 }`.
3. `POST /api/auth/refresh` reads `req.cookies.refreshToken` (or falls back to request body for non-browser clients) and generates a fresh access token.
4. `POST /api/auth/logout` clears the cookie via `res.clearCookie('refreshToken')`.
5. CORS configuration in `app.js` sets `credentials: true`.

### Frontend
1. Axios instance configured with `withCredentials: true`.
2. Silent background token refresh intercepts 401s and hits `/api/auth/refresh` without needing to pass the refresh token in the body.
3. Logout dispatches `POST /api/auth/logout` to clear the cookie and resets client Redux state.

