'use client';

// FogGuard-M Top Navigation Bar & System Header
// Clearly displays system branding, active dashboard tab, simulated mode indicator, and presentation controls.

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Play, Pause, AlertTriangle, RotateCcw, Volume2, VolumeX, Radio, HardHat, Compass } from 'lucide-react';
import { useMine } from '../context/MineContext';

interface HeaderProps {
  activeTab: 'control' | 'dumper';
  setActiveTab: (tab: 'control' | 'dumper') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    isSimulating,
    setIsSimulating,
    triggerDemoEmergency,
    resetSimulation,
    audioMuted,
    setAudioMuted,
    nearestPair,
  } = useMine();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isCollisionCritical = nearestPair && nearestPair.distance < 18;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 lg:px-6 py-3 select-none sticky top-0 z-50 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Project Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25 border border-orange-400/40 shrink-0">
            <ShieldAlert className="w-6 h-6 text-slate-950 font-bold" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-100 flex items-center gap-1 font-mono">
                FogGuard<span className="text-amber-400">-M</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Simulated Telemetry
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/80 font-mono">
                NIT Jamshedpur Robotics Comp
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
              <span>Smart Mining Safety &amp; Collision Avoidance System</span>
              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="text-slate-500 hidden md:inline font-mono text-[11px]">Autonomous V2V Radar &amp; Pit Visibility Monitoring</span>
            </p>
          </div>
        </div>

        {/* Dashboard Navigation Switcher */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab('control')}
            className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center gap-2 ${
              activeTab === 'control'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Compass className="w-4 h-4 text-blue-300" />
            <div className="text-left">
              <span className="block text-[10px] uppercase opacity-75 font-mono">Dashboard 1</span>
              <span>Mine Safety Control Center</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('dumper')}
            className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center gap-2 ${
              activeTab === 'dumper'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-1 ring-amber-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <HardHat className="w-4 h-4 text-amber-300" />
            <div className="text-left">
              <span className="block text-[10px] uppercase opacity-75 font-mono">Dashboard 2</span>
              <span>Individual Dumper Safety Cockpit</span>
            </div>
          </button>
        </div>

        {/* Presentation Simulation Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Heartbeat Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{isSimulating ? 'SIM ACTIVE' : 'PAUSED'}</span>
            <span className="text-slate-500 text-[11px] ml-1">{currentTime}</span>
          </div>

          {/* Critical Hazard Alert Tag */}
          {isCollisionCritical && (
            <div className="animate-pulse flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-600/30 border border-red-500 text-red-300 text-xs font-bold font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>COLLISION IMMINENT</span>
            </div>
          )}

          {/* Quick Demo Trigger for Judges */}
          <button
            onClick={triggerDemoEmergency}
            title="Demonstrate immediate vehicle proximity collision hazard to judges"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-700/70 text-red-300 text-xs font-semibold transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Simulate Hazard</span>
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            title={isSimulating ? 'Pause Movement Simulation' : 'Resume Simulation'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Reset */}
          <button
            onClick={resetSimulation}
            title="Reset Telemetry to Initial Positions"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Audio Buzzer Toggle */}
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            title={audioMuted ? 'Unmute Audio Warning Buzzer' : 'Mute Warning Buzzer'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
