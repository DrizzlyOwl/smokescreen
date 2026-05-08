import React, { useEffect } from 'react';
import '../styles/PauseScreen.scss';

interface PauseScreenProps {
    onResume: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({ onResume }) => {
    useEffect(() => {
        const handleAnyKey = (e: KeyboardEvent) => {
            // Don't trigger on modifiers alone to prevent accidental unpauses when alt-tabbing
            if (e.key === 'Alt' || e.key === 'Control' || e.key === 'Shift' || e.key === 'Meta') return;
            e.preventDefault();
            onResume();
        };

        window.addEventListener('keydown', handleAnyKey);
        return () => window.removeEventListener('keydown', handleAnyKey);
    }, [onResume]);

    return (
        <div className="pause-overlay">
          <div className="pause-overlay__content">
            <div className="pause-overlay__header">*** KERNEL PANIC: SIMULATION PAUSED ***</div>
            <div className="pause-overlay__sub">CORE_DUMP_IN_PROGRESS</div>
            
            <div className="pause-overlay__dump">
              <p>0x00000000  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ................</p>
              <p>0x00000010  53 59 53 54 45 4D 5F 48  41 4C 54 45 44 20 20 20  SYSTEM_HALTED   </p>
              <p>0x00000020  41 57 41 49 54 49 4E 47  5F 52 45 53 55 4D 45 20  AWAITING_RESUME </p>
              <p>0x00000030  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ................</p>
              <br />
              <div className="pause-overlay__registers">
                <div>EAX: 00000000 EBX: 00000000 ECX: 00000000 EDX: 00000000</div>
                <div>ESI: 00000000 EDI: 00000000 EBP: 00000000 ESP: 00000000</div>
                <div>EIP: 00000000 EFLAGS: 00000000</div>
              </div>
              <br />
              <p>Press any key or click resume to continue.</p>
            </div>

            <button 
              className="pause-overlay__resume-btn"
              onClick={onResume}
            >
              [ SYSTEM_RESUME ] <span className="blink">_</span>
            </button>
          </div>
        </div>
    );
};
