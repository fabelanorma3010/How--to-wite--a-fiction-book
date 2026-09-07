-- Picture-book pages can now carry a short caption alongside the picture —
-- shown as a bottom caption bar for the 'big' caption style (children's
-- picture books) or a speech-bubble overlay for 'balloon' / 'manga' /
-- 'bubble' styles (comic, manga, cartoon). Optional and parallel to `pages`
-- by index; empty/missing entries just mean that page has no caption.
alter table public.book_chapters add column page_captions text[] not null default '{}';

notify pgrst, 'reload schema';
