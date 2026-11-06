'use client';

// FogGuard-M Weather & Fog Telemetry Panel
// Monitors open-pit atmospheric conditions and visibility ranges to drive adaptive collision thresholds.

import React from 'react';
import { CloudFog, Eye, Droplets, Thermometer, Wind, Sun, Info } from 'lucide-react';
import { useMine } from '../context/MineContext';
import { FogLevel } from '../types';

export const WeatherPanel: React.FC = () => {
  const { weather, setFogLevel } = useMine();

  const getVisibilityStatus = (meters: number) => {
    if (meters < 50) return { label: 'CRITICAL LOW', color: 'text-red-400 bg-red-950/60 border-red-800' };
    if (meters < 150) return { label: 'HAZARDOUS', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
    if (meters < 400) return { label: 'MODERATE', color: 'text-yellow-400 bg-yellow-950/60 border-yellow-800' };
    return { label: 'OPTIMAL', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
  };

  const status = getVisibilityStatus(weather.visibilityMeters);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-200">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <CloudFog className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
            Weather &amp; Fog Telemetry
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>STATION #04 (SIMULATED)</span>
        </div>
      </div>

      {/* Main Visibility Spotlight */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-700/40">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Mine Pit Optical Visibility</p>
              <p className="text-2xl font-black text-slate-100 font-mono tracking-tight">
                {weather.visibilityMeters} <span className="text-sm font-normal text-slate-400">meters</span>
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded text-xs font-bold border uppercase tracking-wider ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Progress bar visualizer for visibility */}
        <div className="mt-2.5">
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                weather.visibilityMeters < 50
                  ? 'bg-red-500'
                  : weather.visibilityMeters < 150
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (weather.visibilityMeters / 600) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>0m (Zero Sight)</span>
            <span>200m (Warning)</span>
            <span>600m+ (Clear)</span>
          </div>
        </div>
      </div>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        {/* Humidity */}
        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2.5">
          <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Relative Humidity</span>
            <span className="font-mono font-bold text-slate-200">{weather.humidityPercent}%</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2.5">
          <Thermometer className="w-4 h-4 text-orange-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Pit Temperature</span>
            <span className="font-mono font-bold text-slate-200">{weather.temperatureC} °C</span>
          </div>
        </div>

        {/* Ambient Light Lux */}
        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2.5">
          <Sun className="w-4 h-4 text-yellow-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Ambient Illumination</span>
            <span className="font-mono font-bold text-slate-200">{weather.ambientLightLux} Lux</span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2.5">
          <Wind className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Surface Wind</span>
            <span className="font-mono font-bold text-slate-200">{weather.windSpeedKmh} km/h</span>
          </div>
        </div>
      </div>

      {/* Interactive Fog Simulator Toggle (Designed for Presentation Demo) */}
      <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 uppercase tracking-wider">
            <Info className="w-3 h-3 text-amber-400 inline" />
            Simulate Weather Scenario:
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Demo Control</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => setFogLevel('CLEAR')}
            className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
              weather.fogLevel === 'CLEAR'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Clear Sight
          </button>
          <button
            onClick={() => setFogLevel('MODERATE_FOG')}
            className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
              weather.fogLevel === 'MODERATE_FOG'
                ? 'bg-amber-600 text-white font-bold shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Mod. Fog
          </button>
          <button
            onClick={() => setFogLevel('DENSE_FOG')}
            className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
              weather.fogLevel === 'DENSE_FOG'
                ? 'bg-red-600 text-white font-bold shadow animate-pulse'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Dense Fog
          </button>
        </div>
      </div>
    </div>
  );
};
