"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";

import { trackEvent, trackPageView } from "@/lib/analytics";

export default function AnalyticsPageView() {
  const pathname = usePathname();
  const reportWebVital = useCallback((metric: Parameters<Parameters<typeof useReportWebVitals>[0]>[0]) => {
    trackEvent("web_vital", {
      metric_id: metric.id,
      metric_name: metric.name,
      metric_value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      metric_delta: Math.round(metric.name === "CLS" ? metric.delta * 1000 : metric.delta),
      metric_rating: metric.rating,
      navigation_type: metric.navigationType,
    });
  }, []);

  useReportWebVitals(reportWebVital);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
