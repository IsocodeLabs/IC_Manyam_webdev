-- ============================================================
-- MANNYAM CMS - Database Seed Script
-- ============================================================
-- The initial Admin user cannot be created via SQL alone.
-- Supabase Auth requires users to be created through the
-- Auth dashboard or the signUp() API call so that a proper
-- auth.users record is created first.
--
-- Follow the MANUAL STEPS section in builder.html to create
-- the first admin user through the Supabase dashboard.
--
-- Once the user signs up, update their role to Admin:
--   UPDATE public.users SET role = 'Admin' WHERE email = 'your@email.com';
-- ============================================================

-- Initial categories for tour packages and posts categorisation:
INSERT INTO public.categories (name, slug) VALUES
  ('Festivals', 'festivals'),
  ('Destinations', 'destinations'),
  ('Wildlife', 'wildlife'),
  ('Honeymoon', 'honeymoon'),
  ('Wellness', 'wellness')
ON CONFLICT DO NOTHING;

-- Initial tags for posts:
INSERT INTO public.tags (name, slug) VALUES
  ('Holi', 'holi'),
  ('Diwali', 'diwali'),
  ('Rajasthan', 'rajasthan'),
  ('Kerala', 'kerala'),
  ('Varanasi', 'varanasi'),
  ('Dev Deepawali', 'dev-deepawali'),
  ('Wildlife Safari', 'wildlife-safari'),
  ('Palace Stay', 'palace-stay'),
  ('Backwaters', 'backwaters')
ON CONFLICT DO NOTHING;
