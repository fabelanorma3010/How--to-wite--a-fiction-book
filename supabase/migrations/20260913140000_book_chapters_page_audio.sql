-- A voiceover clip per page, parallel to pages/page_captions by index — ''
-- means that page has no audio. Lets a Book Panel page carry a narration
-- clip alongside its art and caption.

alter table public.book_chapters
  add column if not exists page_audio text[] not null default '{}';

comment on column public.book_chapters.page_audio is 'Per-page voiceover URL, parallel to pages by index; '''' means no audio for that page.';

notify pgrst, 'reload schema';
