-- Social UI foundations used by the Kayumanggi responsive experience.

alter table public.posts add column if not exists media_path text;
alter table public.posts add column if not exists media_type text check (media_type in ('image', 'video'));

create or replace function public.respond_to_friend_request(p_request_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.friend_requests%rowtype;
  v_user_a uuid;
  v_user_b uuid;
begin
  select * into v_request
  from public.friend_requests
  where id = p_request_id and addressee_id = auth.uid() and status = 'pending'
  for update;

  if not found then raise exception 'Pending friend request not found'; end if;

  if p_accept then
    update public.friend_requests set status = 'accepted' where id = p_request_id;
    v_user_a := least(v_request.requester_id, v_request.addressee_id);
    v_user_b := greatest(v_request.requester_id, v_request.addressee_id);
    insert into public.friendships(user_a, user_b) values(v_user_a, v_user_b)
    on conflict do nothing;
  else
    update public.friend_requests set status = 'declined' where id = p_request_id;
  end if;
end;
$$;

revoke all on function public.respond_to_friend_request(uuid, boolean) from public;
grant execute on function public.respond_to_friend_request(uuid, boolean) to authenticated;

drop policy if exists friend_requests_participants_update on public.friend_requests;

create policy friend_requests_requester_cancel
on public.friend_requests
for update
to authenticated
using (requester_id = auth.uid() and status = 'pending')
with check (requester_id = auth.uid() and status = 'cancelled');

create policy friend_requests_staff_update
on public.friend_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.notify_friend_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_name text;
begin
  select full_name into v_name from public.profiles where id = new.requester_id;
  insert into public.notifications(user_id, type, title, body, entity_type, entity_id)
  values(new.addressee_id, 'friend_request', coalesce(v_name, 'A citizen') || ' sent you a friend request', 'Review the request in Community.', 'friend_request', new.id);
  return new;
end;
$$;

revoke all on function public.notify_friend_request() from public;

drop trigger if exists friend_request_notification on public.friend_requests;
create trigger friend_request_notification after insert on public.friend_requests
for each row execute function public.notify_friend_request();

do $$
begin
  begin alter publication supabase_realtime add table public.friend_requests; exception when duplicate_object then null; end;
end $$;
