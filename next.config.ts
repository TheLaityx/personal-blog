import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  devIndicators: {
    // @ts-ignore - Next.js 16 internal config
    buildActivity: false,
    // @ts-ignore
    appIsrStatus: false,
  } as any,
};

export default nextConfig;
