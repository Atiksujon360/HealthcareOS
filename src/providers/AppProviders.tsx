'use client';

import type { PropsWithChildren } from 'react';
import { AppProvider } from '../context/AppContext';

/** Cross-cutting client providers belong here; feature state should stay local to its feature. */
export function AppProviders({ children }: PropsWithChildren) {
  return <AppProvider>{children}</AppProvider>;
}
