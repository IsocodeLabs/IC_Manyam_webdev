-- Stores previous post content whenever an editor changes a title or body.

CREATE TABLE public.post_revisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    seo_meta jsonb DEFAULT '{}'::jsonb,
    saved_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX post_revisions_post_created_idx
    ON public.post_revisions (post_id, created_at DESC);

ALTER TABLE public.post_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revisions_read" ON public.post_revisions
    FOR SELECT TO authenticated
    USING (public.get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "revisions_insert" ON public.post_revisions
    FOR INSERT TO authenticated
    WITH CHECK (public.get_my_role() IN ('Admin', 'Content Manager'));

CREATE OR REPLACE FUNCTION public.save_post_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.post_revisions (
        post_id,
        title,
        content,
        seo_meta,
        saved_by
    )
    VALUES (
        OLD.id,
        OLD.title,
        COALESCE(OLD.content, ''),
        COALESCE(OLD.seo_meta, '{}'::jsonb),
        auth.uid()
    );

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.save_post_revision() FROM PUBLIC;

CREATE TRIGGER post_revision_on_update
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    WHEN (
        OLD.content IS DISTINCT FROM NEW.content
        OR OLD.title IS DISTINCT FROM NEW.title
    )
    EXECUTE FUNCTION public.save_post_revision();

