import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tắt ESLint trong quá trình build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;