import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Modo standalone: genera un servidor Node.js autocontenido para Docker.
  // El directorio .next/standalone incluye todo lo necesario para producción.
  output: 'standalone',
  cacheComponents: true,
  partialPrefetching: true,
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
