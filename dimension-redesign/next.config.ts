import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos produits et affiches servies directement par la boutique actuelle.
    remotePatterns: [new URL("https://dimensionbte.com/wp-content/uploads/**")],
  },
};

export default nextConfig;
