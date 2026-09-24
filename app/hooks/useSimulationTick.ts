"use client";
import { useEffect } from "react";
import { useSimulation } from "@/app/store/simulation";

export function useSimulationTick() {
  const {
    incrementTick,
    activeThreat,
    animalPosition,
    birdPosition,
    fireIntensity,
    sensors,
    updateSensor,
    irrigationZones,
    smartIrrigationActive,
    toggleIrrigation,
    systemOnline,
  } = useSimulation();

  // Main simulation tick — runs every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      incrementTick();
      const s = useSimulation.getState();

      // Drift sensor values naturally
      const drift = (val: number, min: number, max: number, speed = 0.3) => {
        const delta = (Math.random() - 0.5) * speed;
        return Math.min(max, Math.max(min, val + delta));
      };

      useSimulation.setState((prev) => ({
        sensors: {
          ...prev.sensors,
          soilMoisture: drift(prev.sensors.soilMoisture, 20, 95, 0.5),
          temperature: drift(prev.sensors.temperature, 18, 45, 0.2),
          humidity: drift(prev.sensors.humidity, 30, 95, 0.4),
          windSpeed: drift(prev.sensors.windSpeed, 0, 40, 0.8),
          co2Level: drift(prev.sensors.co2Level, 380, 600, 1.5),
          lightIntensity: drift(prev.sensors.lightIntensity, 5000, 90000, 500),
        },
        esp32Uptime: prev.esp32Uptime + 1,
        wifiSignal: drift(prev.wifiSignal, -80, -30, 1),
        solarVoltage: drift(prev.solarVoltage, 10, 14.5, 0.05),
        batteryLevel: drift(prev.batteryLevel, 60, 100, 0.1),
      }));

      // Animate animal walking into field
      if (s.activeThreat === "animal" && s.animalPosition >= 0 && s.animalPosition < 1) {
        useSimulation.setState({ animalPosition: Math.min(1, s.animalPosition + 0.008) });
      }

      // Animate bird flock
      if (s.activeThreat === "bird" && s.birdPosition >= 0 && s.birdPosition < 1) {
        useSimulation.setState({ birdPosition: Math.min(1, s.birdPosition + 0.012) });
      }

      // Fire grows/shrinks
      if (s.activeThreat === "fire") {
        const variation = Math.sin(Date.now() / 300) * 5;
        useSimulation.setState({ fireIntensity: Math.min(100, Math.max(60, s.fireIntensity + variation)) });
        updateSensor("fireSmokeLevel", Math.min(100, Math.max(50, s.sensors.fireSmokeLevel + (Math.random() - 0.4) * 3)));
      }

      // Smart irrigation auto-control
      if (smartIrrigationActive) {
        const zones = s.irrigationZones;
        zones.forEach((z) => {
          if (z.moisture < 40 && !z.active) {
            useSimulation.setState((prev) => ({
              irrigationZones: prev.irrigationZones.map((iz) =>
                iz.id === z.id ? { ...iz, active: true } : iz
              ),
            }));
          } else if (z.moisture > 75 && z.active) {
            useSimulation.setState((prev) => ({
              irrigationZones: prev.irrigationZones.map((iz) =>
                iz.id === z.id ? { ...iz, active: false } : iz
              ),
            }));
          }
          // Moisture changes when active
          useSimulation.setState((prev) => ({
            irrigationZones: prev.irrigationZones.map((iz) =>
              iz.id === z.id
                ? { ...iz, moisture: iz.active
                    ? Math.min(90, iz.moisture + 0.3)
                    : Math.max(15, iz.moisture - 0.1) }
                : iz
            ),
          }));
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [smartIrrigationActive]);
}
