// lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './routers/root';

/**
 * tRPC React hooks. Import `trpc` anywhere in client components to access
 * type-safe procedures, e.g. `trpc.properties.list.useQuery(filters)`.
 */
export const trpc = createTRPCReact<AppRouter>();
