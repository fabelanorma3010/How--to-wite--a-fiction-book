-- A "chapter book" is prose, not comic/manga pages — a chapter can now hold
-- formatted text (with inline images as markdown and emoji as plain
-- characters) instead of an array of page images. A chapter has one or the
-- other: body set for a text chapter, pages set for an image chapter.
alter table public.book_chapters add column body text;

alter table public.books drop constraint books_book_type_check;
alter table public.books add constraint books_book_type_check
  check (book_type in ('comic', 'manga', 'cartoon', 'childrens', 'chapterbook'));

notify pgrst, 'reload schema';
