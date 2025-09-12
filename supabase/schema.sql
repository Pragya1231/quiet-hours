-- Database schema for Quiet Hours Scheduler
create table study_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz default now()
);

create table notifications_sent (
  id bigserial primary key,
  user_id uuid not null,
  block_id uuid not null references study_blocks(id),
  sent_at timestamptz default now(),
  unique(user_id, block_id)
);

alter table study_blocks enable row level security;
create policy "own study blocks" on study_blocks
  for all using (auth.uid() = user_id);

alter table notifications_sent enable row level security;
create policy "own notifications" on notifications_sent
  for select using (auth.uid() = user_id);
