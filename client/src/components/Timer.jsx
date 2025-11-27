import { useEffect, useState } from 'react';

export default function Timer({ timeRemaining }) {
  const [localTime, setLocalTime] = useState(timeRemaining);

  useEffect(() => {
    setLocalTime(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(localTime / 60);
  const seconds = localTime % 60;

  const isWarning = localTime <= 300; // Last 5 minutes
  const isCritical = localTime <= 60; // Last 1 minute

  return (
    <div
      className={`flex items-center px-4 py-2 rounded-xl shadow-lg transition-all duration-300 ${
        isCritical ? 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse' : isWarning ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
      } text-white`}
    >
      <svg className={`w-6 h-6 mr-2 ${isCritical ? 'animate-wiggle' : ''}`} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-lg font-bold">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isWarning && (
        <span className="ml-2 text-xs animate-pulse">
          {isCritical ? 'HURRY!' : 'Warning'}
        </span>
      )}
    </div>
  );
}
