-- Create lead_notes table
CREATE TABLE public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_notes_admin_marketer" ON public.lead_notes
  FOR ALL TO authenticated
  USING (public.get_my_role() IN ('Admin', 'Marketer'))
  WITH CHECK (public.get_my_role() IN ('Admin', 'Marketer'));

-- Create lead_audit_log table
CREATE TABLE public.lead_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  changed_by_name text,
  from_status text,
  to_status text NOT NULL,
  changed_at timestamptz DEFAULT now()
);

ALTER TABLE public.lead_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_marketer_read" ON public.lead_audit_log
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('Admin', 'Marketer'));

CREATE POLICY "audit_log_system_insert" ON public.lead_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('Admin', 'Marketer'));
