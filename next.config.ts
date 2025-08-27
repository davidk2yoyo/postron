import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for Konva SSR issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
    };
    
    // Exclude konva from server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('konva', 'react-konva');
    }
    
    return config;
  },
};

export default nextConfig;
