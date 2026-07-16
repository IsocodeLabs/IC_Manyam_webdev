# MANNYAM Studio CMS - Step 1 API Reference

This document provides a technical overview of the database API endpoints, environment variables, and schema layouts established in Step 1 of the initialisation. All table comments and references follow British English spelling conventions.

---

## 1. Supabase Auto-Generated REST Endpoints

Supabase automatically exposes PostgREST endpoints for all tables under `/rest/v1/`. Access is governed strictly by the Row Level Security (RLS) policies applied in database migration.

### Table Operations & Role Authorization

#### public.users
*   **GET `/rest/v1/users`**: Lists profile details. `Admin` can read all profiles; every other authenticated user can read only their own profile.
*   **POST `/rest/v1/users`**: Creates profile. Accessible by `Admin` only.
*   **PATCH `/rest/v1/users?id=eq.[uuid]`**: Updates profile details. Accessible by `Admin` only.
*   **DELETE `/rest/v1/users?id=eq.[uuid]`**: Deletes profile. Accessible by `Admin` only.

#### public.categories
*   **GET `/rest/v1/categories`**: Lists categories. Accessible by all (`public` / `anon`).
*   **POST `/rest/v1/categories`**: Creates category. Accessible by `Admin` and `Content Manager` roles.
*   **PATCH `/rest/v1/categories?id=eq.[uuid]`**: Updates category. Accessible by `Admin` and `Content Manager` roles.
*   **DELETE `/rest/v1/categories?id=eq.[uuid]`**: Deletes category. Accessible by `Admin` only.

#### public.tags
*   **GET `/rest/v1/tags`**: Lists tags. Accessible by all (`public` / `anon`).
*   **POST `/rest/v1/tags`**: Creates tag. Accessible by `Admin` and `Content Manager` roles.
*   **PATCH `/rest/v1/tags?id=eq.[uuid]`**: Updates tag. Accessible by `Admin` and `Content Manager` roles.
*   **DELETE `/rest/v1/tags?id=eq.[uuid]`**: Deletes tag. Accessible by `Admin` only.

#### public.pages
*   **GET `/rest/v1/pages`**: Lists pages. Accessible by all (`public` / `anon`).
*   **POST `/rest/v1/pages`**: Creates page layout. Accessible by `Admin` and `Content Manager` roles.
*   **PATCH `/rest/v1/pages?id=eq.[uuid]`**: Updates page. Accessible by `Admin` and `Content Manager` roles.
*   **DELETE `/rest/v1/pages?id=eq.[uuid]`**: Deletes page. Accessible by `Admin` only.

#### public.posts
*   **GET `/rest/v1/posts`**: Lists journal posts. Accessible by all (`public` / `anon`).
*   **POST `/rest/v1/posts`**: Creates post. Accessible by `Admin` and `Content Manager` roles.
*   **PATCH `/rest/v1/posts?id=eq.[uuid]`**: Updates post. Accessible by `Admin` and `Content Manager` roles.
*   **DELETE `/rest/v1/posts?id=eq.[uuid]`**: Deletes post. Accessible by `Admin` only.

#### public.post_tags
*   **GET `/rest/v1/post_tags`**: Lists post-tag relationships. Accessible by all (`public` / `anon`).
*   **POST `/rest/v1/post_tags`**: Links tag to post. Accessible by `Admin` and `Content Manager` roles.
*   **PATCH `/rest/v1/post_tags?post_id=eq.[uuid]&tag_id=eq.[uuid]`**: Updates link. Accessible by `Admin` and `Content Manager` roles.
*   **DELETE `/rest/v1/post_tags?post_id=eq.[uuid]&tag_id=eq.[uuid]`**: Unlinks tag. Accessible by `Admin` only.

#### public.packages
*   **GET `/rest/v1/packages`**: Lists tour packages. Accessible by all (`public` / `anon`).
*   **POST `/rest/v1/packages`**: Creates package. Accessible by `Admin` and `Content Manager` roles.
*   **PATCH `/rest/v1/packages?id=eq.[uuid]`**: Updates package. Accessible by `Admin` and `Content Manager` roles.
*   **DELETE `/rest/v1/packages?id=eq.[uuid]`**: Deletes package. Accessible by `Admin` only.

#### public.media
*   **GET `/rest/v1/media`**: Lists media assets. Accessible by all (`public` / `anon`).
*   **POST `/rest/v1/media`**: Uploads media metadata. Accessible by `Admin` and `Content Manager` roles.
*   **PATCH `/rest/v1/media?id=eq.[uuid]`**: Updates metadata (e.g. alt text). Accessible by `Admin` and `Content Manager` roles.
*   **DELETE `/rest/v1/media?id=eq.[uuid]`**: Deletes metadata. Accessible by `Admin` and `Content Manager` roles.

#### public.redirects
*   **GET `/rest/v1/redirects`**: Lists redirection routes. Accessible by all (`public` / `anon`).
*   **POST `/rest/v1/redirects`**: Creates route redirect. Accessible by `Admin` and `Marketer` roles.
*   **PATCH `/rest/v1/redirects?id=eq.[uuid]`**: Updates redirect. Accessible by `Admin` and `Marketer` roles.
*   **DELETE `/rest/v1/redirects?id=eq.[uuid]`**: Deletes redirect. Accessible by `Admin` only.

#### public.clusters
*   **GET `/rest/v1/clusters`**: Lists clusters. Accessible by all (`public` / `anon`).
*   **POST `/rest/v1/clusters`**: Creates cluster. Accessible by `Admin` and `Content Manager` roles.
*   **PATCH `/rest/v1/clusters?id=eq.[uuid]`**: Updates cluster. Accessible by `Admin` and `Content Manager` roles.
*   **DELETE `/rest/v1/clusters?id=eq.[uuid]`**: Deletes cluster. Accessible by `Admin` only.

#### public.cluster_items
*   **GET `/rest/v1/cluster_items`**: Lists cluster mappings. Accessible by all (`public` / `anon`).
*   **POST `/rest/v1/cluster_items`**: Maps page/post to cluster. Accessible by `Admin` and `Content Manager` roles.
*   **PATCH `/rest/v1/cluster_items?id=eq.[uuid]`**: Updates mapping. Accessible by `Admin` and `Content Manager` roles.
*   **DELETE `/rest/v1/cluster_items?id=eq.[uuid]`**: Deletes mapping. Accessible by `Admin` only.

#### public.internal_links
*   **GET `/rest/v1/internal_links`**: Lists hyperlinks mapping. Accessible by all (`public` / `anon`).
*   **POST `/rest/v1/internal_links`**: Maps links between contents. Accessible by `Admin` and `Content Manager` roles.
*   **PATCH `/rest/v1/internal_links?id=eq.[uuid]`**: Updates link map. Accessible by `Admin` and `Content Manager` roles.
*   **DELETE `/rest/v1/internal_links?id=eq.[uuid]`**: Deletes link map. Accessible by `Admin` and `Content Manager` roles.

#### public.leads
*   **GET `/rest/v1/leads`**: Lists submitted leads. Accessible by `Admin` and `Marketer` roles.
*   **POST `/rest/v1/leads`**: Submits enquiry from public forms. Accessible by all (`public` / `anon`).
*   **PATCH `/rest/v1/leads?id=eq.[uuid]`**: Updates lead status. Accessible by `Admin` and `Marketer` roles.
*   **DELETE `/rest/v1/leads?id=eq.[uuid]`**: Deletes lead. Accessible by `Admin` only.

---

## 2. Custom Next.js API Routes

The following custom routes are the planned API surface for Steps 2 to 9. Unless explicitly noted, they are documentation stubs and are not implemented in Step 1:

*   **POST `/api/auth/login`**: Supabase Auth login operation. The Step 1 UI currently performs the equivalent operation with a Server Action.
*   **POST `/api/auth/logout`**: Clears the Supabase session (planned route; the Step 1 shell currently exposes `POST /api/logout`).
*   **GET `/api/sitemap`**: Generates sitemap XML dynamically (to be built in Step 6).
*   **GET `/api/robots`**: Generates robots.txt parameters dynamically (to be built in Step 6).
*   **POST `/api/leads`**: Public endpoint supporting public form capture and lead routing (to be built in Step 9).

---

## 3. Environment Variables Reference

*   **`NEXT_PUBLIC_SUPABASE_URL`**: Public URL pointing to the Supabase API Kong gateway (binds to `http://localhost:7777` during development via SSH tunnel).
*   **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Public API key safe to expose to browser environments. Decodes to the `anon` user role for client-side queries.
*   **`SUPABASE_SERVICE_ROLE_KEY`**: Private administrative key. **MUST NEVER** be imported into client components or exposed to browsers. Bypasses Row Level Security (RLS) policies completely.

## Authentication and role provisioning

Creating a record in `auth.users` invokes `public.handle_new_user()`, which creates the matching `public.users` profile. New accounts always start as `Content Manager`; role values in user-supplied sign-up metadata are ignored. An existing `Admin` must promote or otherwise change the role after the account exists.

---

## 4. Database Schema Summary

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| **users** | Dashboard user profiles and role management | `id` (PK, Auth ref), `name`, `email`, `role` (Admin/Content Manager/Marketer) |
| **categories** | Structural categories for journal posts grouping | `id` (PK), `name`, `slug`, `parent_id` (Self-relation) |
| **tags** | Dynamic tagging classification labels | `id` (PK), `name`, `slug` |
| **pages** | Website layouts configurations and content blocks | `id` (PK), `title`, `slug`, `type`, `status` (Draft/Published), `content` (JSONB) |
| **posts** | Journal articles content and scheduling parameters | `id` (PK), `title`, `slug`, `category_id`, `status` (Draft/Published/Scheduled) |
| **post_tags** | Many-to-many junction mapping posts to tags | `post_id` (FK), `tag_id` (FK) |
| **packages** | Travel tour package profiles and availability calendars | `id` (PK), `title`, `slug`, `type`, `itinerary` (JSONB), `availability` (JSONB) |
| **media** | Media assets paths and mandatory alt texts library | `id` (PK), `file_url`, `alt_text` (NOT NULL), `caption` |
| **redirects** | Custom URL redirect mappings and status codes | `id` (PK), `from_path`, `to_path`, `status_code` (301/302) |
| **clusters** | SEO content clusters mapping | `id` (PK), `name`, `pillar_page_id` |
| **cluster_items** | Mapped items associated with content clusters | `id` (PK), `cluster_id`, `page_id`, `post_id` |
| **internal_links** | Hyperlink connections between pages and posts | `id` (PK), `source_id`, `target_id`, `anchor_text` |
| **leads** | Captured public form enquiries and pipeline status | `id` (PK), `source` (Contact Form/AI Chat), `email`, `status` |
