-- Migration to update RLS delete policies for clusters and cluster_items
-- This allows both Admin and Content Manager roles to delete records, aligning with the CMS frontend rules.

DROP POLICY IF EXISTS "clusters_delete_admin" ON public.clusters;
CREATE POLICY "clusters_delete_admin_manager" ON public.clusters
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'));

DROP POLICY IF EXISTS "cluster_items_delete_admin" ON public.cluster_items;
CREATE POLICY "cluster_items_delete_admin_manager" ON public.cluster_items
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (get_my_role() IN ('Admin', 'Content Manager'));
