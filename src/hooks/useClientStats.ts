import { useState, useEffect, useRef } from 'react';

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  addEventListener(type: 'levelchange' | 'chargingchange', listener: (this: BatteryManager, ev: Event) => void): void;
  removeEventListener(type: 'levelchange' | 'chargingchange', listener: (this: BatteryManager, ev: Event) => void): void;
}

interface ClientStats {
  batteryLevel: number | null;
  isCharging: boolean | null;
  connectionType: string;
  downlink: number | null;
  gpu: string;
  timezone: string;
  fps: number;
}

interface NetworkInformation extends EventTarget {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  addEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
  removeEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
}

interface NavigatorWithExtras extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  getBattery?: () => Promise<BatteryManager>;
}

export const useClientStats = () => {
  const [stats, setStats] = useState<ClientStats>({
    batteryLevel: null,
    isCharging: null,
    connectionType: 'UNKNOWN',
    downlink: null,
    gpu: 'EMULATED_VGA',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    fps: 60
  });

  const batteryRef = useRef<BatteryManager | null>(null);

  // 1. Core Info (GPU, Timezone)
  useEffect(() => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                const cleanRenderer = renderer.replace(/ANGLE \(|Direct3D11 vs_5_0 ps_5_0\)|Direct3D11/g, '').trim();
                setStats(prev => ({ ...prev, gpu: cleanRenderer.toUpperCase() }));
            }
        }
    } catch { /* GPU info unavailable */ }
  }, []);

  // 2. Network & Battery
  useEffect(() => {
    const nav = navigator as NavigatorWithExtras;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    const updateConnection = () => {
      if (conn) {
        setStats(prev => ({
          ...prev,
          connectionType: (conn.type || conn.effectiveType || 'UNKNOWN').toUpperCase(),
          downlink: conn.downlink || null
        }));
      }
    };

    const handleBatteryChange = (e: Event) => {
        const batt = e.target as BatteryManager;
        setStats(prev => ({
            ...prev,
            batteryLevel: Math.round(batt.level * 100),
            isCharging: batt.charging
        }));
    };

    if (conn) {
      updateConnection();
      conn.addEventListener('change', updateConnection);
    }

    if (nav.getBattery) {
      nav.getBattery().then((batt: BatteryManager) => {
        batteryRef.current = batt;
        setStats(prev => ({
            ...prev,
            batteryLevel: Math.round(batt.level * 100),
            isCharging: batt.charging
        }));
        batt.addEventListener('levelchange', handleBatteryChange);
        batt.addEventListener('chargingchange', handleBatteryChange);
      });
    }

    return () => {
      if (conn) conn.removeEventListener('change', updateConnection);
      if (batteryRef.current) {
        batteryRef.current.removeEventListener('levelchange', handleBatteryChange);
        batteryRef.current.removeEventListener('chargingchange', handleBatteryChange);
      }
    };
  }, []);

  // 3. FPS Counter (Isolated & Improved)
  useEffect(() => {
    let frames = 0;
    let prevTime = performance.now();
    let rafId: number;

    const loop = (time: number) => {
      frames++;
      if (time >= prevTime + 1000) {
        const calculatedFps = Math.round((frames * 1000) / (time - prevTime));
        setStats(s => ({ ...s, fps: calculatedFps }));
        frames = 0;
        prevTime = time;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return stats;
};
