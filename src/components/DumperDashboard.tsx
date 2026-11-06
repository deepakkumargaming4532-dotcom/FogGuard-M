'use client';

// FogGuard-M Dashboard 2: Individual Dumper Cockpit & Ultrasonic Radar
// High-tech in-cab heads-up display featuring 360-degree ultrasonic collision radar, telemetry, and obstacle indicators.

import React, { useState, useMemo } from 'react';
import {
  Truck,
  Radar,
  AlertTriangle,
  ShieldAlert,
  Gauge,
  Weight,
  BatteryCharging,
  Fuel,
  Radio,
  Wifi,
  ChevronRight,
  Eye,
  Sliders,
} from 'lucide-react';
import { useMine } from '../context/MineContext';
import { STATIC_OBSTACLES } from '../data/mockData';

export const DumperDashboard: React.FC = () => {
  const {
    dumpers,
    selectedDumperId,
    setSelectedDumperId,
    selectedDumper,
    weather,
  } = useMine();

  // Interactive slider override to allow presenter to simulate a sudden near obstacle during presentation
  const [manualDistanceOverride, setManualDistanceOverride] = useState<number | null>(null);

  // Effective front distance (either live simulated or manually overridden for demo)
  const currentFrontDistance = manualDistanceOverride !== null ? manualDistanceOverride : selectedDumper.ultrasonicFrontDistance;

  // Collision danger calculations
  const isCriticalCollision = currentFrontDistance < 18;
  const isWarningCollision = currentFrontDistance >= 18 && currentFrontDistance < 35;

  // Compute other dumpers relative to the selected dumper
  const MAP_SCALE_METERS = 5;
  const nearbyDumpers = useMemo(() => {
    return dumpers
      .filter((d) => d.id !== selectedDumper.id)
      .map((d) => {
        const dx = d.x - selectedDumper.x;
        const dy = d.y - selectedDumper.y;
        const dist = Math.hypot(dx, dy) * MAP_SCALE_METERS;
        // Calculate angle relative to dumper's heading
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (angle < 0) angle += 360;
        return {
          dumper: d,
          distance: Math.round(dist * 10) / 10,
          angle: Math.round(angle),
        };
      })
      .filter((item) => item.distance <= 75) // within radar range
      .sort((a, b) => a.distance - b.distance);
  }, [dumpers, selectedDumper]);

  return (
    <div className="space-y-4">
      {/* 1. Dumper Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-100 uppercase block font-mono">
                Individual Dumper Safety Cockpit — Fleet Unit Selector
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                FogGuard-M • Smart Mining Safety &amp; Collision Avoidance System
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            Active Cockpit: <strong className="text-amber-400">{selectedDumper.id}</strong> ({selectedDumper.name})
          </span>
        </div>

        {/* 6 Dumpers Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {dumpers.map((d) => {
            const isSelected = d.id === selectedDumperId;
            const isConflict = d.status === 'HAZARD' || d.status === 'WARNING';

            return (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedDumperId(d.id);
                  setManualDistanceOverride(null);
                }}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/40 text-white shadow'
                    : isConflict
                    ? 'bg-red-950/40 border-red-800 text-slate-300 hover:border-red-600'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-black text-sm text-slate-100">{d.id}</span>
                  <span
                    className={`px-1 rounded text-[8px] font-bold uppercase ${
                      d.loadStatus === 'FULL'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-blue-400 text-slate-950'
                    }`}
                  >
                    {d.loadStatus}
                  </span>
                </div>
                <div className="text-[10px] font-mono flex items-center justify-between text-slate-400">
                  <span>{d.speed} km/h</span>
                  <span className={d.ultrasonicFrontDistance < 20 ? 'text-red-400 font-bold' : ''}>
                    {d.ultrasonicFrontDistance}m
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cockpit Emergency Alert HUD Banner */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg transition-colors ${
          isCriticalCollision
            ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse'
            : isWarningCollision
            ? 'bg-amber-950/80 border-amber-500 text-amber-200'
            : 'bg-emerald-950/50 border-emerald-600 text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg ${
              isCriticalCollision
                ? 'bg-red-600 text-white'
                : isWarningCollision
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black tracking-wider uppercase text-sm sm:text-base font-mono">
              {isCriticalCollision
                ? 'CRITICAL PROXIMITY ALERT — AUTOMATIC BRAKING ACTIVE'
                : isWarningCollision
                ? 'CAUTION: CONVERGING TRAFFIC AHEAD — MAINTAIN SPACING'
                : 'COLLISION AVOIDANCE RADAR: ALL SECTORS CLEAR'}
            </h3>
            <p className="text-xs opacity-90 mt-0.5">
              {isCriticalCollision
                ? `Front clearance critically low (${currentFrontDistance}m). Autonomous safety envelope triggered.`
                : isWarningCollision
                ? `Vehicle or obstacle within ${currentFrontDistance}m. Operator alert sounded.`
                : 'Forward haul corridor nominal. Ultrasonic transducers operating normally.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono text-xs">
          <span className="px-3 py-1 rounded-md bg-slate-950/80 border border-slate-700/80 font-bold">
            CLEARANCE: <span className="text-amber-400">{currentFrontDistance}m</span>
          </span>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Radar on Left, Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Ultrasonic / LiDAR Radar Screen (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold tracking-wide text-slate-100 uppercase">
                360° Ultrasonic &amp; Fog Radar Scope
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              RADAR SWEEP: 50m RANGE (SIMULATED)
            </span>
          </div>

          {/* Circular Radar Visualizer Canvas Container */}
          <div className="relative aspect-square max-h-[460px] mx-auto w-full max-w-[460px] flex items-center justify-center p-2 select-none">
            {/* SVG Radar Graticule and Sweep */}
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                {/* Sweep gradient */}
                <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </radialGradient>
              </defs>

              {/* Radar background circle */}
              <circle cx="200" cy="200" r="180" fill="#080e1a" stroke="#1e293b" strokeWidth="2" />

              {/* Concentric Range Rings (10m, 20m, 30m, 40m, 50m) */}
              <circle cx="200" cy="200" r="36" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
              <text x="204" y="168" fill="#ef4444" fontSize="9" fontFamily="monospace">10m CRITICAL</text>

              <circle cx="200" cy="200" r="72" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" opacity="0.7" />
              <text x="204" y="132" fill="#f59e0b" fontSize="9" fontFamily="monospace">20m CAUTION</text>

              <circle cx="200" cy="200" r="108" fill="none" stroke="#334155" strokeWidth="1" opacity="0.6" />
              <text x="204" y="96" fill="#64748b" fontSize="9" fontFamily="monospace">30m</text>

              <circle cx="200" cy="200" r="144" fill="none" stroke="#334155" strokeWidth="1" opacity="0.6" />
              <text x="204" y="60" fill="#64748b" fontSize="9" fontFamily="monospace">40m</text>

              <circle cx="200" cy="200" r="180" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.8" />
              <text x="204" y="26" fill="#3b82f6" fontSize="9" fontFamily="monospace">50m MAXIMUM</text>

              {/* Crosshair Axes (0°, 90°, 180°, 270°) */}
              <line x1="200" y1="20" x2="200" y2="380" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20" y1="200" x2="380" y2="200" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

              {/* Heading Indicators */}
              <text x="200" y="14" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">FRONT 0°</text>
              <text x="388" y="204" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="start" fontFamily="monospace">90°</text>
              <text x="200" y="396" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">REAR 180°</text>
              <text x="12" y="204" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end" fontFamily="monospace">270°</text>

              {/* Radar Rotating Scan Beam */}
              <g className="origin-center animate-[spin_4s_linear_infinite]">
                <line x1="200" y1="200" x2="200" y2="20" stroke="#10b981" strokeWidth="2" opacity="0.9" />
                {/* Sector cone shadow */}
                <path d="M 200 200 L 200 20 A 180 180 0 0 1 327 73 Z" fill="url(#radarSweep)" opacity="0.4" />
              </g>

              {/* Center Dumper Silhouette */}
              <g transform="translate(200, 200)">
                {/* Front Wheels */}
                <rect x="-18" y="-22" width="5" height="12" rx="1.5" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
                <rect x="13" y="-22" width="5" height="12" rx="1.5" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
                {/* Rear Dual Wheels */}
                <rect x="-19" y="8" width="6" height="14" rx="1.5" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
                <rect x="13" y="8" width="6" height="14" rx="1.5" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
                {/* Main Chassis */}
                <rect x="-13" y="-24" width="26" height="48" rx="3" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
                {/* Radiator Bumper */}
                <rect x="-10" y="-26" width="20" height="3" rx="1" fill="#475569" />
                {/* Left Cab */}
                <rect x="-11" y="-21" width="9" height="11" rx="1.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />
                <rect x="-10" y="-20" width="7" height="3" rx="0.5" fill="#e0f2fe" />
                {/* Dump Bed */}
                <rect
                  x="-11"
                  y="-8"
                  width="22"
                  height="28"
                  rx="2"
                  fill={selectedDumper.loadStatus === 'FULL' ? '#b45309' : '#0f172a'}
                  stroke={selectedDumper.loadStatus === 'FULL' ? '#f59e0b' : '#334155'}
                  strokeWidth="1"
                />
                {selectedDumper.loadStatus === 'FULL' && (
                  <ellipse cx="0" cy="6" rx="7" ry="8" fill="#f59e0b" />
                )}
                <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
              </g>

              {/* Render Detected Nearby Vehicles on Radar */}
              {nearbyDumpers.map((item) => {
                // Scale distance (0-50m maps to 0-180px radius)
                const r = Math.min(180, (item.distance / 50) * 180);
                // Angle relative to front (item.angle in deg)
                const rad = ((item.angle - 90) * Math.PI) / 180;
                const bx = 200 + r * Math.cos(rad);
                const by = 200 + r * Math.sin(rad);
                const isThreat = item.distance < 20;

                return (
                  <g key={item.dumper.id} transform={`translate(${bx}, ${by})`}>
                    {/* Threat ping ring */}
                    {isThreat && (
                      <circle cx="0" cy="0" r="14" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" />
                    )}
                    <circle cx="0" cy="0" r="7" fill={isThreat ? '#ef4444' : '#f59e0b'} stroke="#ffffff" strokeWidth="1.5" />
                    <rect x="10" y="-12" width="54" height="24" rx="3" fill="#0f172a" stroke={isThreat ? '#ef4444' : '#f59e0b'} strokeWidth="1" />
                    <text x="14" y="-2" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      {item.dumper.id}
                    </text>
                    <text x="14" y="8" fill={isThreat ? '#fca5a5' : '#fde68a'} fontSize="8" fontFamily="monospace">
                      {item.distance}m
                    </text>
                  </g>
                );
              })}

              {/* Render Static Obstacles on Radar */}
              {STATIC_OBSTACLES.map((obs) => {
                const r = Math.min(180, (obs.distanceMeters / 50) * 180);
                const rad = ((obs.angleDegrees - 90) * Math.PI) / 180;
                const bx = 200 + r * Math.cos(rad);
                const by = 200 + r * Math.sin(rad);

                return (
                  <g key={obs.id} transform={`translate(${bx}, ${by})`}>
                    <polygon points="0,-6 6,6 -6,6" fill="#94a3b8" stroke="#ffffff" strokeWidth="1" />
                    <rect x="8" y="-10" width="60" height="20" rx="3" fill="#0f172a" stroke="#64748b" strokeWidth="0.75" />
                    <text x="11" y="2" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                      {obs.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Sensor readings bar at bottom of radar */}
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800 text-xs font-mono">
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Front Ultrasonic Transducer</span>
                <span className="text-sm font-black text-slate-200">Sector 350° - 010°</span>
              </div>
              <span
                className={`text-base font-black px-2 py-0.5 rounded ${
                  currentFrontDistance < 18
                    ? 'bg-red-500/20 text-red-400 border border-red-500'
                    : currentFrontDistance < 35
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                }`}
              >
                {currentFrontDistance}m
              </span>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Rear Ultrasonic Sensor</span>
                <span className="text-sm font-black text-slate-200">Sector 170° - 190°</span>
              </div>
              <span className="text-base font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500 px-2 py-0.5 rounded">
                {selectedDumper.ultrasonicRearDistance}m
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Dumper Telemetry, Obstacle List & Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Dumper Specs Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-200">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-400" />
                Vehicle Telemetry HUD
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                TELEMETRY LIVE
              </span>
            </div>

            {/* Speed & Load Dual Big Displays */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Speed */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Ground Speed</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black font-mono text-slate-100">{selectedDumper.speed}</span>
                  <span className="text-xs text-slate-400 font-mono">km/h</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (selectedDumper.speed / 40) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Payload & Load Status */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Bed Status</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      selectedDumper.loadStatus === 'FULL'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-blue-400 text-slate-950'
                    }`}
                  >
                    {selectedDumper.loadStatus}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black font-mono text-slate-100">{selectedDumper.payloadTons}</span>
                  <span className="text-xs text-slate-400 font-mono">/ {selectedDumper.maxCapacityTons} T</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full ${
                      selectedDumper.loadStatus === 'FULL' ? 'bg-amber-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${(selectedDumper.payloadTons / selectedDumper.maxCapacityTons) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Operator & Assigned Haul Route */}
            <div className="space-y-2 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Zone:</span>
                <span className="text-slate-200 font-bold">{selectedDumper.assignedZone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Heading &amp; Bearing:</span>
                <span className="text-slate-200 font-bold">{selectedDumper.heading}° (Compass)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Radio Dispatch:</span>
                <span className="text-slate-200 font-bold">VHF Channel 07</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Demo Driver:</span>
                <span className="text-slate-200 font-bold">{selectedDumper.operator}</span>
              </div>
            </div>

            {/* Energy and Fuel Bars */}
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    Diesel
                  </span>
                  <span className="font-mono font-bold text-slate-200">{selectedDumper.fuelPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${selectedDumper.fuelPercent}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    Telemetry Batt
                  </span>
                  <span className="font-mono font-bold text-slate-200">{selectedDumper.batteryPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${selectedDumper.batteryPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Radar Target / Obstacle Track List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-200">
            <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase mb-2 pb-2 border-b border-slate-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              Detected Targets Within Radar Envelope
            </h3>

            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar text-xs">
              {/* Nearby Dumpers */}
              {nearbyDumpers.map((item) => (
                <div
                  key={item.dumper.id}
                  className={`p-2 rounded-lg border flex items-center justify-between ${
                    item.distance < 18
                      ? 'bg-red-950/50 border-red-800 text-red-200 animate-pulse'
                      : item.distance < 35
                      ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <span className="font-mono font-bold">{item.dumper.id}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({item.dumper.assignedZone})</span>
                    </div>
                  </div>
                  <div className="font-mono text-right">
                    <span className="font-bold text-amber-400">{item.distance}m</span>
                    <span className="text-[10px] text-slate-400 block">{item.angle}° relative</span>
                  </div>
                </div>
              ))}

              {/* Static Obstacles */}
              {STATIC_OBSTACLES.map((obs) => (
                <div
                  key={obs.id}
                  className="p-2 rounded-lg border bg-slate-950/40 border-slate-800 text-slate-400 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm bg-slate-400"></div>
                    <span className="font-mono text-slate-300">{obs.label}</span>
                  </div>
                  <div className="font-mono text-right">
                    <span>{obs.distanceMeters}m</span>
                    <span className="text-[10px] text-slate-500 block">{obs.angleDegrees}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Interactive Slider for Presentation Demo */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg text-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Live Demo Obstacle Distance Test
              </span>
              <span className="text-[10px] font-mono text-slate-500">Judges Interactive Test</span>
            </div>

            <p className="text-[11px] text-slate-400 mb-2">
              Slide to simulate a dumper or obstacle moving in front of {selectedDumper.id} in dense fog:
            </p>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="60"
                value={currentFrontDistance}
                onChange={(e) => setManualDistanceOverride(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-xs font-black text-amber-400 min-w-[45px] text-right">
                {currentFrontDistance}m
              </span>
            </div>

            {manualDistanceOverride !== null && (
              <button
                onClick={() => setManualDistanceOverride(null)}
                className="text-[10px] text-blue-400 hover:text-blue-300 underline mt-1.5 font-mono"
              >
                Reset to automatic sensor telemetry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
