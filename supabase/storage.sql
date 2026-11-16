-- Öffentlicher Bucket für Tierbilder; hochladen/ändern/löschen nur Admin/Mitarbeiter
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tierbilder', 'tierbilder', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists tierbilder_staff_insert on storage.objects;
create policy tierbilder_staff_insert on storage.objects for insert to authenticated with check (bucket_id = 'tierbilder' and public.is_staff());
drop policy if exists tierbilder_staff_update on storage.objects;
create policy tierbilder_staff_update on storage.objects for update to authenticated using (bucket_id = 'tierbilder' and public.is_staff()) with check (bucket_id = 'tierbilder' and public.is_staff());
drop policy if exists tierbilder_staff_delete on storage.objects;
create policy tierbilder_staff_delete on storage.objects for delete to authenticated using (bucket_id = 'tierbilder' and public.is_staff());
