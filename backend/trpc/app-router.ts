import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import getSessionsRoute from "@/backend/trpc/routes/journal/get-sessions";
import createSessionRoute from "@/backend/trpc/routes/journal/create-session";
import getStatsRoute from "@/backend/trpc/routes/journal/get-stats";
import deleteSessionRoute from "@/backend/trpc/routes/journal/delete-session";
import addCommentRoute from "@/backend/trpc/routes/journal/add-comment";
import getCommentsRoute from "@/backend/trpc/routes/journal/get-comments";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  journal: createTRPCRouter({
    getSessions: getSessionsRoute,
    createSession: createSessionRoute,
    getStats: getStatsRoute,
    deleteSession: deleteSessionRoute,
    addComment: addCommentRoute,
    getComments: getCommentsRoute,
  }),
});

export type AppRouter = typeof appRouter;
