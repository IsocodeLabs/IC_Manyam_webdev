-- Create booking_notes table
CREATE TABLE IF NOT EXISTS public.booking_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_by_name text
);

-- Create booking_audit_logs table
CREATE TABLE IF NOT EXISTS public.booking_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  changed_by_name text,
  from_status text,
  to_status text NOT NULL,
  notes text,
  changed_at timestamptz DEFAULT now()
);

-- Add refund_amount column to public.bookings if not exists
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_amount integer NOT NULL DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.booking_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_audit_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DROP POLICY IF EXISTS "booking_notes_staff_all" ON public.booking_notes;
CREATE POLICY "booking_notes_staff_all" ON public.booking_notes
  FOR ALL TO authenticated
  USING (public.get_my_role() IN ('Admin', 'Marketer'))
  WITH CHECK (public.get_my_role() IN ('Admin', 'Marketer'));

DROP POLICY IF EXISTS "booking_audit_logs_staff_select" ON public.booking_audit_logs;
CREATE POLICY "booking_audit_logs_staff_select" ON public.booking_audit_logs
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('Admin', 'Marketer'));

DROP POLICY IF EXISTS "booking_audit_logs_staff_insert" ON public.booking_audit_logs;
CREATE POLICY "booking_audit_logs_staff_insert" ON public.booking_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('Admin', 'Marketer'));
