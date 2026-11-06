'use client';

// FogGuard-M Detailed Open-Cast Mining Spatial Map & Professional Dumper Indicators
// CAD/GIS SCADA Control-Room Visualizer for NIT Jamshedpur Robotics Competition
// Note: Simulated terrain and vehicle telemetry for competition presentation.

import React, { useState } from 'react';
import { Layers, AlertTriangle, Compass, Eye, ShieldAlert, Maximize2, Minimize2, ZoomIn, Info } from 'lucide-react';
import { useMine } from '../context/MineContext';
import { Dumper } from '../types';

interface MineMapProps {
  onSelectDumper?: (id: string) => void;
}

export const MineMap: React.FC<MineMapProps> = ({ onSelectDumper }) => {
  const { dumpers, selectedDumperId, setSelectedDumperId, weather } = useMine();
  const [mapMode, setMapMode] = useState<'cad' | 'topo'>('cad');
  const [showContours, setShowContours] = useState<boolean>(true);

  // Proximity collision vectors (<35m Warning, <18m Critical)
  const MAP_SCALE_METERS = 5;
  const proximityVectors: {
    d1: Dumper;
    d2: Dumper;
    distMeters: number;
    isCritical: boolean;
  }[] = [];

  for (let i = 0; i < dumpers.length; i++) {
    for (let j = i + 1; j < dumpers.length; j++) {
      const dx = dumpers[i].x - dumpers[j].x;
      const dy = dumpers[i].y - dumpers[j].y;
      const dist = Math.hypot(dx, dy) * MAP_SCALE_METERS;
      if (dist < 35) {
        proximityVectors.push({
          d1: dumpers[i],
          d2: dumpers[j],
          distMeters: Math.round(dist * 10) / 10,
          isCritical: dist < 18,
        });
      }
    }
  }

  const handleDumperClick = (id: string) => {
    setSelectedDumperId(id);
    if (onSelectDumper) {
      onSelectDumper(id);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* 1. Control Room Map Header & SCADA Toolbar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-wider text-slate-100 uppercase font-mono">
                Open-Cast Pit Spatial Map (500m × 500m Surface Sector)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                CAD / GIS SCADA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              COORDINATES: 22°47&apos;30&quot;N, 86°12&apos;15&quot;E • DATUM: WGS84 • BENCHES: RL +120m to +240m
            </p>
          </div>
        </div>

        {/* Map Toolbar Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowContours(!showContours)}
            className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
              showContours
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Contours: {showContours ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setMapMode(mapMode === 'cad' ? 'topo' : 'cad')}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] transition-colors"
          >
            Layer: {mapMode.toUpperCase()}
          </button>

          {/* Active fleet count */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>6/6 DUMPERS TRACKED</span>
          </div>
        </div>
      </div>

      {/* 2. Main Map Graphic Canvas Area (Dominant high-detail vector viewport) */}
      <div className="relative w-full h-[580px] sm:h-[640px] lg:h-[700px] bg-[#070b13] overflow-hidden select-none">
        {/* SVG Detailed Open-Cast Mine Map */}
        <svg
          viewBox="0 0 1000 700"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Precision GIS Grid Pattern */}
            <pattern id="gisGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#162235" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="1" fill="#293b54" />
            </pattern>

            {/* Topographic Bench Pattern / Slope Hatching */}
            <pattern id="hatchBench" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#1a2b42" strokeWidth="1" />
            </pattern>

            {/* Haul Road Texture */}
            <pattern id="roadTexture" width="20" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="10" x2="20" y2="10" stroke="#172439" strokeWidth="1" strokeDasharray="4 4" />
            </pattern>

            {/* Overburden Waste Rock texture */}
            <pattern id="wasteRock" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" fill="#2d2218" />
              <circle cx="9" cy="9" r="1.2" fill="#3b2b1d" />
            </pattern>

            {/* Glowing filter for hazard lines */}
            <filter id="hazardGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background GIS Grid */}
          <rect width="1000" height="700" fill="#070c16" />
          <rect width="1000" height="700" fill="url(#gisGrid)" />

          {/* Surrounding Mining Concession Lease Boundary Line */}
          <rect
            x="20"
            y="20"
            width="960"
            height="660"
            fill="none"
            stroke="#1e324a"
            strokeWidth="1.5"
            strokeDasharray="10 5"
          />
          <text x="35" y="42" fill="#334f70" fontSize="10" fontFamily="monospace" letterSpacing="2">
            LEGAL MINING LEASE BOUNDARY (SECTOR B-3) • SAFETY BUFFER ZONE
          </text>

          {/* ========================================================
              MINING AREA INFRASTRUCTURE ZONES
              ======================================================== */}

          {/* Zone 1: Waste Rock & Overburden Dump Yard (Southeast) */}
          <path
            d="M 620 440 Q 750 420 890 460 Q 940 560 880 640 Q 720 660 630 610 Z"
            fill="#15120e"
            stroke="#452e18"
            strokeWidth="2"
          />
          <path
            d="M 640 460 Q 740 440 860 480 Q 900 550 850 610 Q 720 630 650 590 Z"
            fill="url(#wasteRock)"
            stroke="#634324"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          <text x="760" y="550" fill="#a77747" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            WASTE OVERBURDEN DUMP YARD
          </text>
          <text x="760" y="568" fill="#714e2c" fontSize="10" fontFamily="monospace" textAnchor="middle">
            (Crest Berm Elev. RL +260m)
          </text>

          {/* Zone 2: Primary Gyratory Crusher & Overland Conveyor (Northeast) */}
          <g transform="translate(620, 70)">
            {/* Plant Foundation Pad */}
            <rect x="0" y="0" width="280" height="150" rx="8" fill="#0e1724" stroke="#253a56" strokeWidth="1.5" />
            <rect x="15" y="15" width="90" height="70" rx="4" fill="#132032" stroke="#3b82f6" strokeWidth="1.2" />
            <text x="60" y="46" fill="#60a5fa" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              PRIMARY CRUSHER
            </text>
            <text x="60" y="62" fill="#3b82f6" fontSize="9" fontFamily="monospace" textAnchor="middle">
              (Gyratory 60&quot;×89&quot;)
            </text>

            {/* Dump Hopper Feed Chute */}
            <polygon points="115,30 160,20 160,80 115,70" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x="138" y="54" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
              HOPPER
            </text>

            {/* Overland Conveyor Trunk Line */}
            <line x1="160" y1="50" x2="265" y2="50" stroke="#f59e0b" strokeWidth="5" strokeDasharray="3 3" />
            <text x="215" y="42" fill="#fbbf24" fontSize="9" fontFamily="monospace" textAnchor="middle">
              CONVEYOR #01
            </text>

            {/* Sizing & Surge Stockpile */}
            <circle cx="215" cy="105" r="30" fill="#182334" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
            <text x="215" y="108" fill="#7dd3fc" fontSize="9" fontFamily="monospace" textAnchor="middle">
              ORE STOCKPILE
            </text>
          </g>

          {/* Zone 3: Heavy Equipment Workshop & Fuel Depot (South Central) */}
          <g transform="translate(400, 520)">
            <rect x="0" y="0" width="180" height="120" rx="6" fill="#0c1420" stroke="#1f334a" strokeWidth="1.5" />
            <rect x="15" y="20" width="70" height="40" fill="#142236" stroke="#334f70" strokeWidth="1" />
            <text x="50" y="44" fill="#94a3b8" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              MAINT. SHOP
            </text>

            {/* Diesel Storage Tanks */}
            <circle cx="125" cy="40" r="14" fill="#1b2838" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="155" cy="40" r="14" fill="#1b2838" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="140" y="72" fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="middle">
              DIESEL FUEL DEPOT
            </text>

            {/* Safety Staging Line */}
            <line x1="15" y1="95" x2="165" y2="95" stroke="#475569" strokeWidth="2" strokeDasharray="5 3" />
            <text x="90" y="108" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
              FLEET STAGING PAD
            </text>
          </g>

          {/* Zone 4: Explosives Magazine & Safety Zone (Northwest) */}
          <g transform="translate(60, 50)">
            <rect x="0" y="0" width="130" height="70" rx="4" fill="#170c0c" stroke="#5c1d1d" strokeWidth="1" strokeDasharray="4 2" />
            <text x="65" y="32" fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              EXPLOSIVES MAGAZINE
            </text>
            <text x="65" y="48" fill="#ef4444" fontSize="8" fontFamily="monospace" textAnchor="middle">
              (500m Safety Perimeter)
            </text>
          </g>

          {/* ========================================================
              OPEN-CAST PIT EXCAVATION BENCHES (TOPOGRAPHY CONTOURS)
              ======================================================== */}
          {showContours && (
            <g id="pitTopography">
              {/* Bench Outer Rim / Pit Crest (RL +240m) */}
              <path
                d="M 120 220 C 180 150, 420 160, 500 240 C 580 320, 550 480, 460 550 C 370 620, 160 620, 100 520 C 50 420, 60 290, 120 220 Z"
                fill="#0a101b"
                stroke="#2a3f5c"
                strokeWidth="2.5"
              />
              <text x="470" y="225" fill="#476282" fontSize="9" fontFamily="monospace">
                BENCH CUT 1 (RL +240m CREST)
              </text>

              {/* Bench 2 (RL +210m) */}
              <path
                d="M 140 250 C 190 190, 390 200, 450 270 C 520 340, 490 460, 410 510 C 330 560, 180 560, 130 480 C 90 410, 100 310, 140 250 Z"
                fill="#0c1422"
                stroke="#334b6e"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <text x="415" y="265" fill="#507096" fontSize="9" fontFamily="monospace">
                BENCH CUT 2 (RL +210m)
              </text>

              {/* Bench 3 (RL +180m) Intermediate Extraction Bench */}
              <path
                d="M 160 280 C 200 230, 360 240, 400 300 C 450 360, 430 430, 360 470 C 290 510, 190 510, 150 440 C 120 380, 130 320, 160 280 Z"
                fill="#0f192b"
                stroke="#3c577d"
                strokeWidth="1.8"
              />
              <text x="365" y="305" fill="#5c7fa8" fontSize="9" fontFamily="monospace">
                BENCH CUT 3 (RL +180m ORE SEAM)
              </text>

              {/* Bench 4 (RL +150m) Deep Digging Floor */}
              <path
                d="M 180 320 C 220 270, 320 280, 350 330 C 390 380, 370 410, 310 440 C 250 470, 190 460, 170 410 C 150 370, 160 340, 180 320 Z"
                fill="#122036"
                stroke="#476996"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text x="315" y="340" fill="#6992be" fontSize="9" fontFamily="monospace">
                BENCH CUT 4 (RL +150m)
              </text>

              {/* Pit Bottom Excavation Face & Sump (RL +120m) */}
              <path
                d="M 200 350 C 230 310, 280 320, 300 350 C 330 390, 310 410, 270 420 C 230 430, 190 410, 185 390 C 180 370, 190 360, 200 350 Z"
                fill="#162742"
                stroke="#60a5fa"
                strokeWidth="2"
              />
              <text x="245" y="380" fill="#93c5fd" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                PIT FLOOR EXCAVATION FACE (RL +120m)
              </text>
              <text x="245" y="394" fill="#60a5fa" fontSize="8" fontFamily="monospace" textAnchor="middle">
                [ SHOVEL BAY #02 LOADING ZONE ]
              </text>
            </g>
          )}

          {/* ========================================================
              ENGINEERED HEAVY HAULAGE ROAD NETWORK
              ======================================================== */}
          {/* Main Haul Ramp North (Spiral from Pit Floor up to Rim & Crusher) */}
          <path
            d="M 235 375 Q 310 320 380 270 T 490 220 Q 560 170 650 140"
            fill="none"
            stroke="#162235"
            strokeWidth="38"
            strokeLinecap="round"
          />
          <path
            d="M 235 375 Q 310 320 380 270 T 490 220 Q 560 170 650 140"
            fill="none"
            stroke="#1d2d46"
            strokeWidth="32"
            strokeLinecap="round"
          />
          {/* Safety Berm Outer Shoulders */}
          <path
            d="M 235 375 Q 310 320 380 270 T 490 220 Q 560 170 650 140"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="8 6"
            strokeOpacity="0.5"
          />
          {/* Center Road Dividing Line */}
          <path
            d="M 235 375 Q 310 320 380 270 T 490 220 Q 560 170 650 140"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.8"
            strokeDasharray="6 4"
            strokeOpacity="0.8"
          />

          {/* Haul Road Spur East to Waste Dump Yard */}
          <path
            d="M 490 220 Q 560 320 630 420 T 740 500"
            fill="none"
            stroke="#162235"
            strokeWidth="34"
            strokeLinecap="round"
          />
          <path
            d="M 490 220 Q 560 320 630 420 T 740 500"
            fill="none"
            stroke="#1d2d46"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <path
            d="M 490 220 Q 560 320 630 420 T 740 500"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            strokeOpacity="0.5"
          />

          {/* Workshop & Maintenance Access Spur */}
          <path
            d="M 490 520 L 490 420"
            fill="none"
            stroke="#162235"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="M 490 520 L 490 420"
            fill="none"
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Road Corridor Name Tags */}
          <text x="350" y="240" fill="#93c5fd" fontSize="9" fontWeight="bold" fontFamily="monospace" transform="rotate(-30 350 240)">
            MAIN HAUL RAMP NORTH (GRADE 8%) ➔
          </text>
          <text x="590" y="350" fill="#fde68a" fontSize="9" fontWeight="bold" fontFamily="monospace" transform="rotate(45 590 350)">
            WASTE HAULAGE BYPASS ➔
          </text>

          {/* ========================================================
              PROXIMITY COLLISION HAZARD VECTORS
              ======================================================== */}
          {proximityVectors.map((v, idx) => {
            const x1 = (v.d1.x / 100) * 1000;
            const y1 = (v.d1.y / 100) * 700;
            const x2 = (v.d2.x / 100) * 1000;
            const y2 = (v.d2.y / 100) * 700;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key={`hazard-vector-${idx}`} filter="url(#hazardGlow)">
                {/* Connecting Laser Proximity Vector Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={v.isCritical ? '#EF4444' : '#F59E0B'}
                  strokeWidth={v.isCritical ? 3.5 : 2.5}
                  strokeDasharray={v.isCritical ? '6 3' : '8 4'}
                  className={v.isCritical ? 'animate-pulse' : ''}
                />

                {/* Distance Badge on Line */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-42"
                    y="-12"
                    width="84"
                    height="24"
                    rx="4"
                    fill="#0a0f1d"
                    stroke={v.isCritical ? '#EF4444' : '#F59E0B'}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="4"
                    fill={v.isCritical ? '#FCA5A5' : '#FDE68A'}
                    fontSize="10"
                    fontWeight="black"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    V2V: {v.distMeters}m
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Fog Simulation Visual Overlay Layer */}
        {weather.fogLevel !== 'CLEAR' && (
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 flex items-start justify-start p-4 ${
              weather.fogLevel === 'DENSE_FOG'
                ? 'opacity-60 bg-slate-300/25 backdrop-blur-[2px]'
                : weather.fogLevel === 'MODERATE_FOG'
                ? 'opacity-35 bg-slate-300/15 backdrop-blur-[1px]'
                : 'opacity-15 bg-slate-300/10'
            }`}
          >
            <div className="bg-red-950/90 border border-red-700 text-red-200 px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-2 shadow-xl">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
              <span>
                FOG PENETRATION ACTIVE: VISIBILITY {weather.visibilityMeters}m (RADAR LOCK ASSIST)
              </span>
            </div>
          </div>
        )}

        {/* ========================================================
            PROFESSIONAL TOP-VIEW MINING DUMPERS (D01 – D06)
            ======================================================== */}
        {dumpers.map((dumper) => {
          const isSelected = dumper.id === selectedDumperId;
          const isHazard = dumper.status === 'HAZARD';
          const isWarning = dumper.status === 'WARNING';
          const isFull = dumper.loadStatus === 'FULL';

          return (
            <div
              key={dumper.id}
              onClick={() => handleDumperClick(dumper.id)}
              className="absolute cursor-pointer transition-all duration-700 -translate-x-1/2 -translate-y-1/2 z-20 group"
              style={{ left: `${dumper.x}%`, top: `${dumper.y}%` }}
              title={`Click to inspect ${dumper.name}`}
            >
              {/* Radar Safety Aura Pulse if in Hazard or Warning */}
              {(isHazard || isWarning) && (
                <div
                  className={`absolute -inset-8 rounded-full pointer-events-none ${
                    isHazard
                      ? 'border-2 border-red-500 bg-red-500/20 animate-ping'
                      : 'border-2 border-amber-500 bg-amber-500/15 animate-pulse'
                  }`}
                ></div>
              )}

              {/* Selection Halo */}
              {isSelected && (
                <div className="absolute -inset-6 rounded-full border-2 border-blue-400 bg-blue-500/10 animate-pulse pointer-events-none"></div>
              )}

              {/* Vehicle Container */}
              <div className="relative flex flex-col items-center">
                {/* Floating ID & Load Telemetry Badge */}
                <div
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-xl border whitespace-nowrap transition-transform mb-1 ${
                    isHazard
                      ? 'bg-red-700 text-white border-red-400 ring-2 ring-red-500/60 animate-bounce'
                      : isWarning
                      ? 'bg-amber-600 text-white border-amber-400'
                      : isSelected
                      ? 'bg-blue-600 text-white border-blue-300 ring-2 ring-blue-400/50'
                      : 'bg-slate-900/95 text-slate-200 border-slate-700 group-hover:border-slate-500'
                  }`}
                >
                  <span className="font-black">{dumper.id}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                      isFull
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-blue-400 text-slate-950'
                    }`}
                  >
                    {isFull ? `FULL ${dumper.payloadTons}T` : 'EMPTY'}
                  </span>
                  <span className="text-[9px] opacity-80">{dumper.speed} km/h</span>
                </div>

                {/* Professional Top-View Heavy Mining Dumper SVG */}
                <div
                  className="transition-transform duration-500 filter drop-shadow-xl"
                  style={{ transform: `rotate(${dumper.heading}deg)` }}
                >
                  <svg width="44" height="66" viewBox="0 0 44 66" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Direction-of-Travel Arrow Heading Beam */}
                    <line x1="22" y1="12" x2="22" y2="0" stroke={isHazard ? '#EF4444' : isWarning ? '#F59E0B' : '#38BDF8'} strokeWidth="2.5" strokeDasharray="2 2" />
                    <polygon points="22,-2 18,6 26,6" fill={isHazard ? '#EF4444' : isWarning ? '#F59E0B' : '#38BDF8'} />

                    {/* Front Heavy Duty Steering Wheels (Left & Right) */}
                    <rect x="1" y="14" width="7" height="15" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <rect x="36" y="14" width="7" height="15" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />

                    {/* Rear Dual Mining Haul Wheels (Left Pair & Right Pair) */}
                    <rect x="0" y="42" width="8" height="18" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <rect x="36" y="42" width="8" height="18" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />

                    {/* Heavy Steel Truck Chassis / Frame */}
                    <rect
                      x="7"
                      y="10"
                      width="30"
                      height="52"
                      rx="4"
                      fill={isHazard ? '#7f1d1d' : isWarning ? '#78350f' : isFull ? '#1e293b' : '#0f172a'}
                      stroke={isHazard ? '#f87171' : isWarning ? '#fbbf24' : isSelected ? '#60a5fa' : '#475569'}
                      strokeWidth={isSelected ? '2' : '1.5'}
                    />

                    {/* Front Heavy Radiator Grill / Bumper */}
                    <rect x="10" y="8" width="24" height="5" rx="1.5" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
                    <line x1="13" y1="10.5" x2="31" y2="10.5" stroke="#94a3b8" strokeWidth="1" />

                    {/* Left-Mounted Heavy Mining Cab (FOPS/ROPS) */}
                    <rect x="10" y="14" width="11" height="13" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                    {/* Cab Windshield Glass */}
                    <rect x="11.5" y="15" width="8" height="4" rx="1" fill="#e0f2fe" />
                    {/* Driver Head Indicator */}
                    <circle cx="15.5" cy="21" r="1.8" fill="#ffffff" />

                    {/* Right Engine Air Filter & Hydraulic Tank */}
                    <rect x="23" y="14" width="11" height="13" rx="1.5" fill="#334155" stroke="#475569" strokeWidth="0.8" />
                    <circle cx="28.5" cy="20.5" r="3" fill="#1e293b" />

                    {/* Massive Rear Dumper Bed / Dump Body */}
                    <rect
                      x="9"
                      y="29"
                      width="26"
                      height="31"
                      rx="2"
                      fill={isFull ? '#b45309' : '#1e293b'}
                      stroke={isFull ? '#f59e0b' : '#334155'}
                      strokeWidth="1.2"
                    />

                    {/* Dump Bed Internal Details: Ore Load or Ribbed Floor */}
                    {isFull ? (
                      // Mineral Ore Texture in Bed
                      <g>
                        <ellipse cx="22" cy="44" rx="10" ry="11" fill="#d97706" />
                        <circle cx="18" cy="41" r="2.5" fill="#f59e0b" />
                        <circle cx="25" cy="47" r="3" fill="#92400e" />
                        <circle cx="21" cy="51" r="2" fill="#f59e0b" />
                        <text x="22" y="46" fill="#fffbeb" fontSize="6" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                          ORE
                        </text>
                      </g>
                    ) : (
                      // Empty Ribbed Steel Bed
                      <g stroke="#334155" strokeWidth="0.8">
                        <line x1="11" y1="35" x2="33" y2="35" />
                        <line x1="11" y1="41" x2="33" y2="41" />
                        <line x1="11" y1="47" x2="33" y2="47" />
                        <line x1="11" y1="53" x2="33" y2="53" />
                      </g>
                    )}

                    {/* Rear Rock Ejector & Tailgate Spill Plate */}
                    <rect x="10" y="58" width="24" height="2" fill="#64748b" />
                  </svg>
                </div>

                {/* Sub-label showing clearance and click cue */}
                <div className="mt-1 px-1.5 py-0.2 rounded bg-slate-950/90 border border-slate-800 text-[9px] font-mono text-slate-300 whitespace-nowrap shadow">
                  <span className={dumper.ultrasonicFrontDistance < 18 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                    Radar: {dumper.ultrasonicFrontDistance}m
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* 3. Control-Room SCADA Overlays (Compass, Scale Bar, Legend) */}

        {/* Top-Right Compass Rose */}
        <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-sm border border-slate-800 rounded-xl p-2.5 shadow-xl flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
            <Compass className="w-5 h-5 text-amber-400" />
            <span className="absolute -top-1.5 text-[8px] font-black text-amber-400">N</span>
          </div>
          <div className="text-[10px] font-mono leading-tight text-slate-300">
            <span className="block font-bold text-slate-200">TRUE NORTH</span>
            <span className="text-slate-500">GRID AZIMUTH 000°</span>
          </div>
        </div>

        {/* Bottom-Left Metric Scale Bar */}
        <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-sm border border-slate-800 rounded-xl px-3 py-2 shadow-xl font-mono text-[10px] text-slate-300">
          <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Spatial Metric Scale</span>
          <div className="flex items-center gap-1">
            <div className="w-24 h-2 bg-gradient-to-r from-slate-200 via-slate-600 to-slate-200 border border-slate-400 rounded-sm"></div>
            <span className="font-bold text-slate-200">100m</span>
            <span className="text-slate-500 text-[8px]">(1 unit = 5m)</span>
          </div>
        </div>

        {/* Bottom-Right Comprehensive Industrial Legend */}
        <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-sm border border-slate-800 rounded-xl p-3 shadow-xl max-w-[280px] hidden md:block text-slate-300 font-mono text-[10px]">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 font-bold uppercase text-slate-200">
            <span>SCADA Map Legend</span>
            <span className="text-[9px] text-blue-400 font-normal">NIT Jamshedpur</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm bg-amber-600 border border-amber-400"></span>
              <span>Full Dumper</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-sm bg-slate-800 border border-blue-400"></span>
              <span>Empty Dumper</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400"></span>
              <span>Haul Ramp (8%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-dashed border-red-500"></span>
              <span>V2V Hazard Line</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-red-400">Critical (&lt;18m)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Safe Corridor</span>
            </div>
          </div>
          <div className="mt-2 pt-1 border-t border-slate-800/80 text-[8px] text-slate-500 leading-tight">
            * Simulated open-cast pit model &amp; telemetry for robotics competition.
          </div>
        </div>
      </div>
    </div>
  );
};
