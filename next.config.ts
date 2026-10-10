import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Room for the teacher's form submissions; videos upload straight to storage, not through here.
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
