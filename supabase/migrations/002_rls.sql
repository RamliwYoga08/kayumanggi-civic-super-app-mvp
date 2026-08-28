-- Row Level Security and trusted helper functions

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin','moderator','lgu_staff')
  );
$$;

create or replace function public.is_group_member(p_group uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.group_members gm where gm.group_id=p_group and gm.user_id=auth.uid() and gm.status='active'); $$;

create or replace function public.is_conversation_member(p_conversation uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.conversation_members cm where cm.conversation_id=p_conversation and cm.user_id=auth.uid()); $$;

create or replace function public.create_direct_conversation(p_other_user uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_me uuid := auth.uid(); v_existing uuid; v_id uuid;
begin
  if v_me is null then raise exception 'Authentication required'; end if;
  if p_other_user is null or p_other_user = v_me then raise exception 'Choose another user'; end if;
  if not exists(select 1 from public.profiles where id=p_other_user) then raise exception 'User not found'; end if;
  select c.id into v_existing
  from public.conversations c
  join public.conversation_members a on a.conversation_id=c.id and a.user_id=v_me
  join public.conversation_members b on b.conversation_id=c.id and b.user_id=p_other_user
  where c.kind='direct'
    and (select count(*) from public.conversation_members x where x.conversation_id=c.id)=2
  limit 1;
  if v_existing is not null then return v_existing; end if;
  insert into public.conversations(created_by,kind) values(v_me,'direct') returning id into v_id;
  insert into public.conversation_members(conversation_id,user_id,role) values(v_id,v_me,'admin'),(v_id,p_other_user,'member');
  return v_id;
end;
$$;

grant execute on function public.create_direct_conversation(uuid) to authenticated;


-- Aggregate poll results without exposing voter identities.
create or replace function public.get_active_polls_with_counts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'question', p.question,
        'description', p.description,
        'status', p.status,
        'closes_at', p.closes_at,
        'poll_options', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', o.id,
              'label', o.label,
              'sort_order', o.sort_order,
              'vote_count', (select count(*) from public.poll_votes v where v.option_id=o.id)
            ) order by o.sort_order
          )
          from public.poll_options o
          where o.poll_id=p.id
        ), '[]'::jsonb)
      ) order by p.created_at desc
    ), '[]'::jsonb
  )
  from public.polls p
  where p.status='active'
    and (p.closes_at is null or p.closes_at > now());
$$;

grant execute on function public.get_active_polls_with_counts() to authenticated;

-- Enable RLS on every application table
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.posts enable row level security;
alter table public.post_reactions enable row level security;
alter table public.comments enable row level security;
alter table public.saved_items enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.pages enable row level security;
alter table public.page_followers enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.marketplace_orders enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.civic_projects enable row level security;
alter table public.civic_issues enable row level security;
alter table public.officials enable row level security;
alter table public.official_deeds enable row level security;
alter table public.official_votes enable row level security;
alter table public.partylists enable row level security;
alter table public.departments enable row level security;
alter table public.elections enable row level security;
alter table public.candidates enable row level security;
alter table public.mock_votes enable row level security;
alter table public.debate_threads enable row level security;
alter table public.debate_votes enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.charity_campaigns enable row level security;
alter table public.donation_pledges enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.news_articles enable row level security;
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.resumes enable row level security;
alter table public.lost_found_reports enable row level security;
alter table public.environmental_reports enable row level security;
alter table public.civic_resources enable row level security;
alter table public.service_requests enable row level security;

-- profiles
create policy profiles_read_authenticated on public.profiles for select to authenticated using (true);
create policy profiles_update_self on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());

-- roles
create policy roles_read_self_admin on public.user_roles for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy roles_admin_write on public.user_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- social feed
create policy posts_read on public.posts for select to authenticated using (
  visibility='public' or author_id=auth.uid() or (group_id is not null and public.is_group_member(group_id))
);
create policy posts_insert_self on public.posts for insert to authenticated with check (author_id=auth.uid());
create policy posts_update_self on public.posts for update to authenticated using (author_id=auth.uid() or public.is_admin()) with check (author_id=auth.uid() or public.is_admin());
create policy posts_delete_self on public.posts for delete to authenticated using (author_id=auth.uid() or public.is_admin());

create policy reactions_read on public.post_reactions for select to authenticated using (true);
create policy reactions_self_insert on public.post_reactions for insert to authenticated with check (user_id=auth.uid());
create policy reactions_self_delete on public.post_reactions for delete to authenticated using (user_id=auth.uid());

create policy comments_read on public.comments for select to authenticated using (true);
create policy comments_self_insert on public.comments for insert to authenticated with check (author_id=auth.uid());
create policy comments_self_update on public.comments for update to authenticated using (author_id=auth.uid() or public.is_admin()) with check (author_id=auth.uid() or public.is_admin());
create policy comments_self_delete on public.comments for delete to authenticated using (author_id=auth.uid() or public.is_admin());

create policy saved_self_all on public.saved_items for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- friends
create policy friend_requests_participants_read on public.friend_requests for select to authenticated using (requester_id=auth.uid() or addressee_id=auth.uid());
create policy friend_requests_requester_insert on public.friend_requests for insert to authenticated with check (requester_id=auth.uid());
create policy friend_requests_participants_update on public.friend_requests for update to authenticated using (requester_id=auth.uid() or addressee_id=auth.uid()) with check (requester_id=auth.uid() or addressee_id=auth.uid());
create policy friendships_participants_read on public.friendships for select to authenticated using (user_a=auth.uid() or user_b=auth.uid());
create policy friendships_admin_write on public.friendships for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- groups/pages
create policy groups_public_or_member_read on public.groups for select to authenticated using (visibility='public' or owner_id=auth.uid() or public.is_group_member(id));
create policy groups_owner_insert on public.groups for insert to authenticated with check (owner_id=auth.uid());
create policy groups_owner_update on public.groups for update to authenticated using (owner_id=auth.uid() or public.is_admin()) with check (owner_id=auth.uid() or public.is_admin());
create policy groups_owner_delete on public.groups for delete to authenticated using (owner_id=auth.uid() or public.is_admin());
create policy group_members_visible on public.group_members for select to authenticated using (user_id=auth.uid() or public.is_group_member(group_id) or exists(select 1 from public.groups g where g.id=group_id and g.visibility='public'));
create policy group_members_join_self on public.group_members for insert to authenticated with check (user_id=auth.uid());
create policy group_members_manage_self_admin on public.group_members for update to authenticated using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());
create policy group_members_leave_self on public.group_members for delete to authenticated using (user_id=auth.uid() or public.is_admin());

create policy pages_read on public.pages for select to authenticated using (true);
create policy pages_owner_write on public.pages for all to authenticated using (owner_id=auth.uid() or public.is_admin()) with check (owner_id=auth.uid() or public.is_admin());
create policy page_followers_read on public.page_followers for select to authenticated using (true);
create policy page_followers_self_all on public.page_followers for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- conversations and messages
create policy conversations_member_read on public.conversations for select to authenticated using (public.is_conversation_member(id));
create policy conversations_creator_insert on public.conversations for insert to authenticated with check (created_by=auth.uid());
create policy conversations_member_update on public.conversations for update to authenticated using (public.is_conversation_member(id)) with check (public.is_conversation_member(id));
create policy conversation_members_member_read on public.conversation_members for select to authenticated using (public.is_conversation_member(conversation_id));
create policy conversation_members_creator_insert on public.conversation_members for insert to authenticated with check (exists(select 1 from public.conversations c where c.id=conversation_id and c.created_by=auth.uid()));
create policy conversation_members_self_delete on public.conversation_members for delete to authenticated using (user_id=auth.uid());
create policy messages_member_read on public.messages for select to authenticated using (public.is_conversation_member(conversation_id));
create policy messages_member_insert on public.messages for insert to authenticated with check (sender_id=auth.uid() and public.is_conversation_member(conversation_id));
create policy messages_sender_delete on public.messages for delete to authenticated using (sender_id=auth.uid() or public.is_admin());
create policy notifications_self_all on public.notifications for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- marketplace and demo civic credits
create policy listings_read_active on public.marketplace_listings for select to authenticated using (status='active' or seller_id=auth.uid() or public.is_admin());
create policy listings_seller_insert on public.marketplace_listings for insert to authenticated with check (seller_id=auth.uid());
create policy listings_seller_update on public.marketplace_listings for update to authenticated using (seller_id=auth.uid() or public.is_admin()) with check (seller_id=auth.uid() or public.is_admin());
create policy listings_seller_delete on public.marketplace_listings for delete to authenticated using (seller_id=auth.uid() or public.is_admin());
create policy orders_participants_read on public.marketplace_orders for select to authenticated using (buyer_id=auth.uid() or seller_id=auth.uid() or public.is_admin());
create policy orders_buyer_insert on public.marketplace_orders for insert to authenticated with check (buyer_id=auth.uid());
create policy orders_participants_update on public.marketplace_orders for update to authenticated using (buyer_id=auth.uid() or seller_id=auth.uid() or public.is_admin()) with check (buyer_id=auth.uid() or seller_id=auth.uid() or public.is_admin());
create policy wallets_self_read on public.wallets for select to authenticated using (user_id=auth.uid());
create policy wallets_admin_write on public.wallets for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy wallet_tx_self_read on public.wallet_transactions for select to authenticated using (user_id=auth.uid());
create policy wallet_tx_admin_insert on public.wallet_transactions for insert to authenticated with check (public.is_admin());

-- governance directory and public content
create policy projects_read on public.civic_projects for select to authenticated using (true);
create policy projects_admin_write on public.civic_projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy issues_read on public.civic_issues for select to authenticated using (reporter_id=auth.uid() or public.is_admin() or status in ('assigned','resolved'));
create policy issues_reporter_insert on public.civic_issues for insert to authenticated with check (reporter_id=auth.uid());
create policy issues_reporter_update_draftish on public.civic_issues for update to authenticated using (reporter_id=auth.uid() or public.is_admin()) with check (reporter_id=auth.uid() or public.is_admin());

create policy officials_read on public.officials for select to authenticated using (true);
create policy officials_admin_write on public.officials for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy official_deeds_read on public.official_deeds for select to authenticated using (true);
create policy official_deeds_admin_write on public.official_deeds for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy official_votes_read on public.official_votes for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy official_votes_self_all on public.official_votes for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy partylists_read on public.partylists for select to authenticated using (true);
create policy partylists_admin_write on public.partylists for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy departments_read on public.departments for select to authenticated using (true);
create policy departments_admin_write on public.departments for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- election sandbox
create policy elections_read on public.elections for select to authenticated using (true);
create policy elections_admin_write on public.elections for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy candidates_read on public.candidates for select to authenticated using (true);
create policy candidates_admin_write on public.candidates for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy mock_votes_read on public.mock_votes for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy mock_votes_self_all on public.mock_votes for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- debates and polls
create policy debate_threads_read on public.debate_threads for select to authenticated using (true);
create policy debate_threads_self_insert on public.debate_threads for insert to authenticated with check (author_id=auth.uid());
create policy debate_threads_self_update on public.debate_threads for update to authenticated using (author_id=auth.uid() or public.is_admin()) with check (author_id=auth.uid() or public.is_admin());
create policy debate_votes_read on public.debate_votes for select to authenticated using (true);
create policy debate_votes_self_all on public.debate_votes for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy polls_read on public.polls for select to authenticated using (status='active' or created_by=auth.uid() or public.is_admin());
create policy polls_admin_create on public.polls for insert to authenticated with check (public.is_admin() or created_by=auth.uid());
create policy polls_owner_update on public.polls for update to authenticated using (created_by=auth.uid() or public.is_admin()) with check (created_by=auth.uid() or public.is_admin());
create policy poll_options_read on public.poll_options for select to authenticated using (true);
create policy poll_options_admin_write on public.poll_options for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy poll_votes_read on public.poll_votes for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy poll_votes_self_all on public.poll_votes for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- charity/events/news/jobs
create policy charity_read on public.charity_campaigns for select to authenticated using (status='active' or public.is_admin());
create policy charity_admin_write on public.charity_campaigns for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy pledges_self_read on public.donation_pledges for select to authenticated using (donor_id=auth.uid() or public.is_admin());
create policy pledges_self_insert on public.donation_pledges for insert to authenticated with check (donor_id=auth.uid());
create policy pledges_self_update on public.donation_pledges for update to authenticated using (donor_id=auth.uid() or public.is_admin()) with check (donor_id=auth.uid() or public.is_admin());
create policy events_read on public.events for select to authenticated using (visibility='public' or created_by=auth.uid() or public.is_admin());
create policy events_owner_admin_write on public.events for all to authenticated using (created_by=auth.uid() or public.is_admin()) with check (created_by=auth.uid() or public.is_admin());
create policy rsvps_read on public.event_rsvps for select to authenticated using (true);
create policy rsvps_self_all on public.event_rsvps for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy news_read on public.news_articles for select to authenticated using (true);
create policy news_admin_write on public.news_articles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy jobs_read on public.jobs for select to authenticated using (status='open' or posted_by=auth.uid() or public.is_admin());
create policy jobs_owner_admin_write on public.jobs for all to authenticated using (posted_by=auth.uid() or public.is_admin()) with check (posted_by=auth.uid() or public.is_admin());
create policy job_apps_private_read on public.job_applications for select to authenticated using (applicant_id=auth.uid() or public.is_admin() or exists(select 1 from public.jobs j where j.id=job_id and j.posted_by=auth.uid()));
create policy job_apps_self_insert on public.job_applications for insert to authenticated with check (applicant_id=auth.uid());
create policy job_apps_participant_update on public.job_applications for update to authenticated using (applicant_id=auth.uid() or public.is_admin() or exists(select 1 from public.jobs j where j.id=job_id and j.posted_by=auth.uid())) with check (applicant_id=auth.uid() or public.is_admin() or exists(select 1 from public.jobs j where j.id=job_id and j.posted_by=auth.uid()));
create policy resumes_self_all on public.resumes for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- reports and shared service catalog
create policy lost_found_read on public.lost_found_reports for select to authenticated using (true);
create policy lost_found_self_insert on public.lost_found_reports for insert to authenticated with check (user_id=auth.uid());
create policy lost_found_self_update on public.lost_found_reports for update to authenticated using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());
create policy environment_reports_read on public.environmental_reports for select to authenticated using (reporter_id=auth.uid() or public.is_admin() or status in ('actioned','resolved'));
create policy environment_reports_self_insert on public.environmental_reports for insert to authenticated with check (reporter_id=auth.uid());
create policy environment_reports_update on public.environmental_reports for update to authenticated using (reporter_id=auth.uid() or public.is_admin()) with check (reporter_id=auth.uid() or public.is_admin());
create policy resources_read on public.civic_resources for select to authenticated using (true);
create policy resources_admin_write on public.civic_resources for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy service_requests_self_read on public.service_requests for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy service_requests_self_insert on public.service_requests for insert to authenticated with check (user_id=auth.uid());
create policy service_requests_update on public.service_requests for update to authenticated using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());

-- Explicit privileges; RLS remains the authorization boundary.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Storage object policies. Buckets are created by scripts/setup-storage.mjs.
create policy "avatars own upload" on storage.objects for insert to authenticated with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatars authenticated read" on storage.objects for select to authenticated using (bucket_id='avatars');
create policy "avatars own update" on storage.objects for update to authenticated using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatars own delete" on storage.objects for delete to authenticated using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "post media own upload" on storage.objects for insert to authenticated with check (bucket_id='post-media' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "post media authenticated read" on storage.objects for select to authenticated using (bucket_id='post-media');
create policy "post media own change" on storage.objects for update to authenticated using (bucket_id='post-media' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='post-media' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "post media own delete" on storage.objects for delete to authenticated using (bucket_id='post-media' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "marketplace media own upload" on storage.objects for insert to authenticated with check (bucket_id='marketplace-media' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "marketplace media authenticated read" on storage.objects for select to authenticated using (bucket_id='marketplace-media');
create policy "marketplace media own delete" on storage.objects for delete to authenticated using (bucket_id='marketplace-media' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "message attachments member upload" on storage.objects for insert to authenticated with check (bucket_id='message-attachments' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "message attachments own read" on storage.objects for select to authenticated using (bucket_id='message-attachments' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "message attachments own delete" on storage.objects for delete to authenticated using (bucket_id='message-attachments' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "civic evidence own upload" on storage.objects for insert to authenticated with check (bucket_id='civic-evidence' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "civic evidence own admin read" on storage.objects for select to authenticated using (bucket_id='civic-evidence' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
create policy "civic evidence own admin delete" on storage.objects for delete to authenticated using (bucket_id='civic-evidence' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
