export const GA_MEASUREMENT_ID = 'G-KD59NRHCLY';

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: 'event' | 'config' | 'js', target: string | Date, params?: GtagParams) => void;
  }
}

export function trackEvent(eventName: string, params: GtagParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, {
    site_area: 'yaml_validator',
    ...params,
  });
}
