import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Les photos produits (4 Mo max) passent par une Server Action.
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
