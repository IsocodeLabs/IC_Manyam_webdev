-- Migration to add package_id to cluster_items to support packages in SEO content clusters
ALTER TABLE public.cluster_items
ADD COLUMN package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE;

-- Drop old check constraint and add the new one that includes package_id
ALTER TABLE public.cluster_items
DROP CONSTRAINT IF EXISTS cluster_items_has_one;

ALTER TABLE public.cluster_items
ADD CONSTRAINT cluster_items_has_one CHECK (
    (page_id IS NOT NULL AND post_id IS NULL AND package_id IS NULL) OR
    (page_id IS NULL AND post_id IS NOT NULL AND package_id IS NULL) OR
    (page_id IS NULL AND post_id IS NULL AND package_id IS NOT NULL)
);
