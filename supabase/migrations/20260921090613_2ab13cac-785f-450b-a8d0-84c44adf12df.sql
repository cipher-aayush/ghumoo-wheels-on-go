-- Grant admin role to the owner account once its email is verified
CREATE OR REPLACE FUNCTION public.grant_admin_for_owner_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) = 'aayushstudy25@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_owner_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_owner_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_for_owner_email();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_owner_admin ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_owner_admin
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_admin_for_owner_email();

-- Backfill if the account already exists and is confirmed
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'aayushstudy25@gmail.com'
  AND email_confirmed_at IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Public, privacy-safe availability lookup: only booked time windows
CREATE OR REPLACE FUNCTION public.vehicle_booked_ranges(_vehicle_id uuid)
RETURNS TABLE (pickup_at timestamptz, dropoff_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.pickup_at, b.dropoff_at
  FROM public.bookings b
  WHERE b.vehicle_id = _vehicle_id
    AND b.status IN ('confirmed', 'ongoing')
    AND b.dropoff_at >= now() - interval '1 day'
  ORDER BY b.pickup_at
$$;

REVOKE ALL ON FUNCTION public.vehicle_booked_ranges(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vehicle_booked_ranges(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vehicle_booked_ranges(uuid) TO service_role;