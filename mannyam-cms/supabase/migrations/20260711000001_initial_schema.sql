-- Initialisation migration script for MANNYAM CMS database.
-- Creates all 13 core tables with Row Level Security enabled.
-- All text is in British English. No em dashes.

-- 1. public.users
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    role text NOT NULL CHECK (role IN ('Admin', 'Content Manager', 'Marketer')),
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.users IS 'Stores custom profile details and roles for authenticated dashboard users.';

-- 2. public.categories
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.categories IS 'Maintains categories for journal posts grouping and categorisation.';

-- 3. public.tags
CREATE TABLE public.tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.tags IS 'Stores tags for flexible categorisation of journal posts.';

-- 4. public.pages
CREATE TABLE public.pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    type text NOT NULL CHECK (type IN ('Landing', 'Category', 'Standard', 'Form', 'Legal')),
    status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
    content jsonb DEFAULT '[]'::jsonb,
    seo_meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.pages IS 'Stores block-based website pages and their metadata configurations.';

-- 5. public.posts
CREATE TABLE public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Scheduled')),
    content text DEFAULT '',
    seo_meta jsonb DEFAULT '{}'::jsonb,
    scheduled_at timestamptz,
    published_at timestamptz,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.posts IS 'Maintains journal posts content, scheduling parameters, and publishing states.';

-- 6. public.post_tags
CREATE TABLE public.post_tags (
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.post_tags IS 'Join table representing the many-to-many relationship between posts and tags.';

-- 7. public.packages
CREATE TABLE public.packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    type text NOT NULL CHECK (type IN ('Festival', 'Destination', 'Honeymoon', 'Wildlife', 'Wellness')),
    description text DEFAULT '',
    itinerary jsonb DEFAULT '[]'::jsonb,
    availability jsonb DEFAULT '[]'::jsonb,
    featured_image_url text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.packages IS 'Stores tour package details, day-by-day itineraries, and calendar availability.';

-- 8. public.media
CREATE TABLE public.media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url text NOT NULL,
    alt_text text NOT NULL, -- Enforced NOT NULL for SEO compliance
    caption text,
    width integer,
    height integer,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.media IS 'Stores media library asset details and mandatory alt text for SEO compliance.';

-- 9. public.redirects
CREATE TABLE public.redirects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    from_path text NOT NULL UNIQUE,
    to_path text NOT NULL,
    status_code integer NOT NULL CHECK (status_code IN (301, 302)),
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.redirects IS 'Manages custom URL redirection pathways and status codes.';

-- 10. public.clusters
CREATE TABLE public.clusters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    pillar_page_id uuid -- References pages.id or posts.id, enforced at application layer
);

ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.clusters IS 'Defines SEO content clusters and references their main pillar page.';

-- 11. public.cluster_items
CREATE TABLE public.cluster_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id uuid NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
    page_id uuid REFERENCES public.pages(id) ON DELETE CASCADE,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT cluster_items_has_one CHECK (
        (page_id IS NOT NULL AND post_id IS NULL) OR
        (page_id IS NULL AND post_id IS NOT NULL)
    )
);

ALTER TABLE public.cluster_items ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.cluster_items IS 'Stores elements associated with an SEO cluster, mapping them to either a page or a post.';

-- 12. public.internal_links
CREATE TABLE public.internal_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id uuid NOT NULL,
    target_id uuid NOT NULL,
    anchor_text text NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.internal_links ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.internal_links IS 'Maintains records of internal hyperlinks between different CMS pages and posts.';

-- 13. public.leads
CREATE TABLE public.leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source text NOT NULL CHECK (source IN ('Contact Form', 'AI Chat')),
    source_page text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    message text DEFAULT '',
    status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Proposal', 'Won', 'Lost')),
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.leads IS 'Stores submitted contact enquiries and tracks lead pipeline progression statuses.';


-- Auto-update updated_at on pages
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

CREATE TRIGGER pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
