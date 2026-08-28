import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelServiceRequest, createServiceRequest, getCivicResources, getMyServiceRequests } from '@/services/api';
import { moduleBySlug } from '@/constants/modules';
import { experienceFor } from '@/constants/moduleExperiences';
import { Badge, Button, Card, Empty, Field, Loading, Muted, Screen, SegmentedControl, Title } from '@/components/UI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatDate } from '@/utils/format';

const statusTone = (status?: string): 'success'|'danger'|'info'|'warning'|'neutral' => status === 'active' || status === 'verified' || status === 'completed' ? 'success' : status === 'urgent' || status === 'rejected' ? 'danger' : status === 'processing' ? 'info' : status === 'submitted' ? 'warning' : 'neutral';

export default function GenericModuleScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug || '';
  const module = moduleBySlug(slug);
  const experience = experienceFor(slug, module?.title || 'Service', module?.subtitle || 'Civic service');
  const { theme } = useTheme();
  const { isPhone } = useBreakpoint();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(experience.tabs[0] || 'Overview');
  const [query, setQuery] = useState('');
  const [showRequest, setShowRequest] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [details, setDetails] = useState('');
  const resources = useQuery({ queryKey: ['resources', slug], queryFn: () => getCivicResources(slug), enabled: Boolean(slug) });
  const requests = useQuery({ queryKey: ['my-service-requests', slug], queryFn: () => getMyServiceRequests(slug), enabled: Boolean(slug) });
  const create = useMutation({
    mutationFn: () => createServiceRequest({ module: slug, request_type: experience.requestType, title: requestTitle, details }),
    onSuccess: async () => { setRequestTitle(''); setDetails(''); setShowRequest(false); setTab('My requests'); await queryClient.invalidateQueries({ queryKey: ['my-service-requests', slug] }); },
  });
  const cancel = useMutation({ mutationFn: cancelServiceRequest, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-service-requests', slug] }) });
  const filtered = useMemo(() => (resources.data || []).filter((item) => !query.trim() || `${item.title} ${item.subtitle || ''} ${item.description || ''}`.toLowerCase().includes(query.trim().toLowerCase())), [query, resources.data]);

  if (!module) return <Screen><Empty title="Unknown module" description="This route is not registered in the Kayumanggi module map."/></Screen>;
  const showingRequests = tab === 'My requests';

  return <Screen>
    <View style={{ width: '100%', maxWidth: 1120, alignSelf: 'center', gap: 16 }}>
      <View style={{ overflow: 'hidden', borderRadius: 22, backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border }}>
        <View style={{ height: 5, backgroundColor: module.color }} />
        <View style={{ padding: isPhone ? 18 : 26, flexDirection: isPhone ? 'column' : 'row', gap: 20, alignItems: isPhone ? 'stretch' : 'center' }}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={{ color: module.color, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 }}>{experience.eyebrow}</Text>
            <Title size={isPhone ? 25 : 32}>{experience.heroTitle}</Title>
            <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 20, maxWidth: 680 }}>{experience.heroBody}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 }}><Badge tone="success">Supabase connected</Badge><Badge tone="info">Authenticated access</Badge><Badge tone="neutral">RLS protected</Badge></View>
          </View>
          <View style={{ width: isPhone ? '100%' : 220, gap: 8 }}><Button onPress={() => setShowRequest((value) => !value)}>{showRequest ? 'Close form' : experience.actionLabel}</Button><Muted size={10}>You can track every submission from this module.</Muted></View>
        </View>
      </View>

      {experience.notices?.map((notice) => <View key={notice} style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, backgroundColor: `${slug === 'disaster' ? theme.danger : theme.warning}12`, borderWidth: 1, borderColor: `${slug === 'disaster' ? theme.danger : theme.warning}55` }}><Text style={{ color: slug === 'disaster' ? theme.danger : theme.warning, fontWeight: '900' }}>!</Text><Text style={{ color: theme.textSecondary, fontSize: 11, lineHeight: 16, flex: 1 }}>{notice}</Text></View>)}

      {showRequest ? <Card style={{ gap: 10 }}>
        <View><Title size={16}>{experience.actionLabel}</Title><Muted>Only you and authorized civic staff can access this request.</Muted></View>
        <Field placeholder={experience.requestPlaceholder} value={requestTitle} onChangeText={setRequestTitle} maxLength={180} />
        <Field multiline placeholder="Add relevant details. Avoid passwords, financial account numbers, health records, and government ID numbers." value={details} onChangeText={setDetails} maxLength={3000} style={{ minHeight: 105, textAlignVertical: 'top' }} />
        {create.error ? <Text accessibilityRole="alert" style={{ color: theme.danger, fontSize: 12 }}>{(create.error as Error).message}</Text> : null}
        <View style={{ flexDirection: isPhone ? 'column-reverse' : 'row', justifyContent: 'flex-end', gap: 8 }}><Button variant="ghost" onPress={() => setShowRequest(false)}>Cancel</Button><Button disabled={create.isPending || !requestTitle.trim()} onPress={() => create.mutate()}>{create.isPending ? 'Submitting…' : 'Submit securely'}</Button></View>
      </Card> : null}

      <View style={{ flexDirection: isPhone ? 'column' : 'row', gap: 10 }}>
        {experience.metrics.map((metric) => <Card key={metric.label} style={{ flex: 1, padding: 14 }}><Muted size={10}>{metric.label}</Muted><Text style={{ color: metric.tone === 'danger' ? theme.danger : metric.tone === 'warning' ? theme.warning : metric.tone === 'success' ? theme.active : theme.info, fontSize: 17, fontWeight: '900', marginTop: 3 }}>{metric.value}</Text></Card>)}
      </View>

      <SegmentedControl options={experience.tabs} value={tab} onChange={setTab} />

      {showingRequests ? <View style={{ gap: 10 }}>
        <View><Title size={18}>My requests</Title><Muted>Private submissions for {module.title}</Muted></View>
        {requests.isLoading ? <Loading label="Loading your requests…"/> : requests.error ? <Empty title="Requests unavailable" description={(requests.error as Error).message}/> : requests.data?.length ? requests.data.map((item) => <Card key={item.id} style={{ gap: 9 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}><View style={{ flex: 1 }}><Text style={{ color: theme.text, fontWeight: '900', fontSize: 14 }}>{item.title}</Text><Muted size={10}>{formatDate(item.created_at)} · {item.request_type.replaceAll('_', ' ')}</Muted></View><Badge tone={statusTone(item.status)}>{item.status.replaceAll('_', ' ')}</Badge></View>
          {item.details ? <Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 18 }}>{item.details}</Text> : null}
          {['draft','submitted'].includes(item.status) ? <Pressable disabled={cancel.isPending} onPress={() => cancel.mutate(item.id)} style={{ alignSelf: 'flex-start', paddingVertical: 5 }}><Text style={{ color: theme.danger, fontSize: 11, fontWeight: '800' }}>Cancel request</Text></Pressable> : null}
        </Card>) : <Empty title="No requests yet" description={`Use “${experience.actionLabel}” when you need help or want to participate.`}/>}
      </View> : <View style={{ gap: 12 }}>
        <View style={{ flexDirection: isPhone ? 'column' : 'row', alignItems: isPhone ? 'stretch' : 'center', gap: 10 }}><View style={{ flex: 1 }}><Title size={18}>{tab}</Title><Muted>Verified programs and community resources</Muted></View><Field value={query} onChangeText={setQuery} placeholder="Search this module…" style={{ width: (isPhone ? '100%' : 300) as any }} /></View>
        {resources.isLoading ? <Loading label={`Loading ${module.title.toLowerCase()}…`}/> : resources.error ? <Empty title="Content unavailable" description={(resources.error as Error).message}/> : filtered.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {filtered.map((item) => <Card key={item.id} style={{ width: (isPhone ? '100%' : '48.8%') as any, minHeight: 170, gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><View style={{ width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: `${module.color}1A` }}><Text style={{ color: module.color, fontSize: 18, fontWeight: '900' }}>{module.emoji}</Text></View>{item.status ? <Badge tone={statusTone(item.status)}>{item.status}</Badge> : null}</View>
            <View style={{ flex: 1 }}><Title size={15}>{item.title}</Title>{item.subtitle ? <Muted>{item.subtitle}</Muted> : null}<Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 8 }}>{item.description || 'Open this resource for details and available resident actions.'}</Text></View>
            <Pressable onPress={() => { setRequestTitle(item.title); setShowRequest(true); }} style={{ alignSelf: 'flex-start', paddingVertical: 5 }}><Text style={{ color: module.color, fontSize: 11, fontWeight: '900' }}>{item.action_label || 'Ask about this'} →</Text></Pressable>
          </Card>)}
        </View> : <Empty title={query ? 'No matching resources' : `No ${module.title} content yet`} description={query ? 'Try a broader search.' : 'The module is connected to Supabase. Authorized staff can publish verified resources here.'}/>}
      </View>}
    </View>
  </Screen>;
}
