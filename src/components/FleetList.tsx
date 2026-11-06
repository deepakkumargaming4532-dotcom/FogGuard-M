'use client';

// FogGuard-M Fleet Overview Table & Status Indicators
// Displays real-time operational status, payload weight, speed, and proximity status for all 6 dumpers.

import React from 'react';
import { Truck, Activity, ArrowRight, Gauge, Weight, AlertCircle } from 'lucide-react';
import { useMine } from '../context/MineContext';
import { Dumper } from '../types';

interface FleetListProps {
  onSelectDumper: (id: string) => void;
}

export const FleetList: React.FC<FleetListProps> = ({ onSelectDumper }) => {
  const { dumpers, selectedDumperId, setSelectedDumperId } = useMine();

  const getStatusBadge = (status: Dumper['status']) => {
    switch (status) {
      case 'HAZARD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/30 text-red-400 border border-red-600 animate-pulse">HAZARD</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/30 text-amber-400 border border-amber-500">PROX ALERT</span>;
      case 'IDLE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600">IDLE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">OPERATIONAL</span>;
    }
  };

  const handleSelect = (id: string) => {
    setSelectedDumperId(id);
    onSelectDumper(id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-200">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
            Active Haul Fleet (6 Units)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>FLEET READINESS: 100%</span>
        </div>
      </div>

      {/* Grid of Dumpers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dumpers.map((dumper) => {
          const isSelected = dumper.id === selectedDumperId;
          const isConflict = dumper.status === 'HAZARD' || dumper.status === 'WARNING';

          return (
            <div
              key={dumper.id}
              onClick={() => setSelectedDumperId(dumper.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-blue-500 ring-1 ring-blue-500/50 shadow-md'
                  : isConflict
                  ? 'bg-slate-950/80 border-amber-500/50 hover:border-amber-400'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header: ID, Load Status, Health */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center font-mono font-black text-xs ${
                      dumper.loadStatus === 'FULL'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}
                  >
                    {dumper.id}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{dumper.name}</h3>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{dumper.assignedZone}</p>
                  </div>
                </div>
                <div>{getStatusBadge(dumper.status)}</div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-slate-800/80 text-[11px] font-mono">
                {/* Load */}
                <div className="bg-slate-900/60 p-1.5 rounded">
                  <span className="text-[9px] text-slate-500 block uppercase">Load</span>
                  <span
                    className={`font-bold ${
                      dumper.loadStatus === 'FULL' ? 'text-amber-400' : 'text-blue-400'
                    }`}
                  >
                    {dumper.loadStatus}
                  </span>
                </div>

                {/* Speed */}
                <div className="bg-slate-900/60 p-1.5 rounded">
                  <span className="text-[9px] text-slate-500 block uppercase">Speed</span>
                  <span className="font-bold text-slate-200">{dumper.speed} km/h</span>
                </div>

                {/* Radar clearance */}
                <div className="bg-slate-900/60 p-1.5 rounded">
                  <span className="text-[9px] text-slate-500 block uppercase">Clearance</span>
                  <span
                    className={`font-bold ${
                      dumper.ultrasonicFrontDistance < 18
                        ? 'text-red-400 animate-pulse'
                        : dumper.ultrasonicFrontDistance < 35
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {dumper.ultrasonicFrontDistance}m
                  </span>
                </div>
              </div>

              {/* Footer action to jump to Dashboard 2 */}
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  Payload: {dumper.payloadTons} T / 100 T
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(dumper.id);
                  }}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium group"
                >
                  <span>Radar Cockpit</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
