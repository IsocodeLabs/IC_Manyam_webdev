-- ============================================================================
-- MANNYAM CMS - Definitive Image Assignment
-- Maps images exactly as in Manyam frontend.html (PIC + PICK constants).
-- Run AFTER seed_content.sql and seed_content_2.sql.
-- Sets: packages.featured_image_url + posts.seo_meta.og_image
-- (Category pages already carry images inside their Hero block.)
-- ============================================================================

-- Helper note on the frontend.html photo mapping (images.unsplash.com IDs):
--   taj     = 1524492412937-b28074a5d7da   fort   = 1599661046289-e31897846e41
--   palace  = 1477587458883-47145ed94245   curry  = 1585937421612-70a008356fbe
--   spice   = 1596040033229-a9821ebd058d   tiger  = 1615824996195-f780bba7cfab
--   kerala  = 1593693411515-c20261bcad6e   kerala2= 1602216056096-3b40cc0c9944
--   bride   = 1583391733956-3750e0ff4e8b   gopuram= 1582510003544-4d00b7f74220
--   snow    = 1626621341517-bbf3d9990a23   yoga   = 1545389336-cf090694435e
--   stupa   = 1596402184320-417e7178b2cd

-- ─── PACKAGES (Journeys) featured_image_url ─────────────────────────────────
UPDATE public.packages SET featured_image_url =
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=75'
  WHERE slug = 'palaces-of-the-north';   -- taj

UPDATE public.packages SET featured_image_url =
  'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=1200&q=75'
  WHERE slug = 'green-kerala';           -- kerala

UPDATE public.packages SET featured_image_url =
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=75'
  WHERE slug = 'ladakh-high-passes';     -- snow

UPDATE public.packages SET featured_image_url =
  'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1200&q=75'
  WHERE slug = 'ganges-and-beyond';      -- yoga

UPDATE public.packages SET featured_image_url =
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=75'
  WHERE slug = 'colours-of-holi';        -- spice (colour)

UPDATE public.packages SET featured_image_url =
  'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=75'
  WHERE slug = 'lights-of-diwali';       -- palace

UPDATE public.packages SET featured_image_url =
  'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=75'
  WHERE slug = 'royal-dussehra';         -- fort

-- ─── POSTS (Journal) og_image inside seo_meta ───────────────────────────────
UPDATE public.posts SET seo_meta = jsonb_set(
  COALESCE(seo_meta, '{}'::jsonb), '{og_image}',
  '"https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=75"'
) WHERE slug = 'holi-mathura';           -- spice (colour)

UPDATE public.posts SET seo_meta = jsonb_set(
  COALESCE(seo_meta, '{}'::jsonb), '{og_image}',
  '"https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1200&q=75"'
) WHERE slug = 'diwali-varanasi';        -- yoga

UPDATE public.posts SET seo_meta = jsonb_set(
  COALESCE(seo_meta, '{}'::jsonb), '{og_image}',
  '"https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=75"'
) WHERE slug = 'slow-spiti';             -- snow

-- ============================================================================
-- DONE. 7 packages + 3 posts now carry images.
-- Restart the app (pm2 restart mannyam-cms) - no rebuild needed for these
-- since packages/posts render on dynamic routes.
-- ============================================================================
