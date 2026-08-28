import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createListing, getMarketplaceListings, saveEntity } from '@/services/api';
import { pickAndUpload, removeStoredFile, signedUrl } from '@/services/storage';
import { Button, Card, Empty, Field, Loading, Muted, Title } from '@/components/UI';
import { ActionPill, CircleButton, PageTitleBar, SearchBox } from '@/components/SocialUI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatMoney } from '@/utils/format';
import type { MarketplaceListing } from '@/types/domain';

export default function MarketplaceScreen() {
  const { theme } = useTheme();
  const { isPhone, isTablet, isDesktop } = useBreakpoint();
  const queryClient = useQueryClient();
  const listings = useQuery({ queryKey: ['marketplace'], queryFn: getMarketplaceListings });
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('General');
  const [location, setLocation] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const categories = useMemo(() => ['All', ...new Set((listings.data || []).map((item) => item.category).filter(Boolean))], [listings.data]);
  const visible = useMemo(() => (listings.data || []).filter((item) => (filter === 'All' || item.category === filter) && (!search.trim() || `${item.title} ${item.category} ${item.location || ''}`.toLowerCase().includes(search.trim().toLowerCase()))), [filter, listings.data, search]);
  const create = useMutation({ mutationFn: () => createListing({ title, description, price: Number(price), category, location, image_url: imagePath }), onSuccess: () => { setTitle(''); setDescription(''); setPrice(''); setLocation(''); setImagePath(null); setShowCreate(false); queryClient.invalidateQueries({ queryKey: ['marketplace'] }); } });
  const attach = async () => { const upload = await pickAndUpload('marketplace-media', ['image/*']); if (upload) setImagePath(upload.path); };
  const discardImage = async () => { if (imagePath) await removeStoredFile('marketplace-media', imagePath); setImagePath(null); };
  const col = isPhone ? '49.2%' : isTablet ? '32.3%' : '24.1%';

  const controls = <><SearchBox value={search} onChangeText={setSearch} placeholder="Search Marketplace" /><ScrollView horizontal style={{ flexGrow: 0 }} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingVertical: 10 }}>{categories.map((item) => <ActionPill key={item} label={item} primary={filter === item} onPress={() => setFilter(item)} />)}</ScrollView></>;
  return <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.background }}>
    <View style={{ flex: 1 }}>
      <PageTitleBar title="Marketplace" subtitle={isDesktop ? 'Local commerce from verified Kayumanggi accounts' : undefined} right={<View style={{ flexDirection: 'row', gap: 7 }}><CircleButton icon="⚙" label="Marketplace settings" /><CircleButton icon="＋" label="Sell" onPress={() => setShowCreate(true)} /></View>} /><View style={{ paddingHorizontal: 12, paddingTop: 10 }}>{controls}</View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isPhone ? 4 : 16, paddingBottom: 90, gap: 15 }}>
        {showCreate ? <Card style={{ width: '100%', maxWidth: 780, alignSelf: 'center', gap: 10 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><View><Title size={18}>Create listing</Title><Muted>Publish from your authenticated seller account</Muted></View><Pressable onPress={() => setShowCreate(false)}><Text style={{ color: theme.mutedFg, fontSize: 18 }}>×</Text></Pressable></View><View style={{ flexDirection: isPhone ? 'column' : 'row', gap: 9 }}><Field placeholder="Item or service" value={title} onChangeText={setTitle} style={{ flex: 2 }} /><Field placeholder="Price ₱" keyboardType="decimal-pad" value={price} onChangeText={setPrice} style={{ flex: 1 }} /><Field placeholder="Category" value={category} onChangeText={setCategory} style={{ flex: 1 }} /></View><Field placeholder="Pickup location" value={location} onChangeText={setLocation} /><Field multiline placeholder="Description, condition, and pickup terms…" value={description} onChangeText={setDescription} style={{ minHeight: 80, textAlignVertical: 'top' }} /><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>{imagePath ? <Pressable onPress={discardImage}><Text style={{ color: theme.danger, fontSize: 11, fontWeight: '900' }}>Remove uploaded photo</Text></Pressable> : <Button variant="secondary" onPress={attach}>Add photo</Button>}<Button disabled={!title.trim() || !price || Number(price) < 0 || create.isPending} onPress={() => create.mutate()}>{create.isPending ? 'Publishing…' : 'Publish listing'}</Button></View>{create.error ? <Text style={{ color: theme.danger, fontSize: 11 }}>{(create.error as Error).message}</Text> : null}</Card> : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: isPhone ? 8 : 0 }}><Title size={19}>Today’s picks</Title><Text style={{ color: theme.info, fontWeight: '800', fontSize: 12 }}>{visible.length} active</Text></View>
        {listings.isLoading ? <Loading label="Loading local listings…" /> : listings.error ? <Empty title="Marketplace unavailable" description={(listings.error as Error).message} /> : visible.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: isPhone ? 4 : 12 }}>{visible.map((listing) => <ListingCard key={listing.id} listing={listing} width={col} />)}</View> : <Empty title={search || filter !== 'All' ? 'No matching listings' : 'No active listings'} description={search || filter !== 'All' ? 'Change the search or category filter.' : 'Listings created by real users will appear here.'} />}
      </ScrollView>
    </View>
  </View>;
}

function ListingCard({ listing, width }: { listing: MarketplaceListing; width: string }) {
  const { theme } = useTheme();
  const image = useQuery({ queryKey: ['marketplace-image', listing.image_url], queryFn: () => listing.image_url!.startsWith('http') ? listing.image_url! : signedUrl('marketplace-media', listing.image_url!, 3600), enabled: Boolean(listing.image_url) });
  return <Pressable onLongPress={() => saveEntity('marketplace_listing', listing.id)} style={({ pressed }) => ({ width: width as any, opacity: pressed ? .76 : 1 })}>
    {image.data ? <Image source={{ uri: image.data }} resizeMode="cover" style={{ width: '100%', aspectRatio: 1, borderRadius: 10, backgroundColor: theme.muted }} /> : <View style={{ width: '100%', aspectRatio: 1, borderRadius: 10, backgroundColor: theme.surfaceHover, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.mutedFg, fontSize: 30 }}>▦</Text><Text style={{ color: theme.mutedFg, fontSize: 9, marginTop: 5 }}>No photo</Text></View>}
    <Text numberOfLines={1} style={{ color: theme.text, fontWeight: '900', fontSize: 13, marginTop: 7 }}>{formatMoney(listing.price)}</Text><Text numberOfLines={1} style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{listing.title}</Text><Text numberOfLines={1} style={{ color: theme.mutedFg, fontSize: 10, marginTop: 3 }}>{listing.location || listing.category}</Text>
  </Pressable>;
}
