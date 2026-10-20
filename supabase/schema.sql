-- ============================================================================
-- Kinnotaka Karate Academy (金鷹空手道場)
-- Supabase PostgreSQL Schema for Student Registrations
-- Run this script in the Supabase Dashboard -> SQL Editor
-- ============================================================================

create table if not exists public.students (
  id text primary key,
  name text not null check (char_length(trim(name)) >= 2),
  age integer not null check (age >= 3 and age <= 110),
  sex text not null check (sex in ('Male', 'Female', 'Other')),
  date_of_birth date not null,
  place_of_birth text not null check (char_length(trim(place_of_birth)) >= 2),
  address text not null check (char_length(trim(address)) >= 5),
  program text not null default 'Adult Traditional Karate (Ages 18+)',
  rank text not null default '10th Kyu · White Belt',
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for fast sorting & search
create index if not exists idx_students_registered_at on public.students (registered_at desc);
create index if not exists idx_students_name on public.students (name);

-- Auto-update updated_at timestamp on row update
create or replace function public.set_students_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row
execute function public.set_students_updated_at();

-- Enable Row Level Security (RLS)
alter table public.students enable row level security;

-- Allow read/write operations via Supabase API (adjust policies for production auth rules as needed)
drop policy if exists "Allow public read access to students" on public.students;
create policy "Allow public read access to students"
  on public.students for select
  using (true);

drop policy if exists "Allow public insert access to students" on public.students;
create policy "Allow public insert access to students"
  on public.students for insert
  with check (true);

drop policy if exists "Allow public update access to students" on public.students;
create policy "Allow public update access to students"
  on public.students for update
  using (true)
  with check (true);

drop policy if exists "Allow public delete access to students" on public.students;
create policy "Allow public delete access to students"
  on public.students for delete
  using (true);
