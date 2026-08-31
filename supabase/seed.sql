-- Local development seed data. Runs after migrations on `supabase db reset`.
--
-- Fixed UUIDs so re-seeding is idempotent. The three members below exist only
-- to satisfy posts.user_id; the five Posts rows are the requested seed data.

insert into public.users (id, name, email, bio, avatar_url) values
  ('11111111-1111-1111-1111-111111111111', 'Ada Quill',    'ada@example.com',
   'Comic-book writer, ex-newspaper strip artist.',
   'https://i.pravatar.cc/240?img=47'),
  ('22222222-2222-2222-2222-222222222222', 'Marco Panels',  'marco@example.com',
   'Self-publishing manga one-shots and learning as I go.',
   'https://i.pravatar.cc/240?img=12'),
  ('33333333-3333-3333-3333-333333333333', 'Rin Sketch',    'rin@example.com',
   'Picture-book author-illustrator. Rhyme enthusiast.',
   'https://i.pravatar.cc/240?img=32')
on conflict (id) do nothing;

insert into public.posts (id, user_id, title, body, image_url, category, tags, published_at) values
  (
    '10000000-0000-4000-8000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'How I script a six-panel action page',
    'I write the beat as one sentence first — "she vaults the railing and lands in the alley" — then break it across panels so the landing gets its own frame. Wide panel for the vault, tall skinny panel for the drop, then a beat panel with no dialogue before the punch lands.',
    null,
    'comic',
    array['scripting', 'pacing', 'action'],
    now() - interval '11 days'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'Right-to-left paneling mistakes I made for a year',
    'Every panel, balloon, and sound effect reads right-to-left, top-to-bottom. I had the panel order right but kept placing the first speech balloon on the left, so readers hit the reply before the line. Number your balloons on the thumbnail until it is muscle memory.',
    null,
    'manga',
    array['paneling', 'layout', 'lettering'],
    now() - interval '8 days'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    'One idea per page, and why the page turn is the joke',
    'A picture book is a series of page turns, and each turn should deliver a small surprise. I draft on folded paper so I feel where the turn falls, then cut any sentence that explains what the next page already shows.',
    null,
    'childrens',
    array['picture-books', 'read-aloud', 'structure'],
    now() - interval '5 days'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'Designing a hero you can recognize in silhouette',
    'Fill the character in solid black. If you cannot tell who it is from the outline alone, the design is doing too much. I test every main cast member this way before the first script page is drawn.',
    null,
    'comic',
    array['character-design', 'silhouette', 'process'],
    now() - interval '3 days'
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    '22222222-2222-2222-2222-222222222222',
    'Squash, stretch, and the timing of a sight gag',
    'Comic timing lives in the panel count. A three-panel setup-setup-punchline beat works because the reader''s eye paces it for you. Give the reaction its own panel and let the character deform — rigid poses kill the laugh.',
    null,
    'cartoon',
    array['comedy', 'timing', 'animation-principles'],
    now() - interval '1 day'
  )
on conflict (id) do nothing;
