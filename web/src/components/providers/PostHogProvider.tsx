'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize PostHog
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only', // Only create profiles when needed
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        capture_pageleave: false, // Disable to save on events
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug();
        },
        // Enable geolocation tracking via IP
        ip: true,
        // Disable session recording to save costs
        disable_session_recording: true,
        // Disable autocapture to minimize events
        autocapture: false,
      });

      // Capture initial pageview with basic info
      posthog.capture('app_visit', {
        app_name: 'Weather Now',
        app_version: '0.1.0',
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    // Only track route changes if it's a different page (not just search params)
    if (pathname && typeof window !== 'undefined' && pathname !== '/') {
      posthog.capture('page_view', {
        page: pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
