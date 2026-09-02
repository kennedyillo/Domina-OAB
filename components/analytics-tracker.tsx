"use client";

import { trackAnalytics } from "@/lib/analytics";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    trackAnalytics("page_view", pathname);
  }, [pathname, query]);

  return null;
}

export function AnalyticsTracker() {
  return <Suspense fallback={null}><RouteTracker/></Suspense>;
}
