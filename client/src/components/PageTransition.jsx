import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('page-enter');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('page-exit');

      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('page-enter');
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div className={transitionStage}>
      {children}
    </div>
  );
}
