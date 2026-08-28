import { supabase } from '@/lib/supabase';
import type { Candidate, CivicEvent, CivicIssue, CivicPage, CivicProject, CivicResource, Conversation, FriendRequest, Group, Job, LostFoundReport, MarketplaceListing, Message, NewsArticle, Notification, Poll, Post, Profile, ServiceRequest } from '@/types/domain';

async function uid() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('You must be signed in.');
  return data.user.id;
}

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase.from('posts').select('id,author_id,body,kind,visibility,media_path,media_type,created_at,profile:profiles!posts_author_id_fkey(id,full_name,username,avatar_url,is_verified),post_reactions(user_id,reaction),comments(id,body,created_at,profile:profiles!comments_author_id_fkey(id,full_name,avatar_url))').order('created_at', { ascending: false }).limit(40);
  if (error) throw error; return (data || []) as unknown as Post[];
}

export async function getReels(): Promise<Post[]> {
  const { data, error } = await supabase.from('posts').select('id,author_id,body,kind,visibility,media_path,media_type,created_at,profile:profiles!posts_author_id_fkey(id,full_name,username,avatar_url,is_verified),post_reactions(user_id,reaction),comments(id)').eq('media_type','video').eq('visibility','public').order('created_at',{ascending:false}).limit(30);
  if(error)throw error;return(data||[])as unknown as Post[];
}

export async function createPost(body: string, kind = 'civic', media?: { path: string; type: 'image'|'video' } | null) {
  const author_id = await uid(); const { error } = await supabase.from('posts').insert({ author_id, body: body.trim(), kind, visibility: 'public', media_path: media?.path || null, media_type: media?.type || null }); if (error) throw error;
}

export async function togglePostLike(postId: string) {
  const user_id = await uid();
  const existing = await supabase.from('post_reactions').select('post_id').eq('post_id', postId).eq('user_id', user_id).eq('reaction', 'like').maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) { const { error } = await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', user_id).eq('reaction', 'like'); if (error) throw error; }
  else { const { error } = await supabase.from('post_reactions').insert({ post_id: postId, user_id, reaction: 'like' }); if (error) throw error; }
}

export async function addComment(postId: string, body: string) { const author_id=await uid(); const {error}=await supabase.from('comments').insert({post_id:postId,author_id,body:body.trim()}); if(error)throw error; }
export async function saveEntity(entityType: string, entityId: string) { const user_id=await uid(); const {error}=await supabase.from('saved_items').upsert({user_id,entity_type:entityType,entity_id:entityId},{onConflict:'user_id,entity_type,entity_id'}); if(error)throw error; }

export async function getMarketplaceListings(): Promise<MarketplaceListing[]> { const {data,error}=await supabase.from('marketplace_listings').select('*').eq('status','active').order('created_at',{ascending:false}).limit(50); if(error)throw error; return (data||[]) as MarketplaceListing[]; }
export async function createListing(input:{title:string;description:string;price:number;category:string;location?:string;image_url?:string|null}) { const seller_id=await uid(); const {error}=await supabase.from('marketplace_listings').insert({...input,seller_id,status:'active'}); if(error)throw error; }

export async function getCivicProjects(): Promise<CivicProject[]> { const {data,error}=await supabase.from('civic_projects').select('*').order('created_at',{ascending:false}); if(error)throw error; return (data||[]) as CivicProject[]; }
export async function getCivicIssues(): Promise<CivicIssue[]> { const {data,error}=await supabase.from('civic_issues').select('*').order('created_at',{ascending:false}).limit(30); if(error)throw error; return (data||[]) as CivicIssue[]; }
export async function createCivicIssue(input:{title:string;description:string;category:string;location_text?:string}) { const reporter_id=await uid(); const {error}=await supabase.from('civic_issues').insert({...input,reporter_id,status:'submitted'}); if(error)throw error; }

export async function getGroups(): Promise<Group[]> { const {data,error}=await supabase.from('groups').select('id,owner_id,name,description,visibility,cover_url').order('created_at',{ascending:false}); if(error)throw error; return (data||[]) as Group[]; }
export async function joinGroup(groupId:string) { const user_id=await uid(); const {error}=await supabase.from('group_members').upsert({group_id:groupId,user_id,role:'member',status:'active'},{onConflict:'group_id,user_id'}); if(error)throw error; }
export async function getPages():Promise<CivicPage[]>{const{data,error}=await supabase.from('pages').select('id,owner_id,name,category,description,verified,logo_url,cover_url,created_at').order('created_at',{ascending:false}).limit(50);if(error)throw error;return(data||[])as CivicPage[];}
export async function followPage(pageId:string){const user_id=await uid();const{error}=await supabase.from('page_followers').upsert({page_id:pageId,user_id},{onConflict:'page_id,user_id'});if(error)throw error;}
export async function getPeople(): Promise<Profile[]> { const {data,error}=await supabase.from('profiles').select('id,full_name,username,avatar_url,bio,city,barangay,is_verified,civic_score').limit(40); if(error)throw error; return (data||[]) as Profile[]; }
export async function getIncomingFriendRequests():Promise<FriendRequest[]>{const user_id=await uid();const{data,error}=await supabase.from('friend_requests').select('id,requester_id,addressee_id,status,created_at,requester:profiles!friend_requests_requester_id_fkey(id,full_name,username,avatar_url,bio,city,barangay,is_verified,civic_score)').eq('addressee_id',user_id).eq('status','pending').order('created_at',{ascending:false});if(error)throw error;return(data||[])as unknown as FriendRequest[];}
export async function sendFriendRequest(addressee_id:string){const requester_id=await uid();const{error}=await supabase.from('friend_requests').insert({requester_id,addressee_id,status:'pending'});if(error?.code==='23505')throw new Error('A request already exists for this person.');if(error)throw error;}
export async function respondToFriendRequest(requestId:string,accept:boolean){const{error}=await supabase.rpc('respond_to_friend_request',{p_request_id:requestId,p_accept:accept});if(error)throw error;}

export async function getNotifications():Promise<Notification[]>{const user_id=await uid();const{data,error}=await supabase.from('notifications').select('*').eq('user_id',user_id).order('created_at',{ascending:false}).limit(80);if(error)throw error;return(data||[])as Notification[];}
export async function getUnreadNotificationCount():Promise<number>{const user_id=await uid();const{count,error}=await supabase.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',user_id).is('read_at',null);if(error)throw error;return count||0;}
export async function markNotificationRead(id:string){const user_id=await uid();const{error}=await supabase.from('notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('user_id',user_id);if(error)throw error;}
export async function markAllNotificationsRead(){const user_id=await uid();const{error}=await supabase.from('notifications').update({read_at:new Date().toISOString()}).eq('user_id',user_id).is('read_at',null);if(error)throw error;}

export async function createConversationWithUser(otherUserId:string){ const created_by=await uid(); const {data,error}=await supabase.rpc('create_direct_conversation',{p_other_user:otherUserId}); if(error)throw error; return data as string; }

export async function getConversations(): Promise<Conversation[]> { const user_id=await uid(); const {data,error}=await supabase.from('conversations').select('id,title,kind,updated_at,conversation_members!inner(user_id),members:conversation_members(user_id,profile:profiles(id,full_name,username,avatar_url,is_verified))').eq('conversation_members.user_id',user_id).order('updated_at',{ascending:false}); if(error)throw error; return (data||[]) as unknown as Conversation[]; }
export async function getMessages(conversationId:string): Promise<Message[]> { const {data,error}=await supabase.from('messages').select('id,conversation_id,sender_id,body,created_at,profile:profiles!messages_sender_id_fkey(id,full_name,avatar_url)').eq('conversation_id',conversationId).order('created_at',{ascending:true}).limit(100); if(error)throw error; return (data||[]) as unknown as Message[]; }
export async function sendMessage(conversationId:string,body:string){ const sender_id=await uid(); const {error}=await supabase.from('messages').insert({conversation_id:conversationId,sender_id,body:body.trim()}); if(error)throw error; await supabase.from('conversations').update({updated_at:new Date().toISOString()}).eq('id',conversationId); }

export async function getCandidates(): Promise<Candidate[]> { const {data,error}=await supabase.from('candidates').select('*').order('position'); if(error)throw error; return (data||[]) as Candidate[]; }
export async function castMockVote(candidateId:string,electionId:string){ const user_id=await uid(); const {error}=await supabase.from('mock_votes').upsert({user_id,candidate_id:candidateId,election_id:electionId},{onConflict:'user_id,election_id'}); if(error)throw error; }

export async function getPolls(): Promise<Poll[]> { const {data,error}=await supabase.rpc('get_active_polls_with_counts'); if(error)throw error; return (Array.isArray(data)?data:[]) as Poll[]; }
export async function votePoll(pollId:string,optionId:string){ const user_id=await uid(); const {error}=await supabase.from('poll_votes').upsert({poll_id:pollId,option_id:optionId,user_id},{onConflict:'poll_id,user_id'}); if(error)throw error; }

export async function getEvents(): Promise<CivicEvent[]> { const {data,error}=await supabase.from('events').select('*').gte('starts_at',new Date(Date.now()-86400000).toISOString()).order('starts_at').limit(50); if(error)throw error; return (data||[]) as CivicEvent[]; }
export async function toggleEventRsvp(eventId:string){ const user_id=await uid(); const existing=await supabase.from('event_rsvps').select('event_id').eq('event_id',eventId).eq('user_id',user_id).maybeSingle(); if(existing.error)throw existing.error; if(existing.data){const {error}=await supabase.from('event_rsvps').delete().eq('event_id',eventId).eq('user_id',user_id);if(error)throw error;}else{const{error}=await supabase.from('event_rsvps').insert({event_id:eventId,user_id,status:'going'});if(error)throw error;} }

export async function getNews(): Promise<NewsArticle[]> { const {data,error}=await supabase.from('news_articles').select('*').order('published_at',{ascending:false}).limit(50); if(error)throw error; return (data||[]) as NewsArticle[]; }
export async function getJobs(): Promise<Job[]> { const {data,error}=await supabase.from('jobs').select('*').eq('status','open').order('posted_at',{ascending:false}); if(error)throw error; return (data||[]) as Job[]; }
export async function applyToJob(jobId:string,note:string){ const applicant_id=await uid(); const {error}=await supabase.from('job_applications').upsert({job_id:jobId,applicant_id,note,status:'submitted'},{onConflict:'job_id,applicant_id'}); if(error)throw error; }

export async function getLostFound(): Promise<LostFoundReport[]> { const {data,error}=await supabase.from('lost_found_reports').select('*').neq('status','closed').order('created_at',{ascending:false}); if(error)throw error; return (data||[]) as LostFoundReport[]; }
export async function createLostFound(input:{kind:string;title:string;description:string;location_text?:string}) { const user_id=await uid(); const {error}=await supabase.from('lost_found_reports').insert({...input,user_id,status:'open'}); if(error)throw error; }

export async function getCivicResources(module:string): Promise<CivicResource[]> { const {data,error}=await supabase.from('civic_resources').select('*').eq('module',module).order('sort_order'); if(error)throw error; return (data||[]) as CivicResource[]; }
export async function createEnvironmentReport(input:{title:string;description:string;location_text?:string}){const reporter_id=await uid();const{error}=await supabase.from('environmental_reports').insert({...input,reporter_id,status:'submitted'});if(error)throw error;}
export async function createServiceRequest(input:{module:string;request_type?:string;title:string;details?:string}){const user_id=await uid();const{error}=await supabase.from('service_requests').insert({user_id,module:input.module,request_type:input.request_type||'general',title:input.title.trim(),details:input.details?.trim()||null,status:'submitted'});if(error)throw error;}
export async function getMyServiceRequests(module?:string):Promise<ServiceRequest[]>{const user_id=await uid();let query=supabase.from('service_requests').select('*').eq('user_id',user_id).order('created_at',{ascending:false});if(module)query=query.eq('module',module);const{data,error}=await query.limit(50);if(error)throw error;return(data||[])as ServiceRequest[];}
export async function cancelServiceRequest(id:string){const user_id=await uid();const{error}=await supabase.from('service_requests').update({status:'cancelled'}).eq('id',id).eq('user_id',user_id).in('status',['draft','submitted']);if(error)throw error;}

export async function getSavedItems(){const user_id=await uid();const{data,error}=await supabase.from('saved_items').select('*').eq('user_id',user_id).order('created_at',{ascending:false});if(error)throw error;return data||[];}
export async function removeSavedItem(id:string){const user_id=await uid();const{error}=await supabase.from('saved_items').delete().eq('id',id).eq('user_id',user_id);if(error)throw error;}

export async function getMyProfile(): Promise<Profile|null>{const user_id=await uid();const{data,error}=await supabase.from('profiles').select('*').eq('id',user_id).single();if(error)throw error;return data as Profile;}
export async function updateMyProfile(input:Partial<Profile>){const id=await uid();const{error}=await supabase.from('profiles').update(input).eq('id',id);if(error)throw error;}
