-- Call now's 60-second limit as one step. The advisory lock makes two presses at the same moment
-- take turns, so the second sees the Call the first started and only one of them can ring her phone.
-- Returns {"id": <the new live Call>}, or {"last_started_at": <when the last Call started>} when refused.
create function public.start_call() returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  last_started timestamptz;
  new_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('start_call'));
  select max(started_at) into last_started from public.calls;
  if last_started > now() - interval '60 seconds' then
    return jsonb_build_object('last_started_at', last_started);
  end if;
  insert into public.calls default values returning id into new_id;
  return jsonb_build_object('id', new_id);
end;
$$;

-- Only the server, with the service role key, may start a Call.
revoke execute on function public.start_call() from public, anon, authenticated;
grant execute on function public.start_call() to service_role;
