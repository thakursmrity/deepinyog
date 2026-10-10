-- Deepinyog update: replace the old practice topics with the ten programs,
-- and add the BackYourBack live program.
-- Run once in Supabase: SQL Editor > New query > paste > Run.
-- Your videos are kept. Only the old topic list (and which videos were tagged to it) is replaced.

alter table public.categories add column if not exists tagline text not null default '';
alter table public.categories add column if not exists highlights text not null default '';

delete from public.categories
where slug not in ('hatha-yoga', 'yoga-therapy', 'marma-therapy', 'pranayama', 'meditation', 'lemurian-yoga', 'womens-wellness', 'kids-yoga', 'workplace-wellness', 'life-coaching');

insert into public.categories (grp, slug, title, tagline, summary, highlights, guidance, caution, sort)
select * from (values
  ('Programs', 'hatha-yoga', 'Hatha Yoga', 'Strength, ease and balance', 'Classical postures, held with awareness and paired with the breath. A steady practice for beginners and for anyone coming back to the mat.', 'Starting out with yoga
Flexibility and mobility
Strength and stamina
Posture and alignment
A daily routine', 'We begin slowly, with joint warm-ups and simple postures, and build gradually. Every posture has easier and deeper versions, so you practise at the level that suits your body today.', '', 10),
  ('Programs', 'yoga-therapy', 'Yoga Therapy', 'Healing, one posture at a time', 'Gentle, therapeutic practice shaped around a specific concern, alongside the care you already receive.', 'Back and neck pain
Knees and joints
Thyroid
PCOS and hormonal balance
Diabetes support
Blood pressure', 'Therapy sessions start with understanding you: your history, your body and what you need. The practice is then built around that, with postures, breath and relaxation chosen for you.', 'Yoga supports healing but does not replace medical treatment. Please keep following your doctor''s advice and share any diagnosis or injury with me before we begin.', 20),
  ('Programs', 'marma-therapy', 'Marma Therapy', 'Release through the body''s vital points', 'An ancient practice that works with vital energy points to release tension, ease pain and restore the flow of energy.', 'Stress and tension release
Pain relief
Better sleep
Energy and vitality
Simple self-care points', 'Sessions combine gentle work on marma points with breath and relaxation. I also share simple points you can use for yourself at home.', 'For a specific health concern, please book a personal session rather than self-treating.', 30),
  ('Programs', 'pranayama', 'Pranayama and Breathwork', 'The breath is the bridge', 'Breathing practices to energise the body, calm the nervous system and steady the mind.', 'Energy in the morning
Calm in stressful moments
Better lung capacity
Focus and clarity', 'We sit comfortably and first observe the natural breath, then slowly lengthen and guide it. The breath is never strained or forced.', 'Avoid fast breathing practices in pregnancy or with high blood pressure or heart conditions unless your doctor agrees. Stop if you feel dizzy.', 40),
  ('Programs', 'meditation', 'Meditation and Yoga Nidra', 'Stillness, sleep and clarity', 'Guided meditation and yoga nidra, deep relaxation practised lying down, for a quieter mind and deeper rest.', 'Stress and anxiety
Deeper sleep
Focus and clarity
Emotional balance', 'Start with ten minutes, sitting or lying down, and let the guidance carry you. Regular, short practice works better than occasional long sessions.', 'If anxiety feels overwhelming, please also reach out to a doctor or counsellor.', 50),
  ('Programs', 'lemurian-yoga', 'Sri Sri Lemurian Yoga', 'Return to effortless', 'Soft, flowing movements that boost energy, ease the joints, calm the busy mind and lead naturally into deep meditation.', 'Energy levels
Joint mobility
A calmer, quieter mind
Deep meditation', 'There is nothing to achieve here. We move gently and continuously, letting the body find its own rhythm, and then rest in stillness.', '', 60),
  ('Programs', 'womens-wellness', 'Women''s Wellness', 'For every season of womanhood', 'Gentle, supportive practice through periods, pregnancy, life after childbirth and hormonal changes.', 'Periods and PMS
Pregnancy
After childbirth
Hormonal balance', 'Practice changes with each stage: restful and supported on heavier days, gentle and steady in pregnancy, rebuilding slowly after birth.', 'During pregnancy and after childbirth, please practise only with your doctor''s approval.', 70),
  ('Programs', 'kids-yoga', 'Kids Yoga and Mindfulness', 'Calm, focused, joyful children', 'Playful sessions with stories, animal poses and breathing games that help children settle, focus and feel good in their bodies.', 'Focus and attention
Calm and emotional balance
Posture and flexibility
Confidence', 'Sessions are short, playful and full of movement, with a quiet moment of rest at the end.', 'Children should practise with an adult nearby.', 80),
  ('Programs', 'workplace-wellness', 'Workplace Wellness', 'Calmer teams, clearer minds', 'Yoga, breathwork and stress care for teams, designed around long hours, screens and busy schedules.', 'Desk and posture resets
Stress management
Focus and energy
Team wellbeing sessions', 'I have guided corporate teams and administrators for over a decade. Sessions can be one-off workshops or a regular series, online or in person.', '', 90),
  ('Programs', 'life-coaching', 'Life Coaching and Soulful Conversations', 'Find your way back to yourself', 'Unhurried one-to-one conversations on stress, purpose, relationships and balance, with practices to take into everyday life.', 'Clarity and direction
Habits that last
Emotional balance
Purpose and self-belief', 'We talk, we listen, and we find small, steady steps forward, supported by breath and reflection practices you can use every day.', '', 100)
) as v(grp, slug, title, tagline, summary, highlights, guidance, caution, sort)
on conflict (slug) do update set
  grp = excluded.grp, title = excluded.title, tagline = excluded.tagline, summary = excluded.summary,
  highlights = excluded.highlights, guidance = excluded.guidance, caution = excluded.caution, sort = excluded.sort;

insert into public.courses (slug, title, kind, status, price_paise, summary, description, schedule, hosts, register_url, starts_on)
select 'backyourback', 'BackYourBack', 'program', 'open', 0,
  'Reclaim your comfort and mobility. Simple everyday practices for neck and lower-back tension.',
  'Do long sitting hours, screen time, neck stiffness, shoulder tension or lower-back discomfort affect your everyday comfort?

Join BackYourBack, a 3-day online wellness program with simple, practical practices to support better posture, mobility, flexibility, strength and ease of movement.

Please feel free to share this with family, friends or colleagues who may benefit.',
  '12 to 14 October 2026, 7:00 to 8:30 AM IST, online from home',
  'Dr. Rohit Sabharwal',
  'https://forms.gle/uznHF2TzauF2APCQ9',
  date '2026-10-12'
where not exists (select 1 from public.courses where slug = 'backyourback');
