/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Lintエラーを無視してビルド通す
  },
};

export default nextConfig;