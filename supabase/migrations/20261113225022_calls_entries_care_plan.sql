-- The three tables of ADR-0002. The page reads them with the anon key;
-- every write goes through the server with the service role key.

-- One row: what Laura knows about the Care recipient.
create table care_plan (
  id int primary key default 1 check (id = 1),
  family_phrase text not null,
  medications jsonb not null, -- [{ "name", "strength", "time_of_day" }]
  watch_items text[] not null
);

create table calls (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'live' check (status in ('live', 'done')),
  summary text,
  started_at timestamptz not null default now()
);

create table entries (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references calls on delete cascade,
  kind text not null check (kind in ('wellbeing', 'remark', 'dose', 'reading', 'errand', 'pass_on')),
  quote text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now(),
  done_at timestamptz -- Errands only
);

create index entries_call_id_idx on entries (call_id);

alter table care_plan enable row level security;
alter table calls enable row level security;
alter table entries enable row level security;

create policy "Anyone can read the care plan" on care_plan for select to anon using (true);
create policy "Anyone can read calls" on calls for select to anon using (true);
create policy "Anyone can read entries" on entries for select to anon using (true);

grant select on care_plan, calls, entries to anon;
grant all on care_plan, calls, entries to service_role;

alter publication supabase_realtime add table calls, entries;
