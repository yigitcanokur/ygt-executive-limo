
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reservation_id text unique not null,
  stripe_session_id text unique not null,
  payment_status text default 'paid',
  amount_total integer default 0,
  currency text default 'usd',
  customer_name text,
  customer_email text,
  customer_phone text,
  service_type text,
  route_key text,
  vehicle text,
  pickup_address text,
  dropoff_address text,
  pickup_date text,
  pickup_time text,
  return_date text,
  return_time text,
  flight text,
  airline text,
  pickup_style text,
  child_seat text,
  passengers text,
  luggage text,
  notes text,
  status text default 'New',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bookings enable row level security;
-- No public policies are created. Access is server-side only through the service role key.
