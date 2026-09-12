/** @type {import('next').NextConfig} */
const nextConfig = {
  // ให้ Next โหลด pg จาก node_modules ตรง ๆ ไม่ต้อง bundle
  serverExternalPackages: ['pg'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
