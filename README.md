# ThinkUp Innovation Services — Happy December: Best Kids' Apps Challenge

Landing page + pay-then-register system built with Next.js 14 (App Router),
TypeScript, Tailwind CSS, Lucide React, React Hook Form, Zod, and Paystack.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Paystack keys
npm run dev
```

Visit http://localhost:3000.

## Payment flow

Registration is gated behind payment:

1. Parent picks an age category and enters an email in **PaymentGate**
   (`components/PaymentGate.tsx`).
2. The browser asks `app/api/payments/initialize/route.ts` to create a
   Paystack transaction. The server looks up the real fee for that category
   itself — it never trusts the amount the browser sends — so the price
   can't be tampered with client-side.
3. Paystack's inline checkout (loaded from `js.paystack.co`) opens. The
   **Paystack secret key never reaches the browser** — only the public key
   does, which is all the inline widget needs.
4. On successful payment, the browser calls
   `app/api/payments/verify/route.ts`, which asks Paystack's server
   directly whether that reference really succeeded, and only then records
   it as verified.
5. The registration form unlocks, pre-filled with the paid category and
   email (read-only, so a person can't submit a different category than
   the one they paid for).
6. On submit, `app/api/register/route.ts` checks the submitted payment
   reference against the verified-payments record before accepting the
   registration — a forged or reused reference is rejected.

### Registration fees

| Category     | Fee      |
|--------------|---------:|
| Ages 2 – 5   | ₦10,000  |
| Ages 6 – 8   | ₦10,000  |
| Ages 9 – 12  | ₦20,000  |
| Ages 13 – 19 | ₦25,000  |

Defined once in `lib/content.ts` (`CATEGORIES[].fee`) and mirrored
server-side in `app/api/payments/initialize/route.ts`
(`CATEGORY_FEES`) — update both together if fees change.

### Getting your Paystack keys

1. Create a Paystack account at https://dashboard.paystack.com.
2. Go to **Settings → API Keys & Webhooks**.
3. Copy the **Test Secret Key** and **Test Public Key** into `.env.local`
   while building. Switch to **Live** keys only when ready to accept real
   payments.

## What's wired up

- **Payment** — `components/PaymentGate.tsx`, `app/api/payments/initialize/route.ts`,
  `app/api/payments/verify/route.ts`.
- **Registration form** — `components/RegistrationForm.tsx`, validated with
  React Hook Form + Zod, submits `multipart/form-data` (for the optional
  file upload) to `app/api/register/route.ts`, which requires a verified
  payment reference.
- **Age categories** (`components/Categories.tsx`) — each row carries a
  Lucide icon (no emoji), the age range, prize, and registration fee.
- **Brand logo** (`public/brand/logo.png`) — your supplied ThinkUp mark,
  rendered via `components/Logo.tsx`. On dark backgrounds (e.g. the
  footer) it's auto-inverted to white.
- **Google Maps** — embedded via a plain iframe + search link, no API key
  required.

## Dev-only storage — replace before launch

By default, both payments and registrations are written to local JSON
files (`verified-payments.json`, `registrations.json`) and uploads go to
`public/uploads/`. **This is for local development only.** Before going
live:

- Swap the JSON-file reads/writes for a real database (a Prisma +
  PostgreSQL example is commented at the bottom of
  `app/api/register/route.ts`) — ideally storing payments and
  registrations as related rows.
- Swap local file storage for real object storage (S3, Supabase Storage,
  etc.) in `storeUploadedFile()`.
- Consider adding a Paystack webhook endpoint as a second source of truth
  for payment confirmation (the inline-checkout callback can be missed if
  the browser closes before it fires).

## Before launch — remaining placeholders

Search the codebase for `[Placeholder` and `TODO`:

- `lib/content.ts` — FAQ answers not given in the original brief.
- `components/Contact.tsx` — Instagram and TikTok links.
- Privacy policy and terms & conditions pages (linked but not built).

## Dependencies — security note

`next` is pinned to `14.2.35`, the last patched release in the 14.x line
as of this build. Next.js has published several CVEs through 2025–2026;
run `npm view next@14 version` (or check
https://nextjs.org/blog for security releases) before deploying, and bump
the pin if a newer 14.x patch exists. Moving to Next 15 or 16 would pull
in more fixes but is a bigger migration (App Router/Server Actions
behavior changes) — worth planning separately rather than doing
silently in a patch bump.

## Brand

- Logo: `public/brand/logo.png`, rendered via `components/Logo.tsx`.
- Colors (`tailwind.config.ts`): `signal` red `#E31E24`, `navy` `#0E2A4A`,
  `gold` `#F2B705`, plus `category.orange/blue/green/purple` for the age
  cards.
- Fonts: Fraunces (display) + Work Sans (body), via `next/font/google` in
  `app/layout.tsx`.
