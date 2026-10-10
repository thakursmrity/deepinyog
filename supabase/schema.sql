-- Deepinyog database schema
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.

-- ---------- Studios ----------
-- One studio today. Every record carries studio_id so the app can grow to
-- several teachers later without reshaping the data.
create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.studios (name)
select 'Deepinyog'
where not exists (select 1 from public.studios);

create or replace function public.default_studio_id()
returns uuid language sql stable as $$
  select id from public.studios order by created_at limit 1
$$;

-- ---------- People ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  role text not null default 'student' check (role in ('teacher', 'student')),
  full_name text not null default '',
  email text,
  phone text,
  created_at timestamptz not null default now()
);

-- Private details the teacher keeps about each student.
create table if not exists public.student_details (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  plan text not null default 'Group' check (plan in ('Group', '1-on-1', 'Meditation')),
  goals text not null default '',
  health_notes text not null default '',
  active boolean not null default true,
  joined_on date not null default current_date
);

-- Every new login account gets a student profile automatically.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_teacher()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
$$;

-- ---------- Classes and attendance ----------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  title text not null,
  kind text not null default 'Group' check (kind in ('Group', '1-on-1', 'Meditation')),
  starts_at timestamptz not null,
  duration_minutes int not null default 60,
  meeting_link text,
  student_id uuid references public.profiles(id) on delete cascade, -- set only for 1-on-1
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  present boolean not null default true,
  marked_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

-- ---------- Videos ----------
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  title text not null,
  description text not null default '',
  duration_minutes int,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.video_assignments (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  video_id uuid not null references public.videos(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (video_id, student_id)
);

-- ---------- Notes ----------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  student_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------- Enquiries from the website ----------
-- Written only by the server (never directly by the browser), read by the teacher.
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  name text not null,
  contact text not null,
  interest text not null default 'Not sure yet',
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'joined', 'closed')),
  created_at timestamptz not null default now()
);

-- ---------- Activity log (adoption tracking) ----------
create table if not exists public.activity (
  id bigint generated always as identity primary key,
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  student_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('login', 'video_opened', 'video_completed', 'class_attended')),
  ref_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists activity_student_time on public.activity (student_id, created_at desc);
create index if not exists classes_starts on public.classes (starts_at);

-- ---------- Row level security ----------
-- Students only ever see their own rows. The teacher sees everything.
alter table public.studios enable row level security;
alter table public.profiles enable row level security;
alter table public.student_details enable row level security;
alter table public.classes enable row level security;
alter table public.attendance enable row level security;
alter table public.videos enable row level security;
alter table public.video_assignments enable row level security;
alter table public.notes enable row level security;
alter table public.activity enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "enquiries teacher" on public.enquiries;
create policy "enquiries teacher" on public.enquiries for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "studios read" on public.studios;
create policy "studios read" on public.studios for select to authenticated using (true);

drop policy if exists "profiles own or teacher" on public.profiles;
create policy "profiles own or teacher" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_teacher());
drop policy if exists "profiles teacher write" on public.profiles;
create policy "profiles teacher write" on public.profiles for update to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "details own read" on public.student_details;
create policy "details own read" on public.student_details for select to authenticated
  using (student_id = auth.uid() or public.is_teacher());
drop policy if exists "details teacher write" on public.student_details;
create policy "details teacher write" on public.student_details for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "classes read" on public.classes;
create policy "classes read" on public.classes for select to authenticated
  using (public.is_teacher() or student_id is null or student_id = auth.uid());
drop policy if exists "classes teacher write" on public.classes;
create policy "classes teacher write" on public.classes for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "attendance read" on public.attendance;
create policy "attendance read" on public.attendance for select to authenticated
  using (student_id = auth.uid() or public.is_teacher());
drop policy if exists "attendance teacher write" on public.attendance;
create policy "attendance teacher write" on public.attendance for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "videos read assigned" on public.videos;
create policy "videos read assigned" on public.videos for select to authenticated
  using (public.is_teacher() or exists (
    select 1 from public.video_assignments a where a.video_id = videos.id and a.student_id = auth.uid()));
drop policy if exists "videos teacher write" on public.videos;
create policy "videos teacher write" on public.videos for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "assignments read" on public.video_assignments;
create policy "assignments read" on public.video_assignments for select to authenticated
  using (student_id = auth.uid() or public.is_teacher());
drop policy if exists "assignments teacher write" on public.video_assignments;
create policy "assignments teacher write" on public.video_assignments for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());
-- Students may mark their own assignment complete, and nothing else.
create or replace function public.complete_assignment(assignment uuid)
returns void language sql security definer set search_path = public as $$
  update public.video_assignments
     set completed_at = coalesce(completed_at, now())
   where id = assignment and student_id = auth.uid();
$$;
revoke all on function public.complete_assignment(uuid) from public;
grant execute on function public.complete_assignment(uuid) to authenticated;

drop policy if exists "notes read" on public.notes;
create policy "notes read" on public.notes for select to authenticated
  using (student_id = auth.uid() or public.is_teacher());
drop policy if exists "notes teacher write" on public.notes;
create policy "notes teacher write" on public.notes for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "activity read" on public.activity;
create policy "activity read" on public.activity for select to authenticated
  using (student_id = auth.uid() or public.is_teacher());
drop policy if exists "activity own insert" on public.activity;
create policy "activity own insert" on public.activity for insert to authenticated
  with check (student_id = auth.uid() or public.is_teacher());

-- ---------- Video storage ----------
-- A private bucket. Students get short-lived links only to videos assigned to them.
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

drop policy if exists "videos teacher manage" on storage.objects;
create policy "videos teacher manage" on storage.objects for all to authenticated
  using (bucket_id = 'videos' and public.is_teacher())
  with check (bucket_id = 'videos' and public.is_teacher());

drop policy if exists "videos student read assigned" on storage.objects;
create policy "videos student read assigned" on storage.objects for select to authenticated
  using (bucket_id = 'videos' and exists (
    select 1 from public.videos v
    join public.video_assignments a on a.video_id = v.id
    where v.storage_path = storage.objects.name and a.student_id = auth.uid()));

-- =====================================================================
-- Version 2: free accounts, membership, courses, coaching, payments
-- Safe to run again. Prices are in paise (49900 = Rs 499).
-- =====================================================================

-- New sign-ups also get a student details row.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), new.email)
  on conflict (id) do nothing;
  insert into public.student_details (student_id) values (new.id) on conflict (student_id) do nothing;
  return new;
end;
$$;

-- ---------- What can be bought ----------
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  kind text not null check (kind in ('membership', 'coaching')),
  name text not null,
  description text not null default '',
  price_paise int not null check (price_paise >= 100),
  duration_days int,          -- membership length
  sessions int,               -- coaching pack size
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- Starting prices. She can change them any time from the teacher space.
insert into public.plans (kind, name, description, price_paise, duration_days, sessions, sort)
select * from (values
  ('membership', 'Monthly membership', 'Full video library, new practices every week, and member live classes.', 49900, 30, null::int, 1),
  ('membership', 'Yearly membership', 'Everything in monthly, for a full year. About two months free.', 499900, 365, null::int, 2),
  ('coaching', '1-on-1 coaching: 4 sessions', 'A personal plan with four private sessions, guidance and check-ins.', 399900, null::int, 4, 3),
  ('coaching', '1-on-1 coaching: 8 sessions', 'Eight private sessions for deeper, steady progress.', 749900, null::int, 8, 4)
) as v(kind, name, description, price_paise, duration_days, sessions, sort)
where not exists (select 1 from public.plans);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  description text not null default '',
  status text not null default 'upcoming' check (status in ('upcoming', 'open', 'closed')),
  price_paise int not null default 99900 check (price_paise >= 0),
  early_bird_price_paise int,
  early_bird_until date,
  starts_on date,
  included_in_membership boolean not null default false,
  created_at timestamptz not null default now()
);

-- Videos now have an access level.
alter table public.videos add column if not exists access text not null default 'assigned';
alter table public.videos drop constraint if exists videos_access_check;
alter table public.videos add constraint videos_access_check check (access in ('free', 'members', 'course', 'assigned'));
alter table public.videos add column if not exists course_id uuid references public.courses(id) on delete set null;
alter table public.videos add column if not exists sort int not null default 0;

-- ---------- What people own ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('plan', 'course')),
  item_id uuid not null,
  item_name text not null,
  amount_paise int not null,
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists memberships_user on public.memberships (user_id, ends_at desc);

create table if not exists public.coaching_credits (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  sessions_total int not null,
  sessions_used int not null default 0 check (sessions_used >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  payment_id uuid references public.payments(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists public.waitlist (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- ---------- Access helpers ----------
create or replace function public.has_membership(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships where user_id = uid and starts_at <= now() and ends_at > now())
$$;

create or replace function public.can_watch(vid uuid, uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.videos v
    where v.id = vid and (
      v.access = 'free'
      or exists (select 1 from public.profiles p where p.id = uid and p.role = 'teacher')
      or (v.access = 'members' and public.has_membership(uid))
      or exists (select 1 from public.video_assignments a where a.video_id = v.id and a.student_id = uid)
      or (v.course_id is not null and exists (select 1 from public.enrollments e where e.course_id = v.course_id and e.user_id = uid))
      or (v.course_id is not null and public.has_membership(uid)
          and exists (select 1 from public.courses c where c.id = v.course_id and c.included_in_membership))
    )
  )
$$;

-- ---------- Row level security for version 2 ----------
alter table public.plans enable row level security;
alter table public.courses enable row level security;
alter table public.payments enable row level security;
alter table public.memberships enable row level security;
alter table public.coaching_credits enable row level security;
alter table public.enrollments enable row level security;
alter table public.waitlist enable row level security;

-- Anyone, signed in or not, can see plans and courses (the shop window).
drop policy if exists "plans public read" on public.plans;
create policy "plans public read" on public.plans for select to anon, authenticated using (active or public.is_teacher());
drop policy if exists "plans teacher write" on public.plans;
create policy "plans teacher write" on public.plans for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "courses public read" on public.courses;
create policy "courses public read" on public.courses for select to anon, authenticated using (true);
drop policy if exists "courses teacher write" on public.courses;
create policy "courses teacher write" on public.courses for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Video titles are visible to signed-in people (so locked videos can be previewed).
-- The video files themselves are protected by the storage rules below.
drop policy if exists "videos read assigned" on public.videos;
drop policy if exists "videos read catalog" on public.videos;
create policy "videos read catalog" on public.videos for select to authenticated using (true);

-- Purchases are written only by the server after Razorpay confirms payment.
drop policy if exists "payments own read" on public.payments;
create policy "payments own read" on public.payments for select to authenticated using (user_id = auth.uid() or public.is_teacher());
drop policy if exists "memberships own read" on public.memberships;
create policy "memberships own read" on public.memberships for select to authenticated using (user_id = auth.uid() or public.is_teacher());
drop policy if exists "memberships teacher write" on public.memberships;
create policy "memberships teacher write" on public.memberships for all to authenticated using (public.is_teacher()) with check (public.is_teacher());
drop policy if exists "credits own read" on public.coaching_credits;
create policy "credits own read" on public.coaching_credits for select to authenticated using (user_id = auth.uid() or public.is_teacher());
drop policy if exists "credits teacher write" on public.coaching_credits;
create policy "credits teacher write" on public.coaching_credits for all to authenticated using (public.is_teacher()) with check (public.is_teacher());
drop policy if exists "enrollments own read" on public.enrollments;
create policy "enrollments own read" on public.enrollments for select to authenticated using (user_id = auth.uid() or public.is_teacher());
drop policy if exists "enrollments teacher write" on public.enrollments;
create policy "enrollments teacher write" on public.enrollments for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- People can join and leave a waitlist themselves.
drop policy if exists "waitlist own" on public.waitlist;
create policy "waitlist own" on public.waitlist for all to authenticated
  using (user_id = auth.uid() or public.is_teacher()) with check (user_id = auth.uid() or public.is_teacher());

-- Video files: free for everyone signed in, otherwise by membership, course or assignment.
drop policy if exists "videos student read assigned" on storage.objects;
drop policy if exists "videos watch if allowed" on storage.objects;
create policy "videos watch if allowed" on storage.objects for select to authenticated
  using (bucket_id = 'videos' and exists (
    select 1 from public.videos v
    where v.storage_path = storage.objects.name and public.can_watch(v.id, auth.uid())));

-- Self sign-ups start with no studio-assigned extras; existing accounts get a details row too.
insert into public.student_details (student_id)
select id from public.profiles where role = 'student'
on conflict (student_id) do nothing;

-- =====================================================================
-- Version 3: practice categories with guidance
-- Groups (Start here, Pain relief, Health conditions...) hold categories.
-- A video can sit in several categories. All text is editable by the teacher.
-- =====================================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null default public.default_studio_id() references public.studios(id),
  slug text not null unique,
  grp text not null,
  title text not null,
  summary text not null default '',
  guidance text not null default '',
  caution text not null default '',
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.video_categories (
  video_id uuid not null references public.videos(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (video_id, category_id)
);

insert into public.categories (grp, slug, title, summary, guidance, caution, sort)
select * from (values
  -- Body: yoga and movement
  ('Body', 'yoga-for-beginners', 'Yoga for beginners', 'Gentle first steps on the mat.', 'Start with short Hatha sessions two or three times a week. Move slowly, keep the breath easy, and stop well before any strain.', '', 10),
  ('Body', 'daily-flow', 'Daily flow', 'Short routines to keep the habit alive.', 'A little every day does more than a lot once a week. Pick one flow and repeat it until it feels like yours.', '', 11),
  ('Body', 'back-neck-care', 'Back and neck care', 'Ease the tension of long sitting and screens.', 'Slow, supported movements for the spine, neck and shoulders, with gentle core support.', 'Avoid deep forward bends and sudden twists if pain is sharp. With a slipped disc or recent injury, check with your doctor first.', 12),
  ('Body', 'joint-mobility', 'Joint mobility', 'Keep every joint moving freely.', 'Easy circles and range-of-motion work for wrists, shoulders, hips, knees and ankles. Ideal as a morning warm-up.', 'Move within a pain-free range.', 13),
  ('Body', 'strength-flexibility', 'Strength and flexibility', 'Steady strength with an open, supple body.', 'Balance held poses with gentle stretches, and focus on alignment before adding longer holds.', '', 14),
  ('Body', 'desk-reset', 'Desk and posture reset', 'Quick resets for working days.', 'Five to ten minutes at your desk or chair to open the chest, release the neck and wake up the back.', '', 15),

  -- Breath: pranayama
  ('Breath', 'breathwork-basics', 'Breathwork basics', 'Learn to breathe fully and easily.', 'Sit comfortably and notice the natural breath first, then lengthen it gently. Never strain or force the breath.', 'Stop if you feel dizzy.', 20),
  ('Breath', 'energising-breath', 'Energising breath', 'Wake up body and mind.', 'Dynamic breathing practices are best in the morning on an empty stomach.', 'Avoid fast breathing practices in pregnancy, with high blood pressure or heart conditions unless your doctor agrees.', 21),
  ('Breath', 'calming-breath', 'Calming breath', 'Settle the nervous system.', 'Longer exhales and alternate nostril breathing help the body shift into rest.', '', 22),

  -- Mind: meditation and mindfulness
  ('Mind', 'guided-meditation', 'Guided meditation', 'Simple, guided time for a quieter mind.', 'Start with five to ten minutes. Sit or lie comfortably and let the guidance do the work.', '', 30),
  ('Mind', 'stress-anxiety', 'Stress and anxiety relief', 'Practices to settle a busy mind.', 'Breath, gentle movement and short meditations calm the body first, and the mind follows.', 'If anxiety feels overwhelming, please also reach out to a doctor or counsellor.', 31),
  ('Mind', 'sleep-yoga-nidra', 'Sleep and yoga nidra', 'Deep rest and better sleep.', 'Yoga nidra is practised lying down. Use it in the evening or whenever you feel drained.', '', 32),
  ('Mind', 'focus-clarity', 'Focus and clarity', 'A clear, steady mind for work and study.', 'Short concentration practices and breath awareness, ideally at the same time each day.', '', 33),
  ('Mind', 'mindful-living', 'Mindful living', 'Bring awareness into everyday moments.', 'Small practices for eating, walking and working with more presence.', '', 34),

  -- Soul: inner peace and growth
  ('Soul', 'lemurian-yoga', 'Sri Sri Lemurian Yoga', 'Return to effortless: flowing movement and deep meditation.', 'Gentle, flowing movements that boost energy, ease the joints and lead into deep meditation.', '', 40),
  ('Soul', 'chanting-mantra', 'Chanting and mantra', 'Sound and vibration for a peaceful mind.', 'Chant slowly and let the vibration settle you. Listening quietly is a practice too.', '', 41),
  ('Soul', 'gratitude-self-love', 'Gratitude and self-love', 'Gentle practices to feel at home in yourself.', 'Short reflections, journaling prompts and heart-opening practice.', '', 42),
  ('Soul', 'inner-wisdom', 'Wisdom and reflection', 'Talks and reflections for everyday life.', 'Listen with an open mind and take one idea into your day.', '', 43),

  -- Healing: yoga therapy and Marma
  ('Healing', 'marma-therapy', 'Marma therapy', 'Ancient energy-point care for body and mind.', 'Marma works with vital points to release tension and support the flow of energy. Learn simple self-care points here.', 'For specific health concerns, book a personal session rather than self-treating.', 50),
  ('Healing', 'thyroid', 'Thyroid', 'Supportive practice alongside your treatment.', 'Calm, regular practice with gentle neck movements and soothing breathwork.', 'Yoga supports wellbeing but does not replace medical treatment. Keep taking prescribed medicines.', 51),
  ('Healing', 'pcos-hormones', 'PCOS and hormonal balance', 'Steady movement and stress care for hormonal health.', 'Regular moderate movement, hip openers and calming breath, with good sleep and routine.', 'Work with your doctor on diagnosis and treatment.', 52),
  ('Healing', 'diabetes-support', 'Diabetes support', 'Regular movement for a healthy routine.', 'A consistent daily practice alongside diet and medical advice.', 'Keep a snack nearby and check your sugar levels as your doctor advises.', 53),
  ('Healing', 'blood-pressure', 'Blood pressure', 'Calming, gentle practice.', 'Slow movement, long exhales and relaxation.', 'Avoid holding the breath and strong inversions with high blood pressure. Follow your doctor''s advice.', 54),
  ('Healing', 'digestion-weight', 'Digestion and healthy weight', 'Comfortable digestion and a balanced metabolism.', 'Gentle twists and flows, a few hours after meals, with steady consistency.', '', 55),

  -- Women and family
  ('Women and family', 'periods', 'Periods and PMS', 'Comfort and ease through the cycle.', 'Restful, supported poses and gentle breathing on heavier days.', 'Skip strong inversions and intense core work if they feel uncomfortable.', 60),
  ('Women and family', 'pregnancy', 'Pregnancy', 'Gentle prenatal practice.', 'Supported movement and breath for each trimester.', 'Only practise with your doctor''s approval. Avoid lying on the back for long later in pregnancy, deep twists and strong core work.', 61),
  ('Women and family', 'postnatal', 'After childbirth', 'Rebuild strength gently after birth.', 'Begin with breath and gentle pelvic floor work, adding more over time.', 'Wait for your doctor''s go-ahead, especially after a C-section.', 62),
  ('Women and family', 'kids-mindfulness', 'Kids yoga and mindfulness', 'Playful practice for calm, focused children.', 'Short, playful sessions with stories, animal poses and simple breathing games.', 'Children should practise with an adult nearby.', 63),

  -- Everyday wellness
  ('Everyday wellness', 'morning-rituals', 'Morning rituals', 'Start the day grounded and energised.', 'A simple sequence of movement, breath and intention you can do in fifteen minutes.', '', 70),
  ('Everyday wellness', 'mindful-eating', 'Mindful eating', 'A kinder, calmer relationship with food.', 'Slow down, notice hunger and fullness, and enjoy each meal with attention.', '', 71),
  ('Everyday wellness', 'wellness-at-work', 'Wellness at work', 'For busy professionals and teams.', 'Short practices for focus, posture and stress you can fit between meetings.', '', 72)
) as v(grp, slug, title, summary, guidance, caution, sort)
where not exists (select 1 from public.categories);

alter table public.categories enable row level security;
alter table public.video_categories enable row level security;

drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select to anon, authenticated using (active or public.is_teacher());
drop policy if exists "categories teacher write" on public.categories;
create policy "categories teacher write" on public.categories for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "video categories public read" on public.video_categories;
create policy "video categories public read" on public.video_categories for select to anon, authenticated using (true);
drop policy if exists "video categories teacher write" on public.video_categories;
create policy "video categories teacher write" on public.video_categories for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Visitors can see video titles on category pages (the files stay protected).
drop policy if exists "videos read catalog" on public.videos;
create policy "videos read catalog" on public.videos for select to anon, authenticated using (access <> 'assigned' or public.is_teacher()
  or exists (select 1 from public.video_assignments a where a.video_id = videos.id and a.student_id = auth.uid()));

-- =====================================================================
-- Version 4: YouTube videos
-- Free videos can be YouTube links (embedded, nothing stored). Paid videos
-- are uploaded to the private bucket, because a YouTube link can be shared.
-- =====================================================================
alter table public.videos add column if not exists youtube_id text;
alter table public.videos alter column storage_path drop not null;
alter table public.videos drop constraint if exists videos_source_check;
alter table public.videos add constraint videos_source_check check (storage_path is not null or youtube_id is not null);
alter table public.videos drop constraint if exists videos_youtube_free_check;
alter table public.videos add constraint videos_youtube_free_check check (youtube_id is null or access = 'free');
create unique index if not exists videos_youtube_unique on public.videos (youtube_id) where youtube_id is not null;

-- =====================================================================
-- Version 5: programs and workshops
-- Courses can also be live programs: a schedule line, co-hosts, and an
-- optional outside registration link (for example a Google Form).
-- =====================================================================
alter table public.courses add column if not exists kind text not null default 'course';
alter table public.courses drop constraint if exists courses_kind_check;
alter table public.courses add constraint courses_kind_check check (kind in ('course', 'program', 'workshop'));
alter table public.courses add column if not exists schedule text not null default '';
alter table public.courses add column if not exists hosts text not null default '';
alter table public.courses add column if not exists register_url text;

-- Free programs: people can enroll themselves when the price is zero.
create or replace function public.enroll_free(course uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into public.enrollments (user_id, course_id)
  select auth.uid(), c.id from public.courses c
  where c.id = course and c.price_paise = 0 and c.status = 'open'
  on conflict (user_id, course_id) do nothing;
end;
$$;
revoke all on function public.enroll_free(uuid) from public;
grant execute on function public.enroll_free(uuid) to authenticated;
