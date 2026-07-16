-- Migration to add site_settings table for storing robots.txt and other configurations
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES public.users(id)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS settings_read_all ON public.site_settings;
CREATE POLICY settings_read_all ON public.site_settings
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS settings_admin_write ON public.site_settings;
CREATE POLICY settings_admin_write ON public.site_settings
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'Admin')
  WITH CHECK (public.get_my_role() = 'Admin');
