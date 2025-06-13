import { createTRPCRouter } from '@/server/api/trpc';
import { weatherRouter } from '@/server/api/routers/weather';

export const appRouter = createTRPCRouter({
  weather: weatherRouter,
});

export type AppRouter = typeof appRouter;
