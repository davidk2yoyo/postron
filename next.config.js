/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Only do this temporarily for deployment.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors. Only do this temporarily for deployment.
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Handle konva canvas dependency for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // Add external modules for Node.js specific packages
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
    });
    
    return config;
  },
}

module.exports = nextConfig