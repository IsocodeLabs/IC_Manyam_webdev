-- Migration to add seo_meta to packages table
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS seo_meta jsonb DEFAULT '{}'::jsonb;
