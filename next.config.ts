import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers are now applied via middleware.ts using a per-request
  // nonce-based CSP. The headers() function here is intentionally removed
  // to avoid duplicate or conflicting Content-Security-Policy directives.
};

export default nextConfig;
