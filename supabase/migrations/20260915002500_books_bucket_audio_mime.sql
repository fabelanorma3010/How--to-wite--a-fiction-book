-- Same root cause as 20260914235200_books_bucket_video_mime.sql, for audio
-- this time: Book Panel's voiceover recorder and audio uploader
-- (ACCEPTED_AUDIO_PREFIXES in PanelBuilder.tsx) have accepted audio files
-- client-side since the feature shipped, but the 'books' bucket's allow-list
-- never included a single audio/* type — every recording or uploaded
-- voiceover has been silently rejected by Supabase Storage itself, so
-- panel.audio never actually gets set. Nothing was ever saved to lose.
--
-- The recorder's blob type often carries codec parameters (e.g.
-- 'audio/webm;codecs=opus'), which wouldn't exact-match a plain
-- 'audio/webm' entry — 'audio/*' covers that regardless of codec, on top of
-- the exact types the app also accepts from a picked file.

update storage.buckets
set allowed_mime_types = array[
  'image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/epub+zip',
  'video/mp4', 'video/webm', 'video/quicktime',
  'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/aac', 'audio/x-m4a',
  'audio/*'
]
where id = 'books';
