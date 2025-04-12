import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current viewport is mobile sized
 * @param breakpoint Optional parameter to set the mobile breakpoint (default: 1024px)
 * @returns Boolean indicating if the current viewport is mobile sized
 */
export function useMobile(breakpoint: number = 1024): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [breakpoint]);

  const checkIfMobile = () => {
    setIsMobile(window.innerWidth < breakpoint);
  };

  return isMobile;
}
