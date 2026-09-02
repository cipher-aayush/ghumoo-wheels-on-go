
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  phone text,
  email text,
  license_number text,
  license_url text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  type text NOT NULL,
  city text NOT NULL,
  transmission text NOT NULL,
  fuel text NOT NULL,
  seats int NOT NULL DEFAULT 5,
  mileage text,
  luggage text,
  price_per_hour numeric NOT NULL,
  price_per_day numeric NOT NULL,
  security_deposit numeric NOT NULL DEFAULT 2000,
  rating numeric NOT NULL DEFAULT 4.5,
  trips int NOT NULL DEFAULT 0,
  description text,
  image_key text NOT NULL DEFAULT 'hatchback',
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles public read" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "admins manage vehicles" ON public.vehicles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('GH' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  user_id uuid NOT NULL,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  pickup_city text NOT NULL,
  pickup_location text,
  pickup_at timestamptz NOT NULL,
  dropoff_at timestamptz NOT NULL,
  addons jsonb NOT NULL DEFAULT '[]'::jsonb,
  customer_name text,
  customer_phone text,
  customer_email text,
  license_number text,
  payment_method text,
  base_amount numeric NOT NULL DEFAULT 0,
  addons_amount numeric NOT NULL DEFAULT 0,
  taxes numeric NOT NULL DEFAULT 0,
  deposit numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookings read" ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own bookings insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own bookings update" ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete bookings" ON public.bookings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, vehicle_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favorites" ON public.favorites FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO public.vehicles (name, brand, type, city, transmission, fuel, seats, mileage, luggage, price_per_hour, price_per_day, security_deposit, rating, trips, description, image_key) VALUES
('Swift VXi','Maruti','Hatchback','Bengaluru','Manual','Petrol',5,'21 km/l','2 bags',329,1899,2000,4.7,214,'Nimble city hatchback with light steering and great fuel economy.','hatchback'),
('i20 Sportz','Hyundai','Hatchback','Mumbai','Automatic','Petrol',5,'19 km/l','2 bags',349,1999,2000,4.6,182,'Premium hatchback with a smooth automatic gearbox.','hatchback'),
('Tiago XZ','Tata','Hatchback','Pune','Manual','Petrol',5,'20 km/l','2 bags',299,1699,2000,4.4,96,'Solid, safe and easy to park in tight city lanes.','hatchback'),
('Aura S','Hyundai','Sedan','Bengaluru','Manual','Petrol',5,'20 km/l','3 bags',349,2099,2500,4.8,301,'Compact sedan with a genuinely usable boot.','sedan'),
('City ZX','Honda','Sedan','Delhi NCR','Automatic','Petrol',5,'18 km/l','3 bags',499,2899,3000,4.9,258,'Refined highway cruiser with a silky CVT.','sedan'),
('Virtus GT','Volkswagen','Sedan','Hyderabad','Automatic','Petrol',5,'17 km/l','3 bags',549,3199,3000,4.7,74,'Turbo-petrol sedan built for long weekend runs.','sedan'),
('Harrier XZ+','Tata','SUV','Bengaluru','Automatic','Diesel',5,'16 km/l','4 bags',599,3499,5000,4.9,187,'Commanding road presence with a comfortable ride.','suv'),
('Creta SX','Hyundai','SUV','Chennai','Automatic','Diesel',5,'17 km/l','4 bags',579,3299,5000,4.8,221,'The all-rounder SUV for hills and highways alike.','suv'),
('Innova Crysta','Toyota','SUV','Kochi','Automatic','Diesel',7,'14 km/l','5 bags',749,4299,6000,4.6,140,'Seven-seat workhorse for family trips.','suv'),
('Scorpio N','Mahindra','SUV','Jaipur','Manual','Diesel',7,'15 km/l','5 bags',699,3999,6000,4.5,88,'Rugged and unbothered by broken roads.','suv'),
('Nexon EV','Tata','SUV','Pune','Automatic','Electric',5,'320 km range','3 bags',529,2999,5000,4.7,132,'Silent electric SUV with instant torque.','ev'),
('MG Comet EV','MG','Hatchback','Mumbai','Automatic','Electric',4,'230 km range','1 bag',249,1499,2500,4.3,64,'Tiny electric city runabout, ridiculously easy to park.','ev'),
('Classic 350','Royal Enfield','Bike','Goa','Manual','Petrol',2,'37 km/l','Saddle bag',129,799,1500,4.8,412,'Thumping cruiser made for coastal roads.','bike'),
('Activa 6G','Honda','Bike','Bengaluru','Automatic','Petrol',2,'50 km/l','Under seat',69,449,1000,4.5,530,'Effortless scooter for zipping across town.','bike');
