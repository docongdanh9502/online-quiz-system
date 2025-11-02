import { useEffect } from 'react';

export const usePerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      }

      // Log to analytics in production
      if (process.env.NODE_ENV === 'production' && renderTime > 100) {
        // Send to analytics service
        console.warn(`[Performance] ${componentName} slow render: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
};
