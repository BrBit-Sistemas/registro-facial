import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg'],
  outputFileTracingRoot: __dirname
};

export default nextConfig;
