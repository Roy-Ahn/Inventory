'use client';

import PageTransition from './PageTransition';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

