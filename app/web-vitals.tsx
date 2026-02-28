'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

// NOTE: FID (First Input Delay) was removed in web-vitals v4 and replaced by
// INP (Interaction to Next Paint) as a Core Web Vitals metric.
// INP is tracked here via onINP.

function handleMetric(metric: Metric) {
  if (process.env.NODE_ENV === 'development') {
    const rating =
      metric.rating === 'good'
        ? '\x1b[32m good\x1b[0m'
        : metric.rating === 'needs-improvement'
          ? '\x1b[33m needs-improvement\x1b[0m'
          : '\x1b[31m poor\x1b[0m';

    console.log(
      `[Web Vitals] ${metric.name}: ${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'} —${rating}`
    );
    return;
  }

  // ANALYTICS: Send to analytics service in production
  // Uncomment and configure one of the following:

  // Vercel Analytics
  // import { sendBeacon } from 'next/dist/client/dev/fouc';
  // window.vercelAnalytics?.track(metric.name, { value: metric.value });

  // Google Analytics 4
  // window.gtag?.('event', metric.name, {
  //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //   metric_id: metric.id,
  //   metric_value: metric.value,
  //   metric_delta: metric.delta,
  //   metric_rating: metric.rating,
  // });

  // Custom endpoint
  // navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(metric));
}

export function WebVitals() {
  useEffect(() => {
    // Core Web Vitals (field metrics)
    onCLS(handleMetric);   // Cumulative Layout Shift
    onLCP(handleMetric);   // Largest Contentful Paint
    onINP(handleMetric);   // Interaction to Next Paint (replaces FID)

    // Diagnostic metrics
    onFCP(handleMetric);   // First Contentful Paint
    onTTFB(handleMetric);  // Time to First Byte
  }, []);

  return null;
}
