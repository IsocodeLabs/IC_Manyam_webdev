# MANNYAM Studio CMS — Developer Handover

**Project:** MANNYAM (mannyam.in) — Bespoke Travel CMS + Public Website  
**Client:** MANNYAM Private Travel  
**Built by:** Isocode Labs  
**Handover date:** July 2026  

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│               HOSTINGER LINUX VPS (KVM)                       │
│                                                              │
│  ┌─────────────┐    ┌──────────────────────────────────┐    │
│  │  Caddy       │    │  Docker Compose (Supabase Stack) │    │
│  │  (HTTPS)     │    │                                  │    │
│  │              │    │  Kong (port 8000) ─── PostgREST  │    │
│  │  mannyam.in  │────│  GoTrue Auth                     │    │
│  │  ──► :3000   │    │  PostgreSQL 17                   │    │
│  │              │    │  Storage API                     │    │
│  │  api.mannyam │────│  Studio (port 8000)              │    │
│  │  ──► :8000   │    │  Realtime                        │    │
│  └─────────────┘    └──────────────────────────────────┘    │
│                                                              │
│  ┌───────────────────────────────────────┐                   │
│  │  PM2 (Process Manager)                │                   │
│  │  └── mannyam-cms (Next.js on :3000)   │                   │
│  └───────────────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

- **Frontend + Admin:** Next.js 15 (App Router), TypeScript, TailwindCSS
- **Database + Auth + Storage:** Self-hosted Supabase via Docker Compose
- **Reverse Proxy:** Caddy (auto Let's Encrypt HTTPS)
- **Payments:** Razorpay (test mode, live after KYC)
- **Email:** Resend (SMTP free tier)
- **Process Manager:** PM2
- **Backups:** pg_dump cron to Backblaze B2

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 15.5.x |
| Language | TypeScript | 5.4.x |
| Styling | TailwindCSS | 3.4.x |
| Database | PostgreSQL | 17.x |
| Auth | Supabase GoTrue | v2.189 |
| Storage | Supabase Storage | Self-hosted |
| Rich Text | TipTap | 3.27.x |
| Drag & Drop | @dnd-kit | 6.x / 10.x |
| Payments | Razorpay | npm razorpay |
| Email | Resend | 6.x |
| Icons | Lucide React | 1.24.x |
| Graphs | D3.js | 7.x |
| Validation | Zod | 4.x |
| PDF | @react-pdf/renderer | (if installed) |

---

## 3. Project Structure

```
mannyam-cms/
├── app/
│   ├── (public)/              # Public website (mannyam.in)
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Public layout (Header, Footer)
│   │   ├── experiences/       # Experience listing
│   │   ├── festivals/         # Festival listing
│   │   ├── destinations/      # Destination listing
│   │   ├── journeys/          # Journeys listing
│   │   ├── journal/           # Blog listing + [slug]
│   │   ├── enquire/           # Contact form
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Razorpay checkout + success
│   │   ├── account/           # Customer login/register/bookings
│   │   └── [slug]/            # Dynamic CMS page renderer
│   ├── dashboard/             # Admin panel (staff only)
│   │   ├── journal/           # Post editor (TipTap)
│   │   ├── bookings/          # Order management
│   │   └── discounts/         # Discount codes
│   ├── analytics/             # GSC data dashboard
│   ├── clusters/              # Topic cluster tool + D3 link map
│   ├── leads/                 # Leads inbox + audit log
│   ├── login/                 # Staff login
│   ├── media/                 # Media library
│   ├── packages/              # Package editor (itinerary + availability)
│   ├── pages-cms/             # Page builder (content blocks)
│   ├── redirects/             # Redirect manager
│   ├── seo/                   # SEO tools (bulk table, robots, sitemap)
│   ├── settings/              # Analytics IDs, user management
│   └── api/                   # API routes
│       ├── cart/              # Cart CRUD
│       ├── checkout/          # Razorpay order creation
│       ├── cron/              # Scheduled publishing
│       ├── leads/             # Public lead submission
│       ├── revalidate/        # On-demand ISR
│       ├── robots/            # Dynamic robots.txt
│       ├── scan-links/        # Broken link scanner
│       ├── schema/            # JSON-LD endpoint
│       ├── site-config/       # GA4/GTM config
│       ├── sitemap/           # Dynamic sitemap.xml
│       └── webhooks/razorpay/ # Payment confirmation
├── components/
│   ├── public/                # Public-facing UI components
│   │   ├── blocks/            # BlockRenderer + 11 block types
│   │   ├── ui/                # Button, Badge, Cards, etc.
│   │   ├── Header.tsx         # Site header + nav
│   │   ├── Footer.tsx         # Site footer
│   │   ├── ConciergeForm.tsx  # Enquiry form
│   │   └── ChatWidget.tsx     # AI chat widget
│   ├── layout/                # Admin Sidebar, TopBar
│   ├── ui/                    # Admin UI components
│   ├── editor/                # Post/Page/Package editors
│   ├── seo/                   # SeoPanel, SerpPreview
│   └── clusters/              # Cluster editor, link map
├── lib/
│   ├── supabase/              # client.ts, server.ts, admin.ts, middleware.ts
│   ├── data/                  # public.ts (all data fetching functions)
│   ├── commerce/              # razorpay.ts, cart.ts
│   ├── rbac/                  # permissions.ts, requireRole.ts
│   ├── seo/                   # buildMetadata.ts, generateJsonLd.ts
│   ├── email/                 # notifyNewLead.ts
│   ├── media/                 # getUsage.ts
│   ├── analytics/             # searchConsole.ts
│   └── redirects/             # detectCircular.ts
├── supabase/
│   ├── migrations/            # 16 SQL migration files
│   ├── seed.sql               # Base categories + tags
│   ├── seed_content.sql       # Pages, packages, posts
│   ├── seed_content_2.sql     # Experiences, festivals, destinations
│   └── seed_images.sql        # Image URLs for packages + posts
├── types/
│   └── database.types.ts      # Auto-generated Supabase types
├── middleware.ts              # Auth + redirect middleware
├── next.config.ts             # Next.js config (unoptimized images, outputFileTracingRoot)
├── tailwind.config.ts         # Design tokens (olive, gold, ivory, cream)
└── .env.local                 # Environment variables (NEVER commit)
```

---

## 4. Database Schema (16 migrations)

| # | Migration File | What It Creates |
|---|---------------|-----------------|
| 1 | 20260711000001_initial_schema.sql | 13 core tables (users, pages, posts, packages, media, etc.) |
| 2 | 20260711000002_rls_policies.sql | Row Level Security policies for all tables |
| 3 | 20260711000003_auth_trigger.sql | Auto-create public.users on auth signup |
| 4 | 20260711000004_scheduled_publishing.sql | pg_cron for auto-publishing scheduled posts |
| 5 | 20260711000005_revisions.sql | Post revision history table + trigger |
| 6 | 20260711000006_settings.sql | site_settings table (robots.txt, GA4/GTM IDs) |
| 7 | 20260711000006_step1_security_hardening.sql | Additional security policies |
| 8 | 20260711000007_packages_clusters.sql | Cluster-related schema updates |
| 9 | 20260711000008_audit_log.sql | Lead audit log table |
| 10 | 20260711000008_packages_seo_meta.sql | SEO meta for packages |
| 11 | 20260711000009_clusters_delete_policy.sql | Cascade delete policies |
| 12 | 20260711000010_leads_notes.sql | Lead notes table |
| 13 | 20260712000001_commerce.sql | Commerce tables (customers, bookings, pricing, discount_codes) |
| 14 | 20260717000001_razorpay.sql | Razorpay fields on bookings |
| 15 | 20260717000002_booking_audit_notes.sql | Booking audit + notes tables |
| 16 | 20260717000003_customer_trigger.sql | Auto-create customers on customer signup |

**Seed files (run in order after migrations):**
1. `seed.sql` — base categories and tags
2. `seed_content.sql` — static pages (about, privacy, terms), 7 packages, 3 journal posts
3. `seed_content_2.sql` — 8 experiences, 8 festivals, 7 destinations (as CMS pages)
4. `seed_images.sql` — Unsplash image URLs for packages and posts

---

## 5. Environment Variables

```env
# Supabase (self-hosted on VPS)
NEXT_PUBLIC_SUPABASE_URL=https://api.mannyam.in
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=...

# Site
NEXT_PUBLIC_SITE_URL=https://mannyam.in

# Cron + Revalidation
CRON_SECRET=...
REVALIDATE_SECRET=...

# Google Search Console (after GSC setup)
GOOGLE_SERVICE_ACCOUNT_EMAIL=...@...iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GSC_SITE_URL=https://mannyam.in

# Email (Resend)
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@mannyam.in

# Razorpay (TEST mode — swap to live after KYC)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_WEBHOOK_SECRET=...
```

---

## 6. Role-Based Access Control (RBAC)

| Section | Admin | Content Manager | Marketer |
|---------|-------|-----------------|----------|
| Pages & Journal | Yes | Yes | No |
| SEO Fields | Yes | Yes | Yes |
| Media Library | Yes | Yes | No |
| Analytics | Yes | No | Yes |
| Leads | Yes | No | Yes |
| Packages | Yes | Yes | No |
| Users & Roles | Yes | No | No |
| Redirects | Yes | No | Yes |
| Bookings | Yes | No | Yes |

---

## 7. Deployment (VPS)

**Build and restart:**
```bash
cd /var/www/mannyam-cms/mannyam-cms
git pull origin main
npm ci          # only if package.json changed
npm run build
pm2 restart mannyam-cms
```

**Caddy config** (`/etc/caddy/Caddyfile`):
```
mannyam.in, www.mannyam.in {
    reverse_proxy localhost:3000
}
api.mannyam.in {
    reverse_proxy localhost:8000
}
```

**Supabase Docker:**
```bash
cd /var/www/supabase-docker/docker
docker compose up -d
docker compose ps    # all should be healthy
```

---

## 8. Key Operational Commands

| Task | Command |
|------|---------|
| View app logs | `pm2 logs mannyam-cms` |
| Restart app | `pm2 restart mannyam-cms` |
| Restart Supabase | `cd /var/www/supabase-docker/docker && docker compose restart` |
| Restart Caddy | `sudo systemctl restart caddy` |
| Check SSL cert | `sudo caddy certificates` |
| Database backup | `/opt/supabase/backup.sh` |
| Generate types | `npx supabase gen types typescript --db-url postgresql://postgres:PASSWORD@VPS_IP:5432/postgres > types/database.types.ts` |

---

## 9. Content Management

| Content Type | Where to Edit | Renders At |
|-------------|--------------|------------|
| Static pages | /pages-cms | /{slug} (about, privacy, terms) |
| Experience pages | /pages-cms | /{slug} (experience-heritage, etc.) |
| Festival pages | /pages-cms | /{slug} (festival-holi, etc.) |
| Destination pages | /pages-cms | /{slug} (destination-rajasthan, etc.) |
| Journal posts | /dashboard/journal | /journal/{slug} |
| Travel packages | /packages | /experiences/{slug} or /festivals/{slug} |
| Media | /media | Supabase Storage bucket "media" |

**Block types available in Page Builder:**
Hero, Text Block, Feature Grid, Image Block, CTA Banner, Testimonial, Concierge Contact, Tiles, Fact Bar, Place Chips, FAQ

---

## 10. Remaining Tasks (Step 18)

| Task | Status | Notes |
|------|--------|-------|
| 18-1 Staging deploy | DONE | VPS + PM2 + Caddy |
| 18-2 Security hardening | TODO | Run prompt — creates 404/500 pages, audits secrets |
| 18-3 Domain + DNS + HTTPS | DONE | mannyam.in + api.mannyam.in via Caddy |
| 18-4 Live integrations | TODO | GSC live domain, Razorpay live mode, sitemap submit |
| 18-5 Client handover docs | TODO | Admin guide for the client team |
| SSL "Not Secure" fix | TODO | Caddy cert provisioning — check port 80 access |

---

## 11. Design System

| Token | Value | Usage |
|-------|-------|-------|
| Ink | #22271d | Body text |
| Olive | #3a4430 | Primary dark |
| Gold | #b1832f | Accent, CTAs |
| Sand | #c39657 | Secondary accent |
| Ivory | #fcfcfa | Page background |
| Cream | #f4f3ec | Card backgrounds |
| Display font | Cormorant Garamond | Headings |
| UI font | Jost | Body, buttons, labels |

**Rules:** British English throughout. No em dashes. No pricing on public marketing pages.

---

## 12. Security Notes

- `.env.local` is gitignored and must NEVER be committed
- `SUPABASE_SERVICE_ROLE_KEY` is only imported in `lib/supabase/admin.ts` (server-only)
- The admin client uses a lazy Proxy pattern to avoid build-time crashes
- All tables have Row Level Security enabled
- Customers cannot access `/dashboard` (middleware redirects to `/account`)
- Staff cannot access `/account` customer pages

---

## 13. Contacts

| Role | Name | Email |
|------|------|-------|
| Developer | Isocode Labs | dev@isocodelabs.com |
| Client Admin | MANNYAM | admin@mannyam.in |

---

*Generated: July 2026 | MANNYAM Studio CMS v1.0*
