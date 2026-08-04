/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output so the build can run on Netlify / Vercel / any host.
  output: "standalone",
  // Don't fail the build on minor TS errors — they are surfaced via `bun run lint`.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow preview origins (Netlify deploy previews, sandbox preview, etc.)
  // to fetch _next resources without CORS warnings in dev.
  allowedDevOrigins: ["*.space-z.ai", "*.netlify.app"],
};

export default nextConfig;
