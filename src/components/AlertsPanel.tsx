'use client';

// FogGuard-M Real-Time Safety Alerts Panel
// Centralized log of proximity breaches, fog alerts, and autonomous collision warnings.

import React, { useState } from 'react';
import { Bell, AlertTriangle, AlertOctagon, Info, Check, Trash2 } from 'lucide-react';
import { useMine } from '../context/MineContext';
import { AlertSeverity } from '../types';

export const AlertsPanel: React.FC = () => {
  const { alerts, dismissAlert, clearAllAlerts } = useMine();
  const [filter, setFilter] = useState<'ALL' | AlertSeverity>('ALL');

  const filteredAlerts = alerts.filter((a) => (filter === 'ALL' ? true : a.severity === filter));

  const getAlertIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  const getAlertStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/40 border-red-800/80 text-red-200';
      case 'WARNING':
        return 'bg-amber-950/40 border-amber-800/80 text-amber-200';
      default:
        return 'bg-blue-950/30 border-blue-900/60 text-blue-200';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-slate-200 flex flex-col h-[320px]">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-2.5 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
            Live Safety Event Log
          </h2>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
            {alerts.length}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2 py-0.5 rounded transition-all ${
              filter === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`px-2 py-0.5 rounded transition-all ${
              filter === 'CRITICAL' ? 'bg-red-900 text-red-200 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilter('WARNING')}
            className={`px-2 py-0.5 rounded transition-all ${
              filter === 'WARNING' ? 'bg-amber-900 text-amber-200 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Warning
          </button>
          {alerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              title="Clear alerts log"
              className="p-1 rounded text-slate-500 hover:text-red-400 ml-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Alerts Scrollable Feed */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <Check className="w-6 h-6 text-emerald-500/50 mb-1" />
            <span>No active safety alerts. Haul corridors nominal.</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-2.5 rounded-lg border flex items-start justify-between gap-2 text-xs transition-all ${getAlertStyle(
                alert.severity
              )}`}
            >
              <div className="flex items-start gap-2">
                {getAlertIcon(alert.severity)}
                <div>
                  <p className="font-semibold text-slate-100">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                    <span>{alert.timestamp}</span>
                    <span>•</span>
                    <span>TARGET: {alert.targetDumperId}</span>
                    {alert.distanceMeters && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-amber-300">{alert.distanceMeters}m</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => dismissAlert(alert.id)}
                title="Dismiss event"
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                &times;
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
