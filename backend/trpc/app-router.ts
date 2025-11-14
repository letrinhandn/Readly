import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import getSessionsRoute from "@/backend/trpc/routes/journal/get-sessions";
import createSessionRoute from "@/backend/trpc/routes/journal/create-session";
import getStatsRoute from "@/backend/trpc/routes/journal/get-stats";
import deleteSessionRoute from "@/backend/trpc/routes/journal/delete-session";
import addCommentRoute from "@/backend/trpc/routes/journal/add-comment";
import getCommentsRoute from "@/backend/trpc/routes/journal/get-comments";
import getAllBadgesRoute from "@/backend/trpc/routes/badges/get-all-badges";
import getUserBadgesRoute from "@/backend/trpc/routes/badges/get-user-badges";
import awardBadgeRoute from "@/backend/trpc/routes/badges/award-badge";
import createBadgeDefinitionRoute from "@/backend/trpc/routes/badges/create-badge-definition";

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
  badges: createTRPCRouter({
    getAllBadges: getAllBadgesRoute,
    getUserBadges: getUserBadgesRoute,
    awardBadge: awardBadgeRoute,
    createBadgeDefinition: createBadgeDefinitionRoute,
  }),
});

export type AppRouter = typeof appRouter;
