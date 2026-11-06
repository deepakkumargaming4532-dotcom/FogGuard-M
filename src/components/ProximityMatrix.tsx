'use client';

// FogGuard-M Vehicle-to-Vehicle (V2V) Proximity Monitoring Panel
// Continuously monitors relative separation distances between all heavy haul dumpers.

import React from 'react';
import { Radar, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useMine } from '../context/MineContext';

export const ProximityMatrix: React.FC = () => {
  const { nearestPair, dumpers } = useMine();

  const getHazardLevel = (dist: number) => {
    if (dist < 18) {
      return {
        label: 'CRITICAL COLLISION RISK',
        color: 'text-red-400 bg-red-950/70 border-red-700',
        action: 'AUTOMATIC EMERGENCY BRAKING TRIGGERED',
      };
    }
    if (dist < 35) {
      return {
        label: 'PROXIMITY WARNING',
        color: 'text-amber-400 bg-amber-950/70 border-amber-700',
        action: 'AUDIO/VISUAL WARNING ACTIVE - REDUCE SPEED',
      };
    }
    return {
      label: 'SAFE SPACING',
      color: 'text-emerald-400 bg-emerald-950/70 border-emerald-700',
      action: 'HAUL CORRIDOR CLEAR',
    };
  };

  const currentStatus = nearestPair ? getHazardLevel(nearestPair.distance) : getHazardLevel(100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-200">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
            V2V Proximity Collision Engine
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          ALGORITHM: EUCLIDEAN V2V (SIMULATED)
        </span>
      </div>

      {/* Main Nearest Pair Spotlight */}
      {nearestPair && (
        <div className={`p-3.5 rounded-lg border mb-3 transition-colors ${currentStatus.color}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block">
                  Closest Approaching Vehicles
                </span>
                <span className="text-base font-black font-mono">
                  {nearestPair.d1.id} ↔ {nearestPair.d2.id}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Separation</span>
              <span className="text-2xl font-black font-mono tracking-tight">
                {nearestPair.distance} <span className="text-xs font-normal">meters</span>
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-bold tracking-wide uppercase text-[11px]">{currentStatus.label}</span>
            <span className="font-mono text-[10px] opacity-90">{currentStatus.action}</span>
          </div>
        </div>
      )}

      {/* Safety Threshold Gauge */}
      <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
          <span>Safety Spacing Envelope</span>
          <span className="font-mono text-slate-300">Minimum Legal: 30m</span>
        </div>

        {/* Triple colored safety bar */}
        <div className="grid grid-cols-3 gap-1 h-3 rounded-md overflow-hidden bg-slate-800/70 p-0.5">
          <div className="bg-red-500/80 rounded-sm flex items-center justify-center text-[9px] font-bold text-slate-950 font-mono">
            &lt; 18m Danger
          </div>
          <div className="bg-amber-500/80 rounded-sm flex items-center justify-center text-[9px] font-bold text-slate-950 font-mono">
            18-35m Caution
          </div>
          <div className="bg-emerald-500/80 rounded-sm flex items-center justify-center text-[9px] font-bold text-slate-950 font-mono">
            &gt; 35m Clear
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Collision Assist: <strong className="text-emerald-400 font-mono">ARMED</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Active Nodes: <strong className="text-blue-400 font-mono">{dumpers.length} Dumpers</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
