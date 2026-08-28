import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VideoView, useVideoPlayer } from 'expo-video';
import { getReels, saveEntity, togglePostLike } from '@/services/api';
import { signedUrl } from '@/services/storage';
import { Empty, Loading, Muted, Title } from '@/components/UI';
import { Avatar, CircleButton } from '@/components/SocialUI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/features/auth/AuthProvider';
import type { Post } from '@/types/domain';

export default function ReelsScreen() {
  const { theme } = useTheme();
  const { isPhone, height } = useBreakpoint();
  const reels = useQuery({ queryKey: ['reels'], queryFn: getReels });
  return <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#000' }}>
    <View style={{ flex: 1 }}>
      {isPhone ? <View style={{ position: 'absolute', top: 12, left: 14, right: 14, zIndex: 10, flexDirection: 'row', alignItems: 'center' }}><Text style={{ color: '#fff', fontSize: 25, fontWeight: '900', flex: 1 }}>Civic Reels</Text><CircleButton icon="⌕" label="Search reels" /><CircleButton icon="▣" label="Create reel" /></View> : null}
      {reels.isLoading ? <Loading label="Loading civic reels…" /> : reels.error ? <View style={{ padding: 20 }}><Empty title="Reels unavailable" description={(reels.error as Error).message} /></View> : reels.data?.length ? <ScrollView pagingEnabled showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>{reels.data.map((reel) => <Reel key={reel.id} reel={reel} height={Math.max(540, height - (isPhone ? 104 : 58))} phone={isPhone} />)}</ScrollView> : <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}><Empty title="No civic reels yet" description="Videos posted by real Kayumanggi users will appear here. Add a video from the home composer." /></View>}
    </View>
  </View>;
}

function Reel({ reel, height, phone }: { reel: Post; height: number; phone: boolean }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const source = useQuery({ queryKey: ['reel-url', reel.media_path], queryFn: () => signedUrl('post-media', reel.media_path!, 3600), enabled: Boolean(reel.media_path) });
  const reactions = reel.post_reactions || [];
  const liked = reactions.some((item) => item.user_id === user?.id && item.reaction === 'like');
  const like = useMutation({ mutationFn: () => togglePostLike(reel.id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reels'] }) });
  const profile = Array.isArray(reel.profile) ? reel.profile[0] : reel.profile;
  return <View style={{ width: phone ? '100%' : 510, height, backgroundColor: '#090909', justifyContent: 'center', overflow: 'hidden', borderRadius: phone ? 0 : 14, marginVertical: phone ? 0 : 10 }}>
    {source.data ? <ReelVideo uri={source.data} /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Loading label="Preparing video…" /></View>}
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 220, backgroundColor: 'rgba(0,0,0,.32)' }} />
    <View style={{ position: 'absolute', left: 18, right: 78, bottom: 24, gap: 9 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Avatar name={profile?.full_name} uri={profile?.avatar_url} size={38} /><Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>{profile?.full_name || 'Kayumanggi citizen'} {profile?.is_verified ? '●' : ''}</Text></View><Text numberOfLines={4} style={{ color: '#fff', fontSize: 13, lineHeight: 18 }}>{reel.body}</Text></View>
    <View style={{ position: 'absolute', right: 12, bottom: 24, gap: 18, alignItems: 'center' }}><ReelAction icon={liked ? '●' : '♡'} label={`${reactions.length}`} active={liked} onPress={() => like.mutate()} /><ReelAction icon="○" label={`${reel.comments?.length || 0}`} /><ReelAction icon="↗" label="Share" onPress={() => Share.share({ message: reel.body })} /><ReelAction icon="☆" label="Save" onPress={() => saveEntity('post', reel.id)} /></View>
  </View>;
}

function ReelVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (instance) => { instance.loop = true; instance.play(); });
  return <VideoView player={player} nativeControls={false} contentFit="cover" style={{ position: 'absolute', inset: 0 }} />;
}

function ReelAction({ icon, label, active = false, onPress }: { icon: string; label: string; active?: boolean; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={{ alignItems: 'center', gap: 3 }}><Text style={{ color: active ? '#2D88FF' : '#fff', fontSize: 28, fontWeight: '900' }}>{icon}</Text><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{label}</Text></Pressable>;
}
