-- Migration to update public.handle_new_user trigger function.
-- Supports automatic public.customers profile creation on customer signup.
-- British English. No em dashes.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is registering as a customer, insert into the public.customers table.
  -- Otherwise, treat them as dashboard users with the 'Content Manager' role.
  IF COALESCE(NEW.raw_user_meta_data->>'role', '') = 'customer' THEN
    INSERT INTO public.customers (id, name, email, phone, country)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'country', 'United Kingdom')
    );
  ELSE
    INSERT INTO public.users (id, name, email, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      'Content Manager'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';
