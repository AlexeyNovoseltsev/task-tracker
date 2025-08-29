import { useEffect } from 'react';
import * as React from 'react';

// Analytics and User Tracking
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

interface UserProperties {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
  plan?: string;
  signupDate?: Date;
}

class Analytics {
  private isInitialized = false;
  private userId: string | null = null;
  
  // Initialize analytics
  init() {
    if (this.isInitialized) return;
    
    // Google Analytics 4
    if ((import.meta as any).env?.VITE_GA_MEASUREMENT_ID && typeof window !== 'undefined') {
      this.initGoogleAnalytics();
    }
    
    // Mixpanel
    if ((import.meta as any).env?.VITE_MIXPANEL_TOKEN && typeof window !== 'undefined') {
      this.initMixpanel();
    }
    
    // PostHog
    if ((import.meta as any).env?.VITE_POSTHOG_KEY && typeof window !== 'undefined') {
      this.initPostHog();
    }
    
    this.isInitialized = true;
  }
  
  private initGoogleAnalytics() {
    const measurementId = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID!;
    
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
    
    // Configure gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', measurementId, {
      send_page_view: false, // We'll handle page views manually
    });
  }
  
  private initMixpanel() {
    // Mixpanel initialization would go here
    console.log('Mixpanel initialized');
  }
  
  private initPostHog() {
    // PostHog initialization would go here
    console.log('PostHog initialized');
  }
  
  // Identify user
  identify(user: UserProperties) {
    this.userId = user.userId;
    
    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('config', (import.meta as any).env?.VITE_GA_MEASUREMENT_ID, {
        user_id: user.userId,
        custom_map: {
          user_role: user.role,
          user_plan: user.plan,
        }
      });
    }
    
    // Set user properties for other analytics tools
    this.setUserProperties(user);
  }
  
  // Set user properties
  setUserProperties(properties: Partial<UserProperties>) {
    // Implementation for various analytics providers
    console.log('User properties set:', properties);
  }
  
  // Track events
  track(event: string, properties?: Record<string, any>) {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized');
      return;
    }
    
    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user_agent: navigator.userAgent,
      },
      userId: this.userId || undefined,
    };
    
    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', event, {
        ...properties,
        user_id: this.userId,
      });
    }
    
    // Console logging for development
    if ((import.meta as any).env?.MODE === 'development') {
      console.log('📊 Analytics Event:', eventData);
    }
  }
  
  // Track page views
  page(title?: string, path?: string) {
    const pageData = {
      page_title: title || document.title,
      page_location: path || window.location.href,
      user_id: this.userId,
    };
    
    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_view', pageData);
    }
    
    if ((import.meta as any).env?.MODE === 'development') {
      console.log('📄 Page View:', pageData);
    }
  }
  
  // Track conversions
  conversion(conversionName: string, value?: number, currency?: string) {
    this.track('conversion', {
      conversion_name: conversionName,
      value,
      currency: currency || 'USD',
    });
  }
  
  // Reset user (logout)
  reset() {
    this.userId = null;
    
    // Clear user data from analytics providers
    if ((window as any).gtag) {
      (window as any).gtag('config', (import.meta as any).env?.VITE_GA_MEASUREMENT_ID, {
        user_id: null,
      });
    }
  }
}

// Create singleton instance
export const analytics = new Analytics();

// React hooks for analytics
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    page: analytics.page.bind(analytics),
    identify: analytics.identify.bind(analytics),
    conversion: analytics.conversion.bind(analytics),
    reset: analytics.reset.bind(analytics),
  };
};

// HOC for tracking page views
export const withPageTracking = <P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string
) => {
  return function WrappedComponent(props: P) {
    useEffect(() => {
      analytics.page(pageName);
    }, []);
    
    return React.createElement(Component, props);
  };
};

// Predefined events for common actions
export const AnalyticsEvents = {
  // Authentication
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  USER_REGISTERED: 'user_registered',
  
  // Navigation
  PAGE_VIEWED: 'page_viewed',
  LINK_CLICKED: 'link_clicked',
  
  // Task Management
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
  TASK_DELETED: 'task_deleted',
  PROJECT_CREATED: 'project_created',
  SPRINT_STARTED: 'sprint_started',
  
  // Features
  FEATURE_USED: 'feature_used',
  SEARCH_PERFORMED: 'search_performed',
  EXPORT_INITIATED: 'export_initiated',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  
  // Performance
  PERFORMANCE_MEASURED: 'performance_measured',
} as const;
