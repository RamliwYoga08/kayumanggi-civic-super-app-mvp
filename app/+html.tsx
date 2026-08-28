import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return <html lang="en"><head><meta charSet="utf-8"/><meta httpEquiv="X-UA-Compatible" content="IE=edge"/><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"/><meta name="theme-color" content="#09090b"/><meta name="description" content="Kayumanggi Civic Super App — community, governance, local services, jobs, events, and civic participation."/><link rel="manifest" href="/manifest.json"/><ScrollViewStyleReset/><script src="/register-sw.js" defer></script></head><body>{children}</body></html>;
}
