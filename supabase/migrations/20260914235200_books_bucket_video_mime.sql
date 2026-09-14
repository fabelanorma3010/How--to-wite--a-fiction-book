-- The 'books' bucket was created (20260907120000_member_books.sql) with an
-- allow-list that only covers images/PDF/EPUB. Video upload support was
-- added to the app later (Book Panel artwork, account book files) without a
-- matching bucket update, so Supabase Storage silently rejects every video
-- upload at the policy level — the file never lands, even though the app's
-- own client-side type/size checks pass. Add the video types the app
-- already accepts (ACCEPTED_VIDEO in PanelBuilder.tsx / BookManager.tsx).

update storage.buckets
set allowed_mime_types = array[
  'image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/epub+zip',
  'video/mp4', 'video/webm', 'video/quicktime'
]
where id = 'books';
