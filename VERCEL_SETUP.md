# Vercel Deployment Fix: Missing Environment Variables

If the popup works locally but NOT on Vercel, it's because **Vercel doesn't know your Supabase passwords.**

`.env.local` files are **NOT** uploaded to Vercel for security. You must add them manually.

## 🚀 How to Fix (2 Minutes)

1. **Go to Vercel Dashboard**
   - Open your project in [Vercel](https://vercel.com/dashboard)
   - Click on **Settings** (top tab)
   - Click on **Environment Variables** (left sidebar)

2. **Add These 4 Variables**
   Copy these from your local `.env.local` file and add them one by one:

   | Key | Value (Copy from your .env.local) |
   |-----|-----------------------------------|
   | `GEMINI_API_KEY` | `AIzaSy...` |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://bohynwyuxdgkxjevrtmy.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` |

3. **Redeploy (Important!)**
   - After adding the variables, they won't work immediately.
   - Go to **Deployments** tab.
   - Click the **three dots (⋮)** next to your latest deployment.
   - Select **Redeploy**.
   - Click **Redeploy** again.

## How to Verify
1. Wait for the redeployment to finish.
2. Open your Vercel app URL.
3. Clear your browser cache/localStorage.
4. Refresh the page.
5. The popup should now appear!

## Why this happens?
The code `process.env.NEXT_PUBLIC_SUPABASE_URL` tries to read the URL.
- **Locally:** It reads from `.env.local`.
- **Vercel:** It looks in Vercel Settings. If missing, it crashes silently, and the popup logic fails.
