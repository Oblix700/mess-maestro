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
      'https://*.cloudworkstations.dev',
  ],
  experimental: {},
};

export default nextConfig;
