/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mjs'],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
  env: {
    PROD_API_URL: 'https://api.hatfilms.co.uk',
    DEV_API_URL: 'http://localhost:6969',
    NEXT_PUBLIC_VERSION: '1.5.4',
    NEXT_PUBLIC_NAME: 'Hat Films',
  },
};

export default nextConfig;
