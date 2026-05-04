import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // 去掉 distDir: 'dist'，让 Vercel 使用默认的 'out' 目录
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
