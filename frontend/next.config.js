/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack(config) {
    config.module.rules.push(
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
      {
        test: /\.node$/,
        use: "raw-loader",
      }
    );
    return config;
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

export default nextConfig;
