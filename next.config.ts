// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typescript: {
    strict: true,
  },
  eslint: {
    dirs: ['src'],
  },
}

export default nextConfig
