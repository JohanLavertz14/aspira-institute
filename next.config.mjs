/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 เป็น native module ต้องให้ Next โหลดจาก node_modules ตรง ๆ ห้าม bundle
  serverExternalPackages: ['better-sqlite3', '@prisma/adapter-better-sqlite3'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
