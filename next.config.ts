import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'ipfs.io',
    }, {
      protocol: 'https',
      hostname: 'placehold.co',
    }, {
      protocol: 'https',
      hostname: '857c4f158967b95f96003045fdb8c641.ipfscdn.io',
    },
      {
        protocol: 'https',
        hostname: '*.ipfscdn.io',
      }],
  },
  typescript: {
    //@DEV Don't be lazy. Fix the types pal
    ignoreBuildErrors: true,
  },
  eslint: {
    //@DEV Don't be lazy. sort your linting pal
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
