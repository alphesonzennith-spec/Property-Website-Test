import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';
import { createTRPCContext } from '@/lib/trpc/context';
import { appRouter } from '@/lib/trpc/routers/root';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: ({ req }) => createTRPCContext({ req: req as NextRequest }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`tRPC error on ${path ?? '<unknown>'}:`, error);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
