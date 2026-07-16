-- Trigger function that executes on new user insertion in auth.users.
-- Auto-inserts a matching user profile row into public.users.
-- New users always receive the 'Content Manager' role.
-- Role values supplied through sign-up metadata are deliberately ignored.
-- An Admin must manually upgrade a user's role in the public.users table.
-- The first admin user is seeded separately in seed.sql.
-- All comments use British English spelling conventions. No em dashes.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      'Content Manager'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
