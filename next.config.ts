import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 恢复标准模式，不使用 'export'，让 Vercel 自动处理
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
