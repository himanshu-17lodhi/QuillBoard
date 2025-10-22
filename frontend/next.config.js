const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // This is the fix for the Turbopack root error
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },

  images: {
    // Replaces deprecated `images.domains`
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Example: Google user avatars
        port: '',
        pathname: '/a/**',
      },
    ],
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Use fallback for non-Docker dev (which 'npm run start:all' is)
        destination: (process.env.BACKEND_API_URL || 'http://localhost:3001') + '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

