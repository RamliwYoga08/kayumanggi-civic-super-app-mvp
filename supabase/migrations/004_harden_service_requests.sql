-- Keep resident-controlled request changes separate from staff workflow actions.
-- The original broad owner UPDATE policy allowed a requester to self-assign
-- privileged statuses such as processing, completed, or rejected.

drop policy if exists service_requests_update on public.service_requests;

create policy service_requests_owner_cancel
on public.service_requests
for update
to authenticated
using (
  user_id = auth.uid()
  and status in ('draft', 'submitted')
)
with check (
  user_id = auth.uid()
  and status in ('draft', 'cancelled')
);

create policy service_requests_staff_update
on public.service_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
