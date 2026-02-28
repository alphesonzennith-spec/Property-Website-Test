// lib/trpc/routers/root.ts
import { router } from '../trpc';
import { propertiesRouter }       from './properties';
import { usersRouter }            from './users';
import { agentsRouter }           from './agents';
import { serviceProvidersRouter } from './serviceProviders';
import { learningRouter }         from './learning';
import { calculatorsRouter }      from './calculators';
import { notificationsRouter }    from './notifications';
import { messagesRouter }         from './messages';

export const appRouter = router({
  properties:       propertiesRouter,
  users:            usersRouter,
  agents:           agentsRouter,
  serviceProviders: serviceProvidersRouter,
  learning:         learningRouter,
  calculators:      calculatorsRouter,
  notifications:    notificationsRouter,
  messages:         messagesRouter,
});

/** Type exported for use by the client-side tRPC hooks. */
export type AppRouter = typeof appRouter;
