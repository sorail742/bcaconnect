import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // On scrolle tout en haut immédiatement
    window.scrollTo(0, 0);
    
    // Si Lenis est utilisé (globalement), on peut aussi essayer de forcer Lenis à scroller en haut
    if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
