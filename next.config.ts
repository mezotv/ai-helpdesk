import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  rewrites: async () => {
    return [
      {
        source: "/login",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
