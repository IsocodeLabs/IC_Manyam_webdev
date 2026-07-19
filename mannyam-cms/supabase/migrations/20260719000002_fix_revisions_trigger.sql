-- ============================================================================
-- MANNYAM CMS - Fix Post Revisions Trigger
-- Ensures revisions are saved when seo_meta (featured image) or status changes.
-- ============================================================================

DROP TRIGGER IF EXISTS post_revision_on_update ON public.posts;

CREATE TRIGGER post_revision_on_update
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    WHEN (
        OLD.content IS DISTINCT FROM NEW.content
        OR OLD.title IS DISTINCT FROM NEW.title
        OR OLD.seo_meta IS DISTINCT FROM NEW.seo_meta
        OR OLD.status IS DISTINCT FROM NEW.status
    )
    EXECUTE FUNCTION public.save_post_revision();
