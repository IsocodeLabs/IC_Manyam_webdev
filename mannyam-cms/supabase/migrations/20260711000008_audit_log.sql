-- Create lead_audit_log table if not exists (forward-compatibility)
CREATE TABLE IF NOT EXISTS public.lead_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  changed_by_name text,
  from_status text,
  to_status text NOT NULL,
  changed_at timestamptz DEFAULT now()
);

ALTER TABLE public.lead_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_admin_marketer_read" ON public.lead_audit_log;
CREATE POLICY "audit_log_admin_marketer_read" ON public.lead_audit_log
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('Admin', 'Marketer'));

DROP POLICY IF EXISTS "audit_log_system_insert" ON public.lead_audit_log;
CREATE POLICY "audit_log_system_insert" ON public.lead_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('Admin', 'Marketer'));
