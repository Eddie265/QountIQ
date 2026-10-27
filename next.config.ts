import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages retired in the redesign point to their closest replacement.
  async redirects() {
    return [
      { source: "/reports", destination: "/analytics", permanent: true },
      { source: "/insights", destination: "/analytics", permanent: true },
      { source: "/investments", destination: "/analytics", permanent: true },
      { source: "/savings", destination: "/analytics", permanent: true },
      { source: "/expenses", destination: "/transactions?type=expense", permanent: true },
      { source: "/journal", destination: "/transactions", permanent: true },
      { source: "/accounts", destination: "/transactions", permanent: true },
      { source: "/payroll", destination: "/payments", permanent: true },
      { source: "/promos", destination: "/dashboard", permanent: true },
    ];
  },
};

export default nextConfig;
