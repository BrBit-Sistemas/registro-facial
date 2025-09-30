import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg'],
  outputFileTracingRoot: __dirname
};

export default nextConfig;
