
  create policy "rw_all"
  on "public"."blueprints"
  as permissive
  for all
  to public
using (true)
with check (true);



