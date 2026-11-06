'use client';

// FogGuard-M Central Simulation Context
// Manages real-time dumper positions, proximity collision detection, and weather telemetry.

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Dumper, WeatherData, ProximityAlert, FogLevel } from '../types';
import { INITIAL_DUMPERS, INITIAL_WEATHER } from '../data/mockData';

interface MineContextType {
  dumpers: Dumper[];
  selectedDumperId: string;
  setSelectedDumperId: (id: string) => void;
  selectedDumper: Dumper;
  weather: WeatherData;
  setFogLevel: (level: FogLevel) => void;
  alerts: ProximityAlert[];
  dismissAlert: (id: string) => void;
  clearAllAlerts: () => void;
  isSimulating: boolean;
  setIsSimulating: (running: boolean) => void;
  triggerDemoEmergency: () => void;
  resetSimulation: () => void;
  nearestPair: { d1: Dumper; d2: Dumper; distance: number } | null;
  audioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
}

const MineContext = createContext<MineContextType | undefined>(undefined);

// 1 map unit = 5 meters (100x100 grid represents 500m x 500m open cast mine block)
const MAP_SCALE_METERS = 5;
const WARNING_DISTANCE_METERS = 35;
const CRITICAL_DISTANCE_METERS = 18;

export const MineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dumpers, setDumpers] = useState<Dumper[]>(INITIAL_DUMPERS);
  const [selectedDumperId, setSelectedDumperId] = useState<string>('D01');
  const [weather, setWeather] = useState<WeatherData>(INITIAL_WEATHER);
  const [alerts, setAlerts] = useState<ProximityAlert[]>([
    {
      id: 'alert-init-1',
      sourceDumperId: 'D01',
      targetDumperId: 'D02',
      distanceMeters: 19.2,
      severity: 'WARNING',
      message: 'Close haul-ramp convergence detected between D01 and D02.',
      timestamp: '08:44:15 AM',
    },
    {
      id: 'alert-init-2',
      sourceDumperId: 'SYSTEM',
      targetDumperId: 'ALL',
      distanceMeters: 45,
      severity: 'CRITICAL',
      message: 'DENSE FOG ALERT: Pit visibility below 50m. FogGuard Radar & Proximity Assist Active.',
      timestamp: '08:43:00 AM',
    },
  ]);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);

  // Selected dumper reference
  const selectedDumper = useMemo(() => {
    return dumpers.find((d) => d.id === selectedDumperId) || dumpers[0];
  }, [dumpers, selectedDumperId]);

  // Compute nearest dumper pair for fleet collision monitoring
  const nearestPair = useMemo(() => {
    let minDistance = Infinity;
    let closestPair: { d1: Dumper; d2: Dumper; distance: number } | null = null;

    for (let i = 0; i < dumpers.length; i++) {
      for (let j = i + 1; j < dumpers.length; j++) {
        const dx = dumpers[i].x - dumpers[j].x;
        const dy = dumpers[i].y - dumpers[j].y;
        const dist = Math.hypot(dx, dy) * MAP_SCALE_METERS;
        if (dist < minDistance) {
          minDistance = dist;
          closestPair = { d1: dumpers[i], d2: dumpers[j], distance: Math.round(dist * 10) / 10 };
        }
      }
    }
    return closestPair;
  }, [dumpers]);

  // Handle fog change simulation
  const setFogLevel = useCallback((level: FogLevel) => {
    let visibility = 600;
    let lux = 650;
    if (level === 'DENSE_FOG') {
      visibility = 45;
      lux = 110;
    } else if (level === 'MODERATE_FOG') {
      visibility = 120;
      lux = 280;
    } else if (level === 'LIGHT_FOG') {
      visibility = 320;
      lux = 450;
    }

    setWeather((prev) => ({
      ...prev,
      fogLevel: level,
      visibilityMeters: visibility,
      ambientLightLux: lux,
      lastUpdated: new Date().toLocaleTimeString(),
    }));

    if (level === 'DENSE_FOG') {
      const fogAlert: ProximityAlert = {
        id: `fog-${Date.now()}`,
        sourceDumperId: 'SYSTEM',
        targetDumperId: 'FLEET',
        distanceMeters: visibility,
        severity: 'CRITICAL',
        message: 'Dense fog alert! Visibility dropped to 45m. Radar safety margin increased.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setAlerts((prev) => [fogAlert, ...prev.slice(0, 19)]);
    }
  }, []);

  // Dismiss an alert
  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Demo shortcut for competition judges: forces D01 and D02 into critical proximity
  const triggerDemoEmergency = useCallback(() => {
    setDumpers((prev) =>
      prev.map((d) => {
        if (d.id === 'D01') {
          return {
            ...d,
            x: 30,
            y: 35,
            heading: 60,
            speed: 24,
            status: 'HAZARD',
            ultrasonicFrontDistance: 11.5,
          };
        }
        if (d.id === 'D02') {
          return {
            ...d,
            x: 31.8,
            y: 36.2,
            heading: 240,
            speed: 21,
            status: 'HAZARD',
            ultrasonicFrontDistance: 11.5,
          };
        }
        return d;
      })
    );

    const emergencyAlert: ProximityAlert = {
      id: `crit-${Date.now()}`,
      sourceDumperId: 'D01',
      targetDumperId: 'D02',
      distanceMeters: 11.5,
      severity: 'CRITICAL',
      message: 'CRITICAL COLLISION IMMINENT: D01 & D02 distance 11.5m! Automatic braking triggered.',
      timestamp: new Date().toLocaleTimeString(),
    };
    setAlerts((prev) => [emergencyAlert, ...prev.slice(0, 19)]);
  }, []);

  const resetSimulation = useCallback(() => {
    setDumpers(INITIAL_DUMPERS);
    setWeather(INITIAL_WEATHER);
  }, []);

  // Real-time animation simulation loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setDumpers((prevDumpers) => {
        // Move active dumpers along simulated haul patterns
        const updated = prevDumpers.map((dumper) => {
          if (dumper.status === 'IDLE' || dumper.speed === 0) {
            return dumper;
          }

          // Gentle movement delta based on heading
          const rad = (dumper.heading * Math.PI) / 180;
          const stepSize = (dumper.speed / 100) * 0.35;
          let newX = dumper.x + Math.cos(rad) * stepSize;
          let newY = dumper.y + Math.sin(rad) * stepSize;
          let newHeading = dumper.heading;

          // Boundary bouncing / turn-around in pit sector (10% to 90%)
          if (newX < 12 || newX > 88) {
            newHeading = (180 - newHeading + 360) % 360;
            newX = Math.max(12, Math.min(88, newX));
          }
          if (newY < 15 || newY > 85) {
            newHeading = (360 - newHeading) % 360;
            newY = Math.max(15, Math.min(85, newY));
          }

          return {
            ...dumper,
            x: Math.round(newX * 100) / 100,
            y: Math.round(newY * 100) / 100,
            heading: Math.round(newHeading),
          };
        });

        // Check pairwise distances and update proximity statuses
        for (let i = 0; i < updated.length; i++) {
          let closestOtherDist = Infinity;
          let closestOtherId = '';

          for (let j = 0; j < updated.length; j++) {
            if (i === j) continue;
            const dx = updated[i].x - updated[j].x;
            const dy = updated[i].y - updated[j].y;
            const distMeters = Math.hypot(dx, dy) * MAP_SCALE_METERS;
            if (distMeters < closestOtherDist) {
              closestOtherDist = distMeters;
              closestOtherId = updated[j].id;
            }
          }

          // Update ultrasonic front distance simulation
          updated[i].ultrasonicFrontDistance = Math.round(closestOtherDist * 10) / 10;

          // Update dumper status based on proximity
          if (closestOtherDist < CRITICAL_DISTANCE_METERS) {
            updated[i].status = 'HAZARD';
          } else if (closestOtherDist < WARNING_DISTANCE_METERS) {
            updated[i].status = 'WARNING';
          } else if (updated[i].speed > 0) {
            updated[i].status = 'ACTIVE';
          }
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <MineContext.Provider
      value={{
        dumpers,
        selectedDumperId,
        setSelectedDumperId,
        selectedDumper,
        weather,
        setFogLevel,
        alerts,
        dismissAlert,
        clearAllAlerts,
        isSimulating,
        setIsSimulating,
        triggerDemoEmergency,
        resetSimulation,
        nearestPair,
        audioMuted,
        setAudioMuted,
      }}
    >
      {children}
    </MineContext.Provider>
  );
};

export const useMine = (): MineContextType => {
  const context = useContext(MineContext);
  if (!context) {
    throw new Error('useMine must be used within a MineProvider');
  }
  return context;
};
