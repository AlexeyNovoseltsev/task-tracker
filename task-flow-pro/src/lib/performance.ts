// Performance Monitoring and Web Vitals
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import * as React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
  navigationType: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isInitialized = false;
  private lastRenderTime = 0;
  private renderThrottleMs = 100; // Ограничение частоты измерений рендеринга

  init() {
    if (this.isInitialized) return;
    
    // Track Core Web Vitals
    this.trackWebVitals();
    
    // Track custom performance metrics
    this.trackCustomMetrics();
    
    // Track resource loading performance
    this.trackResourceLoading();
    
    this.isInitialized = true;
  }

  private trackWebVitals() {
    // Cumulative Layout Shift (CLS)
    onCLS((metric: any) => {
      this.recordMetric('CLS', metric);
      this.sendMetric(metric);
    });

    // Interaction to Next Paint (INP) - replaced FID
    onINP((metric: any) => {
      this.recordMetric('INP', metric);
      this.sendMetric(metric);
    });

    // First Contentful Paint (FCP)
    onFCP((metric: any) => {
      this.recordMetric('FCP', metric);
      this.sendMetric(metric);
    });

    // Largest Contentful Paint (LCP)
    onLCP((metric: any) => {
      this.recordMetric('LCP', metric);
      this.sendMetric(metric);
    });

    // Time to First Byte (TTFB)
    onTTFB((metric: any) => {
      this.recordMetric('TTFB', metric);
      this.sendMetric(metric);
    });
  }

  private trackCustomMetrics() {
    // Track React render performance
    if ('performance' in window && 'measure' in performance) {
      // Component render timing
      this.measureComponentRender();
      
      // Route transition timing
      this.measureRouteTransitions();
    }
  }

  private trackResourceLoading() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      // Track resource loading times
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.analyzeResourcePerformance(entry as PerformanceResourceTiming);
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private measureComponentRender() {
    // Hook into React DevTools if available
    if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const devtools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;

      devtools.onCommitFiberRoot = (id: number, root: any) => {
        const now = performance.now();

        // Throttle измерения рендеринга для предотвращения бесконечных циклов
        if (now - this.lastRenderTime >= this.renderThrottleMs) {
          this.lastRenderTime = now;
          this.recordCustomMetric('react_render_time', now);
        }
      };
    }
  }

  private measureRouteTransitions() {
    // Measure route transition performance - только для начальной загрузки
    const initialLoadTime = performance.now();

    // Listen for navigation events (только один раз)
    const handleLoad = () => {
      const transitionTime = performance.now() - initialLoadTime;
      this.recordCustomMetric('route_transition_time', transitionTime);
      window.removeEventListener('load', handleLoad);
    };

    window.addEventListener('load', handleLoad, { once: true });
  }

  private analyzeResourcePerformance(entry: PerformanceResourceTiming) {
    const analysis = {
      name: entry.name,
      size: entry.transferSize,
      duration: entry.duration,
      startTime: entry.startTime,
      type: this.getResourceType(entry.name),
    };

    // Flag slow resources
    if (entry.duration > 1000) { // > 1 second
      this.recordCustomMetric('slow_resource', entry.duration, {
        resource: entry.name,
        type: analysis.type,
      });
    }

    // Flag large resources
    if (entry.transferSize > 1024 * 1024) { // > 1MB
      this.recordCustomMetric('large_resource', entry.transferSize, {
        resource: entry.name,
        type: analysis.type,
      });
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  private recordMetric(name: string, metric: any) {
    this.metrics.set(name, {
      name,
      value: metric.value,
      delta: metric.delta,
      entries: metric.entries,
      navigationType: metric.navigationType,
      rating: metric.rating,
    });
  }

  private recordCustomMetric(name: string, value: number, metadata?: any) {
    const metric = {
      name,
      value,
      delta: value,
      entries: [],
      navigationType: 'navigate',
      rating: this.getRating(name, value),
      metadata,
    } as PerformanceMetric;

    this.metrics.set(name, metric);
    this.sendMetric(metric);
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      react_render_time: [16, 50], // 16ms = 60fps, 50ms = 20fps
      route_transition_time: [100, 300],
      slow_resource: [500, 1000],
      large_resource: [512 * 1024, 1024 * 1024], // 512KB, 1MB
    };

    const [good, poor] = thresholds[name] || [100, 300];
    
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  private sendMetric(metric: any) {
    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_map: {
          metric_rating: metric.rating,
        },
      });
    }

    // Send to performance monitoring service
    if ((import.meta as any).env?.MODE === 'production') {
      this.sendToMonitoringService(metric);
    }

    // Log in development
    if ((import.meta as any).env?.MODE === 'development') {
      console.log(`⚡ Performance Metric [${metric.name}]:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      });
    }
  }

  private sendToMonitoringService(metric: any) {
    // Send to your monitoring service (e.g., Datadog, New Relic)
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: Date.now(),
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(() => {
      // Silently fail - don't impact user experience
    });
  }

  // Public API for manual performance tracking
  startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordCustomMetric(`custom_timing_${label}`, duration);
    };
  }

  markFeatureUsage(feature: string) {
    this.recordCustomMetric('feature_usage', 1, { feature });
  }

  getMetrics(): Map<string, PerformanceMetric> {
    return new Map(this.metrics);
  }

  getMetricsSummary() {
    const summary = {
      good: 0,
      needsImprovement: 0,
      poor: 0,
      total: this.metrics.size,
    };

    for (const metric of this.metrics.values()) {
      switch (metric.rating) {
        case 'good':
          summary.good++;
          break;
        case 'needs-improvement':
          summary.needsImprovement++;
          break;
        case 'poor':
          summary.poor++;
          break;
      }
    }

    return summary;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hooks for performance tracking
export const usePerformanceTracking = () => {
  return {
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    markFeatureUsage: performanceMonitor.markFeatureUsage.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getSummary: performanceMonitor.getMetricsSummary.bind(performanceMonitor),
  };
};

// HOC for component performance tracking
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  return function WrappedComponent(props: P) {
    const stopTiming = performanceMonitor.startTiming(
      `component_render_${componentName || Component.name}`
    );

    React.useEffect(() => {
      return stopTiming;
    }, []);

    return React.createElement(Component, props);
  };
};
