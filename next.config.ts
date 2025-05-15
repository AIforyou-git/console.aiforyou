import type { NextConfig } from 'next';

const isTurbopack = process.env.TURBOPACK === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  ...(isTurbopack
    ? {}
    : {
        webpack(config, options) {
          // ここに必要なWebpackのカスタムがあれば書いてOK
          return config;
        },
      }),
};

export default nextConfig;
