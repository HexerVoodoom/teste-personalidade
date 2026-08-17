import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App is fully client-side (no server components, no API routes, no
  // fetch/process.env at runtime) -- a static export deploys as plain
  // static assets, same pattern besti-rio-/class-system use on Cloudflare
  // Workers, no next-on-pages/SSR adapter needed.
  output: "export",
  // `class-system` é dependência de git em TypeScript PURO (o repo não tem
  // build: `main` aponta direto para `src/index.ts`). Sem isto o Next não
  // transpila o pacote e o import quebra.
  transpilePackages: ["class-system"],
};

export default nextConfig;
