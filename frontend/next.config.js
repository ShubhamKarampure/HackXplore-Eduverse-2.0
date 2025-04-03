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
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'], // ✅ Allow Cloudinary & Google-hosted images
  },
};

export default nextConfig;