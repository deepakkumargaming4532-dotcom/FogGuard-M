'use client';

// FogGuard-M Main Application Entry Point
// Connects Dashboard 1 (Mine Safety Control Center) and Dashboard 2 (Individual Dumper Safety Cockpit)
// Designed for NIT Jamshedpur Robotics Competition.
// All telemetry and spatial maps are SIMULATED.

import React, { useState, useEffect, useRef } from 'react';
import { MineProvider, useMine } from '../context/MineContext';
import { Header } from '../components/Header';
import { WeatherPanel } from '../components/WeatherPanel';
import { MineMap } from '../components/MineMap';
import { FleetList } from '../components/FleetList';
import { ProximityMatrix } from '../components/ProximityMatrix';
import { AlertsPanel } from '../components/AlertsPanel';
import { DumperDashboard } from '../components/DumperDashboard';
import { ShieldCheck, HardHat, Cpu, Compass, Radio, AlertOctagon, Activity } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<'control' | 'dumper'>('control');
  const { nearestPair, audioMuted, weather } = useMine();
  const lastBeepTime = useRef<number>(0);

  // Synthesized Web Audio API buzzer for critical proximity breaches (< 18m)
  useEffect(() => {
    if (audioMuted) return;
    if (!nearestPair || nearestPair.distance >= 18) return;

    const now = Date.now();
    // Beep at most once every 1.5 seconds so it doesn't overwhelm the user
    if (now - lastBeepTime.current > 1500) {
      lastBeepTime.current = now;
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch {
        // AudioContext policy
      }
    }
  }, [nearestPair, audioMuted]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Global Header with Project Branding & Dashboard Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Dashboard Container */}
      <main className="flex-1 p-3 sm:p-5 max-w-[1720px] w-full mx-auto space-y-4">
        {/* Active Dashboard Title Strip & Quick Metrics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
              {activeTab === 'control' ? <Compass className="w-6 h-6" /> : <HardHat className="w-6 h-6 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-wide text-slate-100 font-mono">
                  {activeTab === 'control' ? 'Mine Safety Control Center' : 'Individual Dumper Safety Cockpit'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  FogGuard-M
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {activeTab === 'control'
                  ? 'Real-Time Spatial Haulage Map • V2V Collision Avoidance • Atmospheric Fog Telemetry'
                  : 'In-Cab Telemetry Heads-Up Display • 360° Ultrasonic Radar • Autonomous Brake Assist'}
              </p>
            </div>
          </div>

          {/* Key System Status Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>FLEET: 6 DUMPERS</span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>V2V ENVELOPE: ARMED</span>
            </div>

            {weather.fogLevel === 'DENSE_FOG' ? (
              <div className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-700 text-red-300 flex items-center gap-2 font-bold animate-pulse">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <span>DENSE FOG ALERT ({weather.visibilityMeters}m)</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>VISIBILITY: {weather.visibilityMeters}m</span>
              </div>
            )}
          </div>
        </div>

        {activeTab === 'control' ? (
          // DASHBOARD 1: MINE SAFETY CONTROL CENTER
          <div className="space-y-4">
            {/* Main Split Grid: Left (Dominant Large Detailed Mine Map) | Right (Weather + V2V Engine + Incident Log) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column (8 cols): Large Detailed Open-Cast Mine Map */}
              <div className="lg:col-span-8 space-y-4">
                <MineMap onSelectDumper={() => setActiveTab('dumper')} />
                {/* Active Fleet Overview Table directly under map */}
                <FleetList onSelectDumper={() => setActiveTab('dumper')} />
              </div>

              {/* Right Column (4 cols): Telemetry Stack */}
              <div className="lg:col-span-4 space-y-4">
                <WeatherPanel />
                <ProximityMatrix />
                <AlertsPanel />
              </div>
            </div>
          </div>
        ) : (
          // DASHBOARD 2: INDIVIDUAL DUMPER SAFETY COCKPIT
          <DumperDashboard />
        )}
      </main>

      {/* 3. Industrial Footer with Competition Attribution and Simulation Disclaimer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-3.5 text-xs text-slate-500 font-mono mt-auto">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-300">FogGuard-M</span>
            <span>— Smart Mining Safety &amp; Collision Avoidance System</span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="text-slate-400">Next.js App Router • TypeScript • Tailwind CSS</span>
          </div>

          <div className="text-[11px] text-slate-400">
            <span>Robotics Competition @ NIT Jamshedpur • </span>
            <span className="text-amber-400 font-bold uppercase">Simulated Mine Model &amp; Telemetry Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <MineProvider>
      <DashboardContent />
    </MineProvider>
  );
}
