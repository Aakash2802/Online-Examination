import { useEffect, useState } from 'react';

const COLORS = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

export default function Confetti({ duration = 3000, pieces = 100 }) {
  const [confetti, setConfetti] = useState([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Generate confetti pieces
    const confettiPieces = Array.from({ length: pieces }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 2,
      size: Math.random() * 10 + 5,
      shape: Math.random() > 0.5 ? 'square' : 'circle',
    }));
    setConfetti(confettiPieces);

    // Hide confetti after duration
    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, pieces]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            borderRadius: piece.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
