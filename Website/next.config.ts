import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // Entry points that have no page of their own.
  async redirects() {
    return [
      // The app opens on tonight's NBA games. Keep in step with DEFAULT_LEAGUE in src/lib/routes.ts.
      { source: "/", destination: "/nba/games", permanent: false },
      { source: "/:league", destination: "/:league/games", permanent: false },
      // A game opens on its Matchup tab.
      { source: "/:league/games/:gameId", destination: "/:league/games/:gameId/matchup", permanent: false },
    ];
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
