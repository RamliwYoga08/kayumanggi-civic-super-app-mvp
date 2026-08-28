import { useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createServiceRequest, getCivicResources } from '@/services/api';
import { moduleBySlug } from '@/constants/modules';
import { Badge, Button, Card, Empty, Field, Loading, Muted, Screen, SectionHeader, Title } from '@/components/UI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function GenericModuleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const module = moduleBySlug(slug);
  const { theme } = useTheme();
  const { isPhone } = useBreakpoint();
  const [showRequest, setShowRequest] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [details, setDetails] = useState('');
  const resources = useQuery({ queryKey: ['resources', slug], queryFn: () => getCivicResources(slug || ''), enabled: Boolean(slug) });
  const request = useMutation({
    mutationFn: () => createServiceRequest({ module: slug || 'unknown', title: requestTitle, details }),
    onSuccess: () => { setRequestTitle(''); setDetails(''); setShowRequest(false); },
  });

  if (!module) return <Screen><Empty title="Unknown module" description="This route is not registered in the Kayumanggi module map."/></Screen>;

  return <Screen>
    <View style={{ width: '100%', maxWidth: 1100, alignSelf: 'center', gap: 14 }}>
      <SectionHeader
        title={`${module.emoji} ${module.title}`}
        subtitle={module.subtitle}
        right={<Badge tone="info">{module.category}</Badge>}
      />

      <Card style={{ gap: 10 }}>
        <Title size={15}>Civic access</Title>
        <Muted>Browse verified or community-published resources for this module. Authenticated residents can also submit a general request that is tracked privately in their account.</Muted>
        <Button variant="secondary" onPress={() => setShowRequest((v) => !v)}>{showRequest ? 'Close request form' : 'Submit a request'}</Button>
        {showRequest ? <View style={{ gap: 9 }}>
          <Field placeholder="Request title" value={requestTitle} onChangeText={setRequestTitle} />
          <Field multiline placeholder="Describe what you need" value={details} onChangeText={setDetails} style={{ minHeight: 90, textAlignVertical: 'top' }} />
          {request.error ? <Text style={{ color: theme.danger, fontSize: 12 }}>{(request.error as Error).message}</Text> : null}
          {request.isSuccess ? <Text style={{ color: theme.active, fontSize: 12 }}>Request submitted.</Text> : null}
          <Button disabled={request.isPending || !requestTitle.trim()} onPress={() => request.mutate()}>{request.isPending ? 'Submitting…' : 'Submit securely'}</Button>
        </View> : null}
      </Card>

      {resources.isLoading ? <Loading/> : resources.data?.length ?
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {resources.data.map((r) => <Card key={r.id} style={{ width: (isPhone ? '100%' : '48.8%') as any, minHeight: 150 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <Title size={15}>{r.title}</Title>
              {r.status ? <Badge tone={r.status === 'active' || r.status === 'verified' ? 'success' : r.status === 'urgent' ? 'danger' : 'neutral'}>{r.status}</Badge> : null}
            </View>
            {r.subtitle ? <Muted>{r.subtitle}</Muted> : null}
            <Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 10 }}>{r.description}</Text>
          </Card>)}
        </View> :
        <Empty title={`No ${module.title} content yet`} description="The module is connected to Supabase. Authorized staff can publish civic resources here."/>
      }
    </View>
  </Screen>;
}
