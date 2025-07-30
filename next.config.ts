import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Deshabilitar ESLint durante el build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar TypeScript checking durante el build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
