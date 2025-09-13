create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text
);

-- Trigger function: insert profile row when new user is confirmed
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

create table study_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  reminder_sent boolean default false,
);

create policy "Users can view their own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can insert their profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can update their profile"
on profiles for update
using (auth.uid() = id);

-- Policies for study_blocks
create policy "Users can view their own blocks"
on study_blocks for select
using (auth.uid() = user_id);

create policy "Users can insert their own blocks"
on study_blocks for insert
with check (auth.uid() = user_id);

create policy "Users can update their own blocks"
on study_blocks for update
using (auth.uid() = user_id);

create policy "Users can delete their own blocks"
on study_blocks for delete
using (auth.uid() = user_id);