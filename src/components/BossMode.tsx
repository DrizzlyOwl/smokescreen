import { useState, useEffect } from 'react';

export const BossMode = ({ active }: { active: boolean }) => {
  const [progress, setTotalProgress] = useState(14);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setTotalProgress(prev => (prev < 99 ? prev + Math.random() * 0.1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#fff',
      cursor: 'none'
    }}>
      <div style={{ width: '300px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Centered Apple Logo */}
        <svg 
            width="100" 
            height="100" 
            viewBox="0 0 1024 1024" 
            fill="#fff" 
            style={{ marginBottom: '60px', opacity: 0.9 }}
        >
            <path d="M713.216 432.448c-1.408-81.92 67.008-121.344 69.824-123.328-38.016-55.424-97.024-63.04-117.824-63.872-49.856-5.056-97.472 29.376-122.816 29.376-25.28 0-63.872-28.8-105.344-28.032-54.464 0.832-104.448 31.744-132.416 80.32-56.32 97.792-14.4 242.432 40.448 321.6 26.88 38.72 58.816 82.176 100.8 80.576 40.448-1.6 55.68-26.048 104.448-26.048 48.832 0 62.656 26.048 105.344 25.216 43.52-0.832 71.424-39.424 98.048-78.336 30.72-44.928 43.328-88.448 44.032-90.624-0.96-0.384-84.672-32.448-85.504-128.896zM596.288 314.176c22.336-27.072 37.448-64.704 33.344-102.208-32.256 1.28-71.232 21.44-94.336 48.448-20.736 24.064-38.848 62.4-33.984 98.944 35.84 2.816 72.64-18.112 94.976-45.184z" />
        </svg>

        <div style={{
          width: '100%',
          height: '4px',
          background: '#333',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: '#fff',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{ fontSize: '13px', fontWeight: 400, opacity: 0.8, letterSpacing: '0.5px' }}>
          Installing system updates...<br />
          About {Math.ceil((100 - progress) * 0.5)} minutes remaining
        </div>
      </div>
    </div>
  );
};
