/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.EXPORT_MOBILE === "true" ? "export" : "standalone",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
