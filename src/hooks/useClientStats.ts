import { useState, useEffect } from 'react';

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  addEventListener(type: 'levelchange' | 'chargingchange', listener: (this: BatteryManager, ev: Event) => void): void;
  removeEventListener(type: 'levelchange' | 'chargingchange', listener: (this: BatteryManager, ev: Event) => void): void;
}

interface NetworkInformation extends EventTarget {
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  addEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
  removeEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
}

interface ClientStats {
  batteryLevel: number | null;
  isCharging: boolean | null;
  connectionType: string;
  downlink: number | null;
  gpu: string;
  timezone: string;
}

export const useClientStats = () => {
  const [stats, setStats] = useState<ClientStats>({
    batteryLevel: null,
    isCharging: null,
    connectionType: 'UNKNOWN',
    downlink: null,
    gpu: 'EMULATED_VGA',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  useEffect(() => {
    // 1. Connection Stats
    const nav = navigator as unknown as { 
        connection?: NetworkInformation;
        mozConnection?: NetworkInformation;
        webkitConnection?: NetworkInformation;
        getBattery?: () => Promise<BatteryManager>;
    };
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

    if (conn) {
      updateConnection();
      conn.addEventListener('change', updateConnection);
    }

    // 2. Battery Stats
    let batteryInstance: BatteryManager | null = null;
    
    const updateBattery = (batt: BatteryManager) => {
      setStats(prev => ({
        ...prev,
        batteryLevel: Math.round(batt.level * 100),
        isCharging: batt.charging
      }));
    };

    if (nav.getBattery) {
      nav.getBattery().then((batt: BatteryManager) => {
        batteryInstance = batt;
        updateBattery(batt);
        batt.addEventListener('levelchange', () => updateBattery(batt));
        batt.addEventListener('chargingchange', () => updateBattery(batt));
      });
    }

    // 3. GPU Info
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                // Clean up the string a bit (remove common prefixes)
                const cleanRenderer = renderer.replace(/ANGLE \(|Direct3D11 vs_5_0 ps_5_0\)|Direct3D11/g, '').trim();
                setStats(prev => ({ ...prev, gpu: cleanRenderer.toUpperCase() }));
            }
        }
    } catch { /* GPU info unavailable */ }

    return () => {
      if (conn) conn.removeEventListener('change', updateConnection);
      if (batteryInstance) {
        batteryInstance.removeEventListener('levelchange', () => updateBattery(batteryInstance!));
        batteryInstance.removeEventListener('chargingchange', () => updateBattery(batteryInstance!));
      }
    };
  }, []);

  return stats;
};
