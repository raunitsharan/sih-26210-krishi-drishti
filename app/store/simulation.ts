"use client";
import { create } from "zustand";

export type ThreatType = "none" | "animal" | "bird" | "fire";
export type AnimalType = "elephant" | "wildboar" | "deer";
export type ActivePanel =
  | "overview"
  | "animal"
  | "fire"
  | "irrigation"
  | "crop"
  | "harvest"
  | "alerts";

export interface SensorData {
  soilMoisture: number;      // %
  soilPH: number;            // 0-14
  nitrogen: number;          // ppm
  phosphorus: number;        // ppm
  potassium: number;         // ppm
  temperature: number;       // °C
  humidity: number;          // %
  rainfall: number;          // mm
  lightIntensity: number;    // lux
  windSpeed: number;         // km/h
  co2Level: number;          // ppm
  fireSmokeLevel: number;    // 0-100
}

export interface Alert {
  id: string;
  type: "animal" | "bird" | "fire" | "irrigation" | "system";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  location: string;
  acknowledged: boolean;
  telegramSent: boolean;
}

export interface CameraNode {
  id: string;
  label: string;
  position: [number, number, number];
  status: "active" | "inactive" | "threat";
  coverage: number; // degrees
}

export interface IrrigationZone {
  id: string;
  label: string;
  active: boolean;
  moisture: number;
  area: number; // acres
  crop: string;
}

export interface SimulationState {
  // Scene state
  activePanel: ActivePanel;
  setActivePanel: (p: ActivePanel) => void;

  // Threats
  activeThreat: ThreatType;
  animalType: AnimalType;
  animalPosition: number; // 0-1 progress through field
  fireIntensity: number;  // 0-100
  firePosition: [number, number]; // x,z in scene
  birdFlock: boolean;
  birdPosition: number;

  // Sensors
  sensors: SensorData;
  updateSensor: (key: keyof SensorData, value: number) => void;

  // Alerts
  alerts: Alert[];
  addAlert: (a: Omit<Alert, "id" | "timestamp">) => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;

  // Camera nodes
  cameraNodes: CameraNode[];
  updateNodeStatus: (id: string, status: CameraNode["status"]) => void;

  // Irrigation
  irrigationZones: IrrigationZone[];
  toggleIrrigation: (id: string) => void;
  smartIrrigationActive: boolean;
  toggleSmartIrrigation: () => void;

  // Crop recommendation
  recommendedCrop: string;
  cropConfidence: number;
  soilType: string;

  // Harvest prediction
  harvestDaysLeft: number;
  currentGrowthStage: string;
  growthProgress: number; // 0-100

  // Actions (problem injection)
  injectAnimal: (type: AnimalType) => void;
  injectFire: () => void;
  injectBirds: () => void;
  clearThreat: () => void;

  // System
  systemOnline: boolean;
  esp32Uptime: number;      // seconds
  wifiSignal: number;       // dBm
  solarVoltage: number;     // V
  batteryLevel: number;     // %

  // Simulation tick
  tick: number;
  incrementTick: () => void;
}

let alertCounter = 0;
const makeId = () => `alert-${++alertCounter}-${Date.now()}`;

export const useSimulation = create<SimulationState>((set, get) => ({
  // --- Scene ---
  activePanel: "overview",
  setActivePanel: (p) => set({ activePanel: p }),

  // --- Threats ---
  activeThreat: "none",
  animalType: "elephant",
  animalPosition: -1,
  fireIntensity: 0,
  firePosition: [3, 2],
  birdFlock: false,
  birdPosition: -1,

  // --- Sensors ---
  sensors: {
    soilMoisture: 62,
    soilPH: 6.8,
    nitrogen: 140,
    phosphorus: 45,
    potassium: 180,
    temperature: 28,
    humidity: 65,
    rainfall: 12,
    lightIntensity: 42000,
    windSpeed: 8,
    co2Level: 410,
    fireSmokeLevel: 2,
  },
  updateSensor: (key, value) =>
    set((s) => ({ sensors: { ...s.sensors, [key]: value } })),

  // --- Alerts ---
  alerts: [],
  addAlert: (a) =>
    set((s) => ({
      alerts: [
        { ...a, id: makeId(), timestamp: new Date() },
        ...s.alerts.slice(0, 49),
      ],
    })),
  acknowledgeAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    })),
  clearAlerts: () => set({ alerts: [] }),

  // --- Camera nodes ---
  cameraNodes: [
    { id: "N1", label: "Node 1 - North", position: [-4, 0, -4], status: "active", coverage: 120 },
    { id: "N2", label: "Node 2 - East",  position: [4, 0, -2],  status: "active", coverage: 120 },
    { id: "N3", label: "Node 3 - South", position: [2, 0, 4],   status: "active", coverage: 120 },
    { id: "N4", label: "Node 4 - West",  position: [-4, 0, 3],  status: "active", coverage: 120 },
    { id: "N5", label: "Node 5 - Center",position: [0, 0, 0],   status: "active", coverage: 360 },
  ],
  updateNodeStatus: (id, status) =>
    set((s) => ({
      cameraNodes: s.cameraNodes.map((n) => (n.id === id ? { ...n, status } : n)),
    })),

  // --- Irrigation ---
  irrigationZones: [
    { id: "Z1", label: "Zone A - Wheat",   active: false, moisture: 45, area: 2.5, crop: "Wheat"  },
    { id: "Z2", label: "Zone B - Rice",    active: true,  moisture: 78, area: 3.0, crop: "Rice"   },
    { id: "Z3", label: "Zone C - Maize",   active: false, moisture: 38, area: 2.0, crop: "Maize"  },
    { id: "Z4", label: "Zone D - Tomato",  active: false, moisture: 55, area: 1.5, crop: "Tomato" },
  ],
  toggleIrrigation: (id) =>
    set((s) => ({
      irrigationZones: s.irrigationZones.map((z) =>
        z.id === id ? { ...z, active: !z.active } : z
      ),
    })),
  smartIrrigationActive: true,
  toggleSmartIrrigation: () =>
    set((s) => ({ smartIrrigationActive: !s.smartIrrigationActive })),

  // --- Crop ---
  recommendedCrop: "Wheat",
  cropConfidence: 94,
  soilType: "Loamy",

  // --- Harvest ---
  harvestDaysLeft: 23,
  currentGrowthStage: "Grain Filling",
  growthProgress: 78,

  // --- Actions ---
  injectAnimal: (type) => {
    const { addAlert, updateNodeStatus } = get();
    set({ activeThreat: "animal", animalType: type, animalPosition: 0 });
    updateNodeStatus("N1", "threat");
    addAlert({
      type: "animal",
      severity: "critical",
      title: `🐘 ${type.charAt(0).toUpperCase() + type.slice(1)} Detected!`,
      message: `A ${type} has entered the farm perimeter near Node 1 (North boundary). Deterrent system activated. Farmer notified via Telegram.`,
      location: "Node 1 - North Boundary",
      acknowledged: false,
      telegramSent: true,
    });
  },

  injectFire: () => {
    const { addAlert, updateSensor } = get();
    set({ activeThreat: "fire", fireIntensity: 85 });
    updateSensor("fireSmokeLevel", 78);
    addAlert({
      type: "fire",
      severity: "critical",
      title: "🔥 Fire Hazard Detected!",
      message: "Smoke and heat sensors indicate active fire at the east crop section. Emergency services notified. Evacuation recommended.",
      location: "East Field - Zone B",
      acknowledged: false,
      telegramSent: true,
    });
  },

  injectBirds: () => {
    const { addAlert } = get();
    set({ activeThreat: "bird", birdFlock: true, birdPosition: 0 });
    addAlert({
      type: "bird",
      severity: "high",
      title: "🐦 Bird Flock Intrusion!",
      message: "Large flock of birds detected approaching from the west. Ultrasonic deterrent and strobe lights activated.",
      location: "West Boundary - Zone C",
      acknowledged: false,
      telegramSent: true,
    });
  },

  clearThreat: () => {
    const { updateNodeStatus, cameraNodes } = get();
    set({
      activeThreat: "none",
      animalPosition: -1,
      fireIntensity: 0,
      birdFlock: false,
      birdPosition: -1,
    });
    cameraNodes.forEach((n) => updateNodeStatus(n.id, "active"));
    get().updateSensor("fireSmokeLevel", 2);
  },

  // --- System ---
  systemOnline: true,
  esp32Uptime: 0,
  wifiSignal: -52,
  solarVoltage: 12.4,
  batteryLevel: 87,

  // --- Tick ---
  tick: 0,
  incrementTick: () => set((s) => ({ tick: s.tick + 1 })),
}));
