/** @type {import('next').NextConfig} */


const nextConfig = {};

module.exports = nextConfig;

module.exports = {
    output: 'standalone',
    experimental: {
      instrumentationHook: true,
    },
  };



