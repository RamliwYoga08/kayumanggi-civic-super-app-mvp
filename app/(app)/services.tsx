import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { ModuleGrid } from '@/components/ModuleGrid';
import { Field, Muted, Screen, SectionHeader } from '@/components/UI';
import { civicModules } from '@/constants/modules';
import { useState } from 'react';

export default function ServicesScreen(){const params=useLocalSearchParams<{search?:string}>();const[q,setQ]=useState(params.search||'');const normalized=q.trim().toLowerCase();const modules=civicModules.filter(m=>!normalized||`${m.title} ${m.subtitle} ${m.category}`.toLowerCase().includes(normalized));return <Screen><View style={{width:'100%',maxWidth:1200,alignSelf:'center',gap:16}}><SectionHeader title="Menu" subtitle="All Kayumanggi social, civic, public-service, and personal modules"/><Field value={q} onChangeText={setQ} placeholder="Search modules…"/>{modules.length?<ModuleGrid modules={modules}/>:<View style={{padding:24,alignItems:'center'}}><Text>No matching module.</Text><Muted>Try a broader search.</Muted></View>}</View></Screen>;}
