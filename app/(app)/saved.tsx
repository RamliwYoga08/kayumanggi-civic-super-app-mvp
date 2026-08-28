import { Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSavedItems, removeSavedItem } from '@/services/api';
import { Badge, Button, Card, Empty, Loading, Muted, Screen, SectionHeader } from '@/components/UI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { formatDate } from '@/utils/format';

export default function SavedScreen(){const{theme}=useTheme();const qc=useQueryClient();const saved=useQuery({queryKey:['saved'],queryFn:getSavedItems});const remove=useMutation({mutationFn:removeSavedItem,onSuccess:()=>qc.invalidateQueries({queryKey:['saved']})});return <Screen><View style={{width:'100%',maxWidth:850,alignSelf:'center',gap:12}}><SectionHeader title="Saved" subtitle="Your private collection of posts, listings, publications, and civic references"/>{saved.isLoading?<Loading/>:saved.data?.length?saved.data.map((item:any)=><Card key={item.id}><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10}}><View style={{flex:1}}><Badge tone="neutral">{item.entity_type}</Badge><Text style={{color:theme.text,fontWeight:'800',fontSize:12,marginTop:8}}>Reference {item.entity_id}</Text><Muted size={9}>{formatDate(item.created_at)}</Muted></View><Button variant="danger" disabled={remove.isPending} onPress={()=>remove.mutate(item.id)}>Remove</Button></View></Card>):<Empty title="Nothing saved" description="Use Save on a feed post, marketplace listing, or publication."/>}</View></Screen>;}
