import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
      {
        protocol: 'https',
        hostname: 'pmsantoangelo.abase.com.br',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // serverActions: true, // Uncomment if planning to use Next.js Server Actions for forms
  },
};

export default nextConfig;
