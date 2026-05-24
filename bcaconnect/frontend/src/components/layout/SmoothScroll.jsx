import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    // Désactiver Lenis sur mobile/tablette pour préserver le scroll natif fluide
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    window.lenis = lenis;

    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
