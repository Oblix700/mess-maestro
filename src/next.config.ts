import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is to allow cross-origin requests from the development environment.
  allowedDevOrigins: [
      'http://localhost:9002',
      'https://*.cloudworkstations.dev',
      'http://*.cloudworkstations.dev',
      'https://*.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev'
  ],
  experimental: {},
};

export default nextConfig;
