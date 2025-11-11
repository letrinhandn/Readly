import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import getSessionsRoute from "@/backend/trpc/routes/journal/get-sessions";
import createSessionRoute from "@/backend/trpc/routes/journal/create-session";
import getStatsRoute from "@/backend/trpc/routes/journal/get-stats";
import deleteSessionRoute from "@/backend/trpc/routes/journal/delete-session";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  journal: createTRPCRouter({
    getSessions: getSessionsRoute,
    createSession: createSessionRoute,
    getStats: getStatsRoute,
    deleteSession: deleteSessionRoute,
  }),
});

export type AppRouter = typeof appRouter;
