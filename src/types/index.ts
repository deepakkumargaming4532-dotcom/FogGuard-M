// FogGuard-M Types Definition
// Cleanly defined TypeScript interfaces for mine telemetry, dumpers, alerts, and weather.

export type LoadStatus = 'FULL' | 'EMPTY';
export type DumperStatus = 'ACTIVE' | 'IDLE' | 'MAINTENANCE' | 'WARNING' | 'HAZARD';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type FogLevel = 'CLEAR' | 'LIGHT_FOG' | 'MODERATE_FOG' | 'DENSE_FOG';

export interface Dumper {
  id: string; // e.g. "D01"
  name: string; // e.g. "Dumper 01 (CAT 777E)"
  x: number; // Mine Map X coordinate (0 - 100 percentage)
  y: number; // Mine Map Y coordinate (0 - 100 percentage)
  heading: number; // Direction in degrees (0 - 360)
  speed: number; // Current speed in km/h
  loadStatus: LoadStatus;
  payloadTons: number; // e.g. 95 tons when full, 0 when empty
  maxCapacityTons: number;
  status: DumperStatus;
  operator: string;
  fuelPercent: number;
  batteryPercent: number;
  assignedZone: string; // e.g. "Haul Road A", "Crusher 1", "Pit Bench 3"
  ultrasonicFrontDistance: number; // In meters (simulated sensor reading)
  ultrasonicRearDistance: number; // In meters
}

export interface ProximityAlert {
  id: string;
  sourceDumperId: string;
  targetDumperId: string;
  distanceMeters: number;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
}

export interface WeatherData {
  temperatureC: number;
  humidityPercent: number;
  visibilityMeters: number; // Key for fog detection
  fogLevel: FogLevel;
  ambientLightLux: number;
  windSpeedKmh: number;
  barometricPressureHpa: number;
  lastUpdated: string;
}

export interface RadarBlip {
  id: string;
  label: string;
  distanceMeters: number; // Distance from selected dumper
  angleDegrees: number; // 0 is straight ahead, 90 right, 180 rear, 270 left
  type: 'VEHICLE' | 'OBSTACLE' | 'PERSONNEL';
  relativeSpeedKmh: number;
}
