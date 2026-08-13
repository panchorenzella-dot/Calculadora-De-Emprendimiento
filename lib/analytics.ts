"use client";

export type AnalyticsParameters = Record<string, unknown>;

export function trackEvent(name: string, parameters: AnalyticsParameters = {}) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", name, parameters);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...parameters });
}

export function trackPageView(path: string) {
  trackEvent("page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

