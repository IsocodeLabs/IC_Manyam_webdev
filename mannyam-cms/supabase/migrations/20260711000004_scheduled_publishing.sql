-- Publishes journal posts after their scheduled time and registers the task.
-- The function returns the number of posts published by this invocation.

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.publish_scheduled_posts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    published_count integer;
BEGIN
    UPDATE public.posts
    SET
        status = 'Published',
        published_at = now()
    WHERE status = 'Scheduled'
      AND scheduled_at IS NOT NULL
      AND scheduled_at <= now();

    GET DIAGNOSTICS published_count = ROW_COUNT;
    RETURN published_count;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_scheduled_posts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_scheduled_posts() TO service_role;

-- Keep migration replays idempotent by replacing the named job if it exists.
DO $$
DECLARE
    existing_job_id bigint;
BEGIN
    FOR existing_job_id IN
        SELECT jobid
        FROM cron.job
        WHERE jobname = 'publish-scheduled-posts'
    LOOP
        PERFORM cron.unschedule(existing_job_id);
    END LOOP;

    PERFORM cron.schedule(
        'publish-scheduled-posts',
        '*/5 * * * *',
        'SELECT public.publish_scheduled_posts()'
    );
END;
$$;
