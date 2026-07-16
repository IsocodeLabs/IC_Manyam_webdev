-- RLS policies script for MANNYAM CMS database tables.
-- Defines access rules for Admin, Content Manager, and Marketer roles.
-- All comments use British English spelling conventions. No em dashes.

-- Helper function to fetch the role of the current authenticated user
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.users WHERE id = (SELECT auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = '';

REVOKE ALL ON FUNCTION public.get_my_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- ============================================================================
-- 1. public.users
-- ============================================================================
CREATE POLICY "users_select_admin" ON public.users
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (public.get_my_role() = 'Admin');

-- Dashboard users need their own profile to resolve their display name and role.
CREATE POLICY "users_select_own" ON public.users
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "users_insert_admin" ON public.users
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'Admin');

CREATE POLICY "users_update_admin" ON public.users
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() = 'Admin')
  WITH CHECK (get_my_role() = 'Admin');

CREATE POLICY "users_delete_admin" ON public.users
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() = 'Admin');

-- ============================================================================
-- 2. public.categories
-- ============================================================================
CREATE POLICY "categories_select_public" ON public.categories
  AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "categories_insert_admin_manager" ON public.categories
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "categories_update_admin_manager" ON public.categories
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'))
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "categories_delete_admin" ON public.categories
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() = 'Admin');

-- ============================================================================
-- 3. public.tags
-- ============================================================================
CREATE POLICY "tags_select_public" ON public.tags
  AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "tags_insert_admin_manager" ON public.tags
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "tags_update_admin_manager" ON public.tags
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'))
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "tags_delete_admin" ON public.tags
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() = 'Admin');

-- ============================================================================
-- 4. public.pages
-- ============================================================================
CREATE POLICY "pages_select_public" ON public.pages
  AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "pages_insert_admin_manager" ON public.pages
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "pages_update_admin_manager" ON public.pages
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'))
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "pages_delete_admin" ON public.pages
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() = 'Admin');

-- ============================================================================
-- 5. public.posts
-- ============================================================================
CREATE POLICY "posts_select_public" ON public.posts
  AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "posts_insert_admin_manager" ON public.posts
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "posts_update_admin_manager" ON public.posts
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'))
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "posts_delete_admin" ON public.posts
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() = 'Admin');

-- ============================================================================
-- 6. public.post_tags
-- ============================================================================
CREATE POLICY "post_tags_select_public" ON public.post_tags
  AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "post_tags_insert_admin_manager" ON public.post_tags
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "post_tags_update_admin_manager" ON public.post_tags
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'))
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "post_tags_delete_admin" ON public.post_tags
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() = 'Admin');

-- ============================================================================
-- 7. public.packages
-- ============================================================================
CREATE POLICY "packages_select_public" ON public.packages
  AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "packages_insert_admin_manager" ON public.packages
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "packages_update_admin_manager" ON public.packages
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'))
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "packages_delete_admin" ON public.packages
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() = 'Admin');

-- ============================================================================
-- 8. public.media
-- ============================================================================
CREATE POLICY "media_select_public" ON public.media
  AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "media_insert_admin_manager" ON public.media
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "media_update_admin_manager" ON public.media
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'))
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "media_delete_admin_manager" ON public.media
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'));

-- ============================================================================
-- 9. public.redirects
-- ============================================================================
CREATE POLICY "redirects_select_public" ON public.redirects
  AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "redirects_insert_admin_marketer" ON public.redirects
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('Admin', 'Marketer'));

CREATE POLICY "redirects_update_admin_marketer" ON public.redirects
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Marketer'))
  WITH CHECK (get_my_role() IN ('Admin', 'Marketer'));

CREATE POLICY "redirects_delete_admin" ON public.redirects
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() = 'Admin');

-- ============================================================================
-- 10. public.clusters
-- ============================================================================
CREATE POLICY "clusters_select_public" ON public.clusters
  AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "clusters_insert_admin_manager" ON public.clusters
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "clusters_update_admin_manager" ON public.clusters
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'))
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "clusters_delete_admin" ON public.clusters
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() = 'Admin');

-- ============================================================================
-- 11. public.cluster_items
-- ============================================================================
CREATE POLICY "cluster_items_select_public" ON public.cluster_items
  AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "cluster_items_insert_admin_manager" ON public.cluster_items
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "cluster_items_update_admin_manager" ON public.cluster_items
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'))
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "cluster_items_delete_admin" ON public.cluster_items
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() = 'Admin');

-- ============================================================================
-- 12. public.internal_links
-- ============================================================================
CREATE POLICY "internal_links_select_public" ON public.internal_links
  AS PERMISSIVE FOR SELECT TO public
  USING (true);

CREATE POLICY "internal_links_insert_admin_manager" ON public.internal_links
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "internal_links_update_admin_manager" ON public.internal_links
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'))
  WITH CHECK (get_my_role() IN ('Admin', 'Content Manager'));

CREATE POLICY "internal_links_delete_admin_manager" ON public.internal_links
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'));

-- ============================================================================
-- 13. public.leads
-- ============================================================================
CREATE POLICY "leads_select_admin_marketer" ON public.leads
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (get_my_role() IN ('Admin', 'Marketer'));

CREATE POLICY "leads_insert_public" ON public.leads
  AS PERMISSIVE FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "leads_update_admin_marketer" ON public.leads
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (get_my_role() IN ('Admin', 'Marketer'))
  WITH CHECK (get_my_role() IN ('Admin', 'Marketer'));

CREATE POLICY "leads_delete_admin" ON public.leads
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() = 'Admin');
