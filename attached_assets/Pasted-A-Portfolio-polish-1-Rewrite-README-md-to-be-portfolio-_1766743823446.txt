A) Portfolio polish
1) Rewrite README.md to be portfolio-grade:
   - Product overview, problem/solution, features, screenshots placeholders, live demo links placeholders, tech stack, architecture diagram (ASCII), data model overview, local setup, env vars, deployment steps (Vercel+Render), and roadmap.
2) Add .env.example at repo root listing all required env vars for local + production.
3) Ensure .gitignore includes env files and build outputs.

B) Authentication (login/signup)
1) Implement secure auth with:
   - Users table/model (use existing DB/Drizzle if present; otherwise add a simple users schema).
   - Password hashing (bcrypt/argon2).
   - JWT access token + refresh token OR httpOnly cookie session (prefer httpOnly cookies).
2) Add backend routes:
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - GET  /api/auth/me
3) Add auth middleware to protect API routes; ensure all user data is scoped to the logged-in user.
4) Frontend:
   - Add Login and Signup screens.
   - Protect routes (redirect unauthenticated users).
   - Add logout button and show user state in UI.
5) Make sure server listens on process.env.PORT and supports CORS for Vercel + local dev.

C) Payments / Subscriptions (Stripe)
1) Add pricing page with Free vs Pro.
2) Add backend endpoints:
   - POST /api/billing/create-checkout-session
   - POST /api/billing/create-portal-session
   - POST /api/billing/webhook (Stripe webhook)
3) Store subscription status in DB (plan/free/pro, stripeCustomerId, subscriptionStatus).
4) Gate at least one premium feature behind Pro (e.g., export, analytics, unlimited records).

D) PWA (installable on mobile)
1) Convert frontend into a PWA using Vite tooling:
   - Add manifest, icons (placeholders), theme colors, display standalone.
   - Add service worker via vite-plugin-pwa (recommended).
   - Ensure refresh/routing works and passes Lighthouse PWA checks.
2) Add “Install App” guidance and Add-to-Home-Screen instructions to README.

E) Custom domain readiness
1) Ensure frontend uses API base URL from env var (VITE_API_URL).
2) Configure backend CORS to allow:
   - local dev
   - Vercel domain
   - future custom domains app.<domain> and api.<domain>
3) Document exact steps to add custom domain in Vercel and Render + DNS records needed.

Root package.json scripts
- Ensure scripts exist for:
  - dev (runs server + client if applicable)
  - build (build client)
  - start (production server)
- Keep existing scripts working, do not break the current app.

Deliverables:
1) Implement the code changes.
2) List every file changed and why.
3) Provide a “Production Setup Checklist”:
   - Vercel env vars
   - Render env vars
   - Stripe keys + webhook URL
   - required DB migration steps
   - steps to test on mobile
Start by scanning the repo to identify current frameworks, router, DB (drizzle), and existing API routes, then apply changes carefully.