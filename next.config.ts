import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App is fully client-side (no server components, no API routes, no
  // fetch/process.env at runtime) -- a static export deploys as plain
  // static assets, same pattern besti-rio-/class-system use on Cloudflare
  // Workers, no next-on-pages/SSR adapter needed.
  output: "export",
};

export default nextConfig;
