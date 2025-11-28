import { useEffect, useState, useRef } from 'react';

export default function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  decimals = 0,
  className = ''
}) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smooth animation (ease-out cubic)
      const easeOutCubic = 1 - Math.pow(1 - percentage, 3);

      const currentCount = easeOutCubic * end;
      setCount(currentCount);

      if (percentage < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };

    countRef.current = requestAnimationFrame(animate);

    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current);
      }
    };
  }, [end, duration]);

  const displayValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count);

  return (
    <span className={className}>
      {displayValue}{suffix}
    </span>
  );
}
