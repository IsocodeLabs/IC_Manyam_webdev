-- Create commerce tables migration for MANNYAM CMS
-- British English. No em dashes. Prices stored in minor units.

-- ============================================================================
-- 1. public.customers
-- ============================================================================
CREATE TABLE public.customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- customers: a customer can select/update/insert only their own row (id = auth.uid()); Admin full access
CREATE POLICY "customers_self_select" ON public.customers
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "customers_self_update" ON public.customers
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "customers_self_insert" ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "customers_admin_all" ON public.customers
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'Admin')
  WITH CHECK (public.get_my_role() = 'Admin');


-- ============================================================================
-- 2. public.pricing
-- ============================================================================
CREATE TABLE public.pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'GBP' CHECK (currency IN ('GBP','USD','EUR','INR')),
  base_amount integer NOT NULL, -- minor units (pence/cents)
  deposit_amount integer,       -- nullable; if set, deposit option is offered
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;

-- pricing: SELECT for Admin and the checkout server (service role); NEVER exposed to anon
CREATE POLICY "pricing_admin_all" ON public.pricing
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'Admin')
  WITH CHECK (public.get_my_role() = 'Admin');


-- ============================================================================
-- 3. public.bookings
-- ============================================================================
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id),
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Confirmed','Paid','Cancelled','Refunded')),
  currency text NOT NULL,
  total_amount integer NOT NULL,
  amount_paid integer NOT NULL DEFAULT 0,
  payment_type text CHECK (payment_type IN ('deposit','full')),
  stripe_session_id text,
  stripe_payment_intent text,
  contact_name text,
  contact_email text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- bookings: a customer sees only their own; Admin and Marketer see all; insert allowed via server
CREATE POLICY "bookings_customer_select" ON public.bookings
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "bookings_staff_select" ON public.bookings
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('Admin', 'Marketer'));

CREATE POLICY "bookings_admin_all" ON public.bookings
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'Admin')
  WITH CHECK (public.get_my_role() = 'Admin');


-- ============================================================================
-- 4. public.booking_items
-- ============================================================================
CREATE TABLE public.booking_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  package_id uuid REFERENCES public.packages(id),
  package_title text NOT NULL, -- snapshot
  departure_date date,
  travellers integer NOT NULL DEFAULT 1,
  unit_amount integer NOT NULL,
  line_amount integer NOT NULL
);

ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

-- booking_items: a customer sees only their own; Admin and Marketer see all; insert allowed via server
CREATE POLICY "booking_items_customer_select" ON public.booking_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND b.customer_id = auth.uid()
  ));

CREATE POLICY "booking_items_staff_select" ON public.booking_items
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('Admin', 'Marketer'));

CREATE POLICY "booking_items_admin_all" ON public.booking_items
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'Admin')
  WITH CHECK (public.get_my_role() = 'Admin');


-- ============================================================================
-- 5. public.discount_codes
-- ============================================================================
CREATE TABLE public.discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('percent','fixed')),
  value integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  max_uses integer,
  times_used integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- discount_codes: SELECT for authenticated staff; validation happens server-side; Admin write
CREATE POLICY "discount_codes_staff_select" ON public.discount_codes
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('Admin', 'Content Manager', 'Marketer'));

CREATE POLICY "discount_codes_admin_all" ON public.discount_codes
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'Admin')
  WITH CHECK (public.get_my_role() = 'Admin');
