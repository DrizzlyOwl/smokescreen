import { useEffect, useRef } from 'react';

/**
 * useInterval - Custom hook that sets up an interval and cleans it up on unmount.
 * It uses a ref for the callback to avoid re-initializing the interval when the callback changes.
 * 
 * @param callback - Function to be called every `delay` ms
 * @param delay - Delay in ms. If null, the interval is paused.
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

/**
 * useTimeout - Custom hook that sets up a timeout and cleans it up on unmount.
 * 
 * @param callback - Function to be called after `delay` ms
 * @param delay - Delay in ms. If null, the timeout is cancelled.
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setTimeout(() => savedCallback.current(), delay);
      return () => clearTimeout(id);
    }
  }, [delay]);
}
