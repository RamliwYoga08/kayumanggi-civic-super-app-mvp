import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getNews, saveEntity } from '@/services/api';
import { Badge, Button, Card, Empty, Loading, Muted, Screen, SectionHeader, Title } from '@/components/UI';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatDate } from '@/utils/format';
import { useTheme } from '@/features/theme/ThemeProvider';

export default function NewsScreen(){const{isPhone}=useBreakpoint();const{theme}=useTheme();const news=useQuery({queryKey:['news'],queryFn:getNews});return <Screen><View style={{width:'100%',maxWidth:1100,alignSelf:'center',gap:14}}><SectionHeader title="Publications" subtitle="Government releases, civic explainers, and community reporting"/>{news.isLoading?<Loading/>:news.data?.length?<View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{news.data.map(a=><Card key={a.id} style={{width:(isPhone?'100%':'48.8%') as any,minHeight:200}}><View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><Badge tone={a.official?'success':'neutral'}>{a.official?'Official release':'Community'}</Badge><Muted size={9}>{formatDate(a.published_at)}</Muted></View><Title size={16}>{a.title}</Title><Muted>{a.source_name||a.category}</Muted><Text style={{color:theme.textSecondary,fontSize:12,lineHeight:18,marginVertical:10,flex:1}}>{a.excerpt||a.body?.slice(0,240)}</Text><Button variant="secondary" onPress={()=>saveEntity('news_article',a.id)}>Save article</Button></Card>)}</View>:<Empty title="No publications" description="Seed public news or publish through an authorized account."/>}</View></Screen>;}
