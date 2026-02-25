# Integration Checklist
*A master guide for executing all integration phases based on codebase comment markers.*

## MOCK → Supabase (run when database is connected)
These lines contain mock data generation or simulated database queries that must be swapped for real Supabase `select()`, `insert()`, `update()`, or `delete()` calls.

- [ ] `lib/trpc/routers/users.ts` line 13
- [ ] `lib/trpc/routers/users.ts` line 28
- [ ] `lib/trpc/routers/users.ts` line 53
- [ ] `lib/trpc/routers/users.ts` line 80
- [ ] `lib/trpc/routers/serviceProviders.ts` line 18
- [ ] `lib/trpc/routers/serviceProviders.ts` line 29
- [ ] `lib/trpc/routers/properties.ts` line 19
- [ ] `lib/trpc/routers/properties.ts` line 157
- [ ] `lib/trpc/routers/properties.ts` line 176
- [ ] `lib/trpc/routers/properties.ts` line 204
- [ ] `lib/trpc/routers/properties.ts` line 223
- [ ] `lib/trpc/routers/properties.ts` line 241
- [ ] `lib/trpc/routers/properties.ts` line 251
- [ ] `lib/trpc/routers/properties.ts` line 279
- [ ] `lib/trpc/routers/learning.ts` line 9
- [ ] `lib/trpc/routers/learning.ts` line 23
- [ ] `lib/trpc/routers/learning.ts` line 34
- [ ] `lib/trpc/routers/learning.ts` line 52
- [ ] `lib/trpc/routers/agents.ts` line 12
- [ ] `lib/trpc/routers/agents.ts` line 21
- [ ] `lib/trpc/routers/agents.ts` line 43
- [ ] *Missing:* Remove all `setTimeout` mock latencies across all TRPC routers.
- [ ] *Missing:* Remove all UI `setTimeout` mock loading states in `app/(dashboard)/list-property/*`, `components/listings/*`, etc.

## SINGPASS_SWAP (run when Phase 5.1 backend is built)
These lines control authentication, session state, and user identity, which will shift from local mock state to Supabase Auth & Singpass MyInfo APIs.

- [ ] `lib/mock/singpassMock.ts` line 3
- [ ] `lib/mock/singpassMock.ts` line 49
- [ ] `lib/mock/singpassMock.ts` line 223
- [ ] `lib/mock/singpassMock.ts` line 308
- [ ] `lib/mock/singpassMock.ts` line 424
- [ ] `lib/hooks/useAuth.ts` line 4
- [ ] `lib/hooks/useAuth.ts` line 57
- [ ] *Missing:* Migrate `console.log` auth simulations inside `useAuth.ts` and `app/(auth)/forgot-password/page.tsx` handlers to actual Supabase Auth API calls.

## AI_SERVICE (run when FastAPI connected)
These lines bridge the frontend to the intelligent backend for natural language queries and generative market explanations.

- [ ] `lib/trpc/routers/properties.ts` line 292
- [ ] `lib/trpc/routers/properties.ts` line 293
- [ ] *Missing:* `app/insights/widgets/AiMarketAnalysisWidget.tsx` (Remove `setTimeout` delay, hook up stream)
- [ ] *Missing:* `app/api/ai/explain-regulation/route.ts` (Connect to real LLM backend rather than returning static regulatory string)

## RATE (Periodic Updates Required)
These lines contain market parameters safely decoupled from backend configs, but require manual monitoring.

- [ ] `hooks/calculators/useMortgageCalculation.ts` line 11 (Bank Interest Rate defaults)

## PHASE 4, PHASE 5, ONEMAPS, CRON
No explicit strict markers found yet, except those needing standardisation from Task 1 (e.g. `// Supabase table: ...` -> `// PHASE5:`). These will populate as the architecture grows.
