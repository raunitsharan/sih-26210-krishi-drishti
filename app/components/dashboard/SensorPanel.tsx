"use client";
import { useSimulation } from "@/app/store/simulation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SensorCardProps {
  label: string;
  value: number;
  unit: string;
  icon: string;
  min: number;
  max: number;
  warning?: { low?: number; high?: number };
  color?: string;
  decimals?: number;
}

function SensorCard({ label, value, unit, icon, min, max, warning, color = "green", decimals = 1 }: SensorCardProps) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const isWarn =
    (warning?.low !== undefined && value < warning.low) ||
    (warning?.high !== undefined && value > warning.high);

  const colorMap: Record<string, { bar: string; glow: string; text: string }> = {
    green:  { bar: "from-emerald-500 to-green-400",  glow: "rgba(34,197,94,0.4)",  text: "text-green-400"  },
    blue:   { bar: "from-blue-500 to-cyan-400",      glow: "rgba(59,130,246,0.4)", text: "text-blue-400"   },
    purple: { bar: "from-purple-500 to-violet-400",  glow: "rgba(168,85,247,0.4)", text: "text-purple-400" },
    yellow: { bar: "from-yellow-500 to-amber-400",   glow: "rgba(234,179,8,0.4)",  text: "text-yellow-400" },
    orange: { bar: "from-orange-500 to-red-400",     glow: "rgba(249,115,22,0.4)", text: "text-orange-400" },
    cyan:   { bar: "from-cyan-500 to-teal-400",      glow: "rgba(6,182,212,0.4)",  text: "text-cyan-400"   },
    red:    { bar: "from-red-500 to-rose-400",       glow: "rgba(239,68,68,0.4)",  text: "text-red-400"    },
  };

  const c = isWarn ? colorMap.red : colorMap[color];
  const [prev, setPrev] = useState(value);
  const [trend, setTrend] = useState<"up" | "down" | "same">("same");

  useEffect(() => {
    if (Math.abs(value - prev) > 0.05) {
      setTrend(value > prev ? "up" : "down");
      setPrev(value);
    }
    const t = setTimeout(() => setTrend("same"), 1000);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <motion.div
      layout
      className={`sensor-card p-3 relative overflow-hidden ${isWarn ? "border-red-500/60" : ""}`}
    >
      {isWarn && (
        <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
      )}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</span>
        </div>
        <span className={`text-[10px] font-mono ${trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-gray-600"}`}>
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"}
        </span>
      </div>
      <div className={`text-xl font-bold font-mono mb-2 ${c.text}`}>
        {value.toFixed(decimals)}
        <span className="text-xs text-gray-400 ml-1">{unit}</span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${c.bar} rounded-full`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          style={{ boxShadow: `0 0 6px ${c.glow}` }}
        />
      </div>
      {isWarn && (
        <div className="mt-1 text-[9px] text-red-400 font-semibold animate-pulse">⚠ OUT OF RANGE</div>
      )}
    </motion.div>
  );
}

export default function SensorPanel() {
  const { sensors, systemOnline, esp32Uptime, wifiSignal, solarVoltage, batteryLevel } = useSimulation();

  const uptime = `${Math.floor(esp32Uptime / 3600).toString().padStart(2,"0")}:${Math.floor((esp32Uptime % 3600) / 60).toString().padStart(2,"0")}:${(esp32Uptime % 60).toString().padStart(2,"0")}`;

  return (
    <div className="space-y-3">
      {/* System status bar */}
      <div className="glass rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${systemOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            <span className="text-xs font-semibold text-white">ESP32 System</span>
          </div>
          <span className="text-[10px] font-mono text-green-400">{systemOnline ? "ONLINE" : "OFFLINE"}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex justify-between">
            <span className="text-gray-400">Uptime</span>
            <span className="font-mono text-white">{uptime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">WiFi</span>
            <span className="font-mono text-cyan-400">{Math.round(wifiSignal)} dBm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Solar</span>
            <span className="font-mono text-yellow-400">{solarVoltage.toFixed(1)}V</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Battery</span>
            <span className={`font-mono ${batteryLevel > 50 ? "text-green-400" : batteryLevel > 20 ? "text-yellow-400" : "text-red-400"}`}>
              {Math.round(batteryLevel)}%
            </span>
          </div>
        </div>
      </div>

      {/* Soil sensors */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-2">
          <span>🌱 Soil Sensors</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SensorCard label="Moisture" value={sensors.soilMoisture} unit="%" icon="💧" min={0} max={100} warning={{ low: 30, high: 90 }} color="blue" decimals={1} />
          <SensorCard label="pH Level" value={sensors.soilPH} unit="pH" icon="⚗️" min={4} max={9} warning={{ low: 5.5, high: 7.5 }} color="purple" decimals={2} />
          <SensorCard label="Nitrogen" value={sensors.nitrogen} unit="ppm" icon="🧪" min={0} max={300} color="green" decimals={0} />
          <SensorCard label="Phosphorus" value={sensors.phosphorus} unit="ppm" icon="🔬" min={0} max={100} color="yellow" decimals={0} />
          <SensorCard label="Potassium" value={sensors.potassium} unit="ppm" icon="⚡" min={0} max={300} color="orange" decimals={0} />
        </div>
      </div>

      {/* Environment sensors */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-2">
          <span>🌡️ Environment</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SensorCard label="Temperature" value={sensors.temperature} unit="°C" icon="🌡️" min={0} max={50} warning={{ high: 40 }} color="red" decimals={1} />
          <SensorCard label="Humidity" value={sensors.humidity} unit="%" icon="💨" min={0} max={100} warning={{ low: 30 }} color="cyan" decimals={1} />
          <SensorCard label="Rainfall" value={sensors.rainfall} unit="mm" icon="🌧️" min={0} max={100} color="blue" decimals={1} />
          <SensorCard label="Wind Speed" value={sensors.windSpeed} unit="km/h" icon="🌬️" min={0} max={60} warning={{ high: 40 }} color="cyan" decimals={1} />
          <SensorCard label="Light" value={sensors.lightIntensity / 1000} unit="klux" icon="☀️" min={0} max={100} color="yellow" decimals={1} />
          <SensorCard label="CO₂" value={sensors.co2Level} unit="ppm" icon="🌿" min={350} max={1000} warning={{ high: 800 }} color="green" decimals={0} />
        </div>
      </div>

      {/* Fire/Smoke sensor */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-2">
          <span>🔥 Fire / Smoke</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <SensorCard label="Smoke Level" value={sensors.fireSmokeLevel} unit="%" icon="💨" min={0} max={100} warning={{ high: 30 }} color={sensors.fireSmokeLevel > 30 ? "red" : "green"} decimals={1} />
      </div>
    </div>
  );
}
