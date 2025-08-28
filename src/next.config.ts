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
  experimental: {
    // This is required to allow the Firebase Studio development environment to communicate with the Next.js server.
    allowedDevOrigins: [
        "https://6000-firebase-studio-1756054617899.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
