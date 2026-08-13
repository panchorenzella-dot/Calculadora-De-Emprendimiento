declare module "*.css";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: string, name: string, parameters?: Record<string, unknown>) => void;
  }
}

export {};
