import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gym-fit.s3.fr-par.scw.cloud",
        port: "",
        pathname: "/public/exercises/images/**",
      },
    ],
  },
};

export default nextConfig;
