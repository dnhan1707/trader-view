/**** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  async rewrites() {
    const target = process.env.API_BASE_URL || 'http://localhost:8080';
    return [
      {
        source: '/backend/:path*',
        destination: `${target}/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
