const nextConfig = {
  output: undefined, // "standalone" を一旦無効化
  experimental: {
    outputFileTracing: false, // `true` だと `prerender-manifest.json` の生成が抑制される可能性がある
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ ESLint のエラーを無視（これは変更しない）
  },
};

export default nextConfig;
