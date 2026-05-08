import { useRef, useEffect, useCallback } from 'react';

interface UseUnreadTrackerProps {
    id: string;
    read: boolean;
    isActive: boolean;
    onRead: (id: string) => void;
    delay?: number;
}

export const useUnreadTracker = ({ 
    id, 
    read, 
    isActive, 
    onRead, 
    delay = 3000 
}: UseUnreadTrackerProps) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number | null>(null);
    const isIntersecting = useRef(false);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        if (read || timerRef.current || !isIntersecting.current || !isActive || !document.hasFocus()) return;
        
        timerRef.current = window.setTimeout(() => {
            onRead(id);
        }, delay);
    }, [id, read, onRead, isActive, delay]);

    useEffect(() => {
        if (read) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                isIntersecting.current = entry.isIntersecting;
                if (entry.isIntersecting) {
                    startTimer();
                } else {
                    stopTimer();
                }
            },
            { threshold: 0.5 }
        );

        if (itemRef.current) {
            observer.observe(itemRef.current);
        }

        const handleFocusChange = () => {
            if (document.hasFocus() && isActive) {
                startTimer();
            } else {
                stopTimer();
            }
        };

        window.addEventListener('focus', handleFocusChange);
        window.addEventListener('blur', handleFocusChange);
        document.addEventListener('visibilitychange', handleFocusChange);

        return () => {
            observer.disconnect();
            stopTimer();
            window.removeEventListener('focus', handleFocusChange);
            window.removeEventListener('blur', handleFocusChange);
            document.removeEventListener('visibilitychange', handleFocusChange);
        };
    }, [read, startTimer, stopTimer, isActive]);

    return itemRef;
};
