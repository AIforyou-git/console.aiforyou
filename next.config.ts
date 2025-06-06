import type { NextConfig } from 'next';

const isTurbopack = process.env.TURBOPACK === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  

  ...(isTurbopack
    ? {}
    : {
        webpack(config, options) {
          // 必要に応じて Webpack のカスタム設定を書く
          return config;
        },
      }),
};

export default nextConfig;
