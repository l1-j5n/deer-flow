/**
 * Next.js Configuration for DeerFlow
 *
 * Supports both development (dev server) and production (static export) modes.
 * For Electron production builds, use STATIC_EXPORT=true to generate static files.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  devIndicators: false,

  experimental: {
    serverActions: {},
    ppr: false,
    optimizePackageImports: [],
    // Don't exit early on prerender errors — log them and continue.
    // This works around Next.js 16 internal _global-error / _not-found
    // prerender issues with client components.
    prerenderEarlyExit: false,
  },

  staticPageGenerationTimeout: 60,

  skipTrailingSlashRedirect: true,

  generateBuildId: async () => {
    return "deerflow-" + Date.now();
  },

  // Static export configuration for Electron production builds
  // Set STATIC_EXPORT=true when building for Electron distribution
  ...(process.env.STATIC_EXPORT === "true" && {
    output: "export",
    distDir: "dist-static",
    images: {
      unoptimized: true,
    },
    trailingSlash: true,
  }),

  // Rewrites for API proxy (development only)
  ...(process.env.STATIC_EXPORT !== "true" && {
    async rewrites() {
      return [
        {
          source: "/api/langgraph/:path*",
          destination: "http://localhost:2024/:path*",
        },
        {
          source: "/api/:path*",
          destination: "http://localhost:8001/api/:path*",
        },
      ];
    },
  }),
};

export default config;
