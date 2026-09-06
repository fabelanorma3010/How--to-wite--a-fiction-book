-- Extend notebook picture attachments to also accept PDF reference files
-- (e.g. a scanned reference sheet), not just images. content_type records
-- what was actually uploaded so the UI can render a PDF tile instead of
-- trying to preview it as an image.

alter table public.notebook_images add column if not exists content_type text;

update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
where id = 'notebook-images';

notify pgrst, 'reload schema';
