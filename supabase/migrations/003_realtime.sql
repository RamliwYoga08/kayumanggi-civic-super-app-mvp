-- Realtime publication for high-value collaborative/live surfaces.
do $$
begin
  begin alter publication supabase_realtime add table public.posts; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.comments; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.civic_issues; exception when duplicate_object then null; end;
end $$;
