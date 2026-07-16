import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin Turbopack root to this app (avoids parent lockfile confusion)
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
