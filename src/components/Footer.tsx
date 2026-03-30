import { useState, useEffect } from 'react';
import { type AppState } from '../contexts/types';
import '../styles/Footer.scss';

interface FooterProps {
  appState: AppState;
  easterEggs: string[];
}

export const Footer = ({ appState, easterEggs }: FooterProps) => {
  const [footerText, setFooterText] = useState('');
  const [currentEggIndex, setCurrentEggIndex] = useState(0);

  // Typewriter effect for footer eggs
  useEffect(() => {
    if (appState !== 'READY') {
        setFooterText('');
        return;
    }
    
    let isMounted = true;
    let currentIdx = currentEggIndex;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId: number;

    const type = () => {
        const fullText = easterEggs[currentIdx];
        let typingSpeed = isDeleting ? 50 : 100;
        
        if (isDeleting) {
            const nextText = fullText.substring(0, charIdx - 1);
            if (isMounted) setFooterText(nextText);
            charIdx--;
        } else {
            const nextText = fullText.substring(0, charIdx + 1);
            if (isMounted) setFooterText(nextText);
            charIdx++;
        }

        if (!isDeleting && charIdx === fullText.length) {
            isDeleting = true;
            typingSpeed = 3000; 
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            currentIdx = (currentIdx + 1) % easterEggs.length;
            if (isMounted) setCurrentEggIndex(currentIdx);
            typingSpeed = 500; 
        }

        if (isMounted) {
            timeoutId = window.setTimeout(type, typingSpeed);
        }
    };

    const initialTimeout = window.setTimeout(type, 1000);
    
    return () => {
        isMounted = false;
        window.clearTimeout(initialTimeout);
        window.clearTimeout(timeoutId);
    };
  }, [appState, easterEggs, currentEggIndex]);

  if (appState === 'SPLASH' || appState === 'BOOT' || appState === 'SHUTDOWN') return null;

  return (
    <footer className="footer">
      <div className="footer__easter-eggs">
          {footerText}<span className="footer__cursor"></span>
      </div>
      <div className="footer__copyright">
          <a 
            href="https://github.com/DrizzlyOwl/smokescreen" 
            target="_blank" 
            rel="noopener noreferrer" 
          >
            COPYRIGHT DRIZZLYOWL
          </a>
      </div>
    </footer>
  );
};
