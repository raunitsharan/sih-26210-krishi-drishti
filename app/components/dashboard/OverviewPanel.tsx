"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area
} from "recharts";
import { useSimulation } from "@/app/store/simulation";

type DataPoint = { t: string; moisture: number; temp: number; smoke: number };

export default function OverviewPanel() {
  const { sensors, activeThreat, alerts, cameraNodes, irrigationZones, tick } = useSimulation();
  const [history, setHistory] = useState<DataPoint[]>([]);

  useEffect(() => {
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setHistory((prev) => [
      ...prev.slice(-29),
      { t: now, moisture: sensors.soilMoisture, temp: sensors.temperature, smoke: sensors.fireSmokeLevel },
    ]);
  }, [tick]);

  const stats = [
    {
      label: "System Status",
      value: activeThreat === "none" ? "SECURE" : "ALERT",
      icon: activeThreat === "none" ? "🛡️" : "🚨",
      color: activeThreat === "none" ? "text-green-400" : "text-red-400",
      bg: activeThreat === "none" ? "from-green-900/40 to-emerald-900/20" : "from-red-900/40 to-red-900/20",
      border: activeThreat === "none" ? "border-green-500/30" : "border-red-500/50",
    },
    {
      label: "Active Cameras",
      value: `${cameraNodes.filter((n) => n.status === "active").length}/${cameraNodes.length}`,
      icon: "📷",
      color: "text-blue-400",
      bg: "from-blue-900/40 to-blue-900/20",
      border: "border-blue-500/30",
    },
    {
      label: "Irrigation Zones ON",
      value: `${irrigationZones.filter((z) => z.active).length}/${irrigationZones.length}`,
      icon: "💧",
      color: "text-cyan-400",
      bg: "from-cyan-900/40 to-cyan-900/20",
      border: "border-cyan-500/30",
    },
    {
      label: "Active Alerts",
      value: alerts.filter((a) => !a.acknowledged).length,
      icon: "🔔",
      color: alerts.filter((a) => !a.acknowledged).length > 0 ? "text-red-400" : "text-gray-400",
      bg: alerts.filter((a) => !a.acknowledged).length > 0 ? "from-red-900/40 to-red-900/20" : "from-gray-900/40 to-gray-900/20",
      border: alerts.filter((a) => !a.acknowledged).length > 0 ? "border-red-500/50" : "border-gray-600/30",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-xl p-3`}
          >
            <div className="text-base mb-1">{s.icon}</div>
            <div className={`text-lg font-black font-mono ${s.color}`}>{s.value}</div>
            <div className="text-[9px] text-gray-400">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Key metrics */}
      <div className="glass rounded-xl p-3 space-y-2">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>📊</span> Live Key Metrics
        </div>
        {[
          { label: "Soil Moisture",  val: sensors.soilMoisture,  unit: "%",  color: "#38bdf8", warn: sensors.soilMoisture < 30 || sensors.soilMoisture > 85 },
          { label: "Temperature",    val: sensors.temperature,   unit: "°C", color: "#ef4444", warn: sensors.temperature > 40 },
          { label: "Soil pH",        val: sensors.soilPH,        unit: "",   color: "#a78bfa", warn: sensors.soilPH < 5.5 || sensors.soilPH > 7.5 },
          { label: "Smoke/Fire",     val: sensors.fireSmokeLevel,unit: "%",  color: "#f97316", warn: sensors.fireSmokeLevel > 30 },
          { label: "Humidity",       val: sensors.humidity,      unit: "%",  color: "#34d399", warn: false },
          { label: "Wind",           val: sensors.windSpeed,     unit: "km/h",color: "#94a3b8", warn: sensors.windSpeed > 35 },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <div className="text-[10px] text-gray-400 w-20 flex-shrink-0">{m.label}</div>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: m.warn ? "#ef4444" : m.color }}
                animate={{ width: `${Math.min(100, (m.val / (m.unit === "°C" ? 50 : m.unit === "pH" ? 14 : m.unit === "km/h" ? 60 : 100)) * 100)}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className={`text-[10px] font-mono w-12 text-right ${m.warn ? "text-red-400 animate-pulse" : "text-white"}`}>
              {m.val.toFixed(1)}{m.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Live chart */}
      <div className="glass rounded-xl p-3">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">📈 Live Time Series (30s)</div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
              <defs>
                <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" tick={{ fontSize: 7, fill: "#6b7280" }} tickLine={false} interval="preserveEnd" tickCount={5} />
              <YAxis tick={{ fontSize: 7, fill: "#6b7280" }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f1a10", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", fontSize: "10px", padding: "6px 10px" }}
                labelStyle={{ color: "#6b7280", fontSize: "9px" }}
              />
              <Area type="monotone" dataKey="moisture" stroke="#38bdf8" strokeWidth={1.5} fill="url(#mGrad)" name="Moisture %" dot={false} />
              <Area type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={1.5} fill="url(#tGrad)" name="Temp °C" dot={false} />
              <Line type="monotone" dataKey="smoke" stroke="#f97316" strokeWidth={1} name="Smoke %" dot={false} strokeDasharray="3 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-1 justify-center">
          {[{ color: "#38bdf8", label: "Moisture" }, { color: "#ef4444", label: "Temp" }, { color: "#f97316", label: "Smoke" }].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-3 h-0.5" style={{ background: l.color }} />
              <span className="text-[9px] text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Camera nodes status */}
      <div className="glass rounded-xl p-3">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">📡 Camera Node Status</div>
        <div className="space-y-1.5">
          {useSimulation.getState().cameraNodes.map((node) => (
            <div key={node.id} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                node.status === "threat" ? "bg-red-400 animate-pulse" :
                node.status === "active" ? "bg-green-400" : "bg-gray-600"
              }`} />
              <span className="text-[10px] text-gray-300 flex-1">{node.label}</span>
              <span className={`text-[9px] font-mono uppercase ${
                node.status === "threat" ? "text-red-400" :
                node.status === "active" ? "text-green-400" : "text-gray-500"
              }`}>
                {node.status === "threat" ? "⚠ THREAT" : node.status === "active" ? "● ACTIVE" : "○ OFFLINE"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
