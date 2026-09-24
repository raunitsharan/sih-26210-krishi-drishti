"use client";
import { motion } from "framer-motion";
import { useSimulation } from "@/app/store/simulation";

export default function IrrigationPanel() {
  const {
    irrigationZones,
    toggleIrrigation,
    smartIrrigationActive,
    toggleSmartIrrigation,
    sensors,
  } = useSimulation();

  const totalActive = irrigationZones.filter((z) => z.active).length;

  return (
    <div className="space-y-4">
      {/* Smart Irrigation Toggle */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <div>
              <div className="text-sm font-semibold text-white">AI Smart Irrigation</div>
              <div className="text-[10px] text-gray-400">Auto-controls based on soil moisture</div>
            </div>
          </div>
          <button
            onClick={toggleSmartIrrigation}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
              smartIrrigationActive ? "bg-green-500" : "bg-gray-600"
            }`}
          >
            <motion.div
              animate={{ x: smartIrrigationActive ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
            />
          </button>
        </div>

        {/* Water stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Active Zones", val: totalActive, unit: "/" + irrigationZones.length, color: "text-blue-400" },
            { label: "Soil Moisture", val: sensors.soilMoisture.toFixed(0), unit: "%", color: sensors.soilMoisture < 40 ? "text-red-400" : "text-green-400" },
            { label: "Saved Water", val: "34", unit: "%", color: "text-cyan-400" },
          ].map((s) => (
            <div key={s.label} className="text-center p-2 rounded-lg bg-black/30">
              <div className={`text-lg font-bold font-mono ${s.color}`}>{s.val}<span className="text-xs text-gray-400">{s.unit}</span></div>
              <div className="text-[9px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Irrigation Zones */}
      <div className="space-y-2">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider px-1 flex items-center gap-2">
          <span>💧 Irrigation Zones</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        {irrigationZones.map((zone) => (
          <motion.div
            key={zone.id}
            layout
            className={`glass rounded-xl p-3 transition-all ${zone.active ? "border-blue-500/40 glow-blue" : ""}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${zone.active ? "bg-blue-400 animate-pulse" : "bg-gray-600"}`} />
                <span className="text-xs font-semibold text-white">{zone.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">{zone.area} ac</span>
                <button
                  onClick={() => toggleIrrigation(zone.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all ${
                    zone.active
                      ? "bg-blue-900/60 text-blue-300 border border-blue-500/40"
                      : "bg-gray-800/60 text-gray-400 border border-gray-600/40 hover:border-blue-500/40"
                  }`}
                >
                  {zone.active ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {/* Moisture bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 w-14">Moisture</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    zone.moisture < 40 ? "bg-red-500" :
                    zone.moisture < 60 ? "bg-yellow-500" :
                    "bg-blue-400"
                  }`}
                  animate={{ width: `${zone.moisture}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-[10px] font-mono text-white w-8 text-right">{zone.moisture.toFixed(0)}%</span>
            </div>

            {/* Crop */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-500">🌾 {zone.crop}</span>
              {zone.active && (
                <span className="text-[10px] text-blue-400 animate-pulse">💧 Irrigating...</span>
              )}
              {zone.moisture < 40 && !zone.active && smartIrrigationActive && (
                <span className="text-[10px] text-red-400 animate-blink">⚠ Needs water</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Water flow animation */}
      <div className="glass rounded-xl p-3">
        <div className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider">Water Flow Diagram</div>
        <svg viewBox="0 0 280 100" className="w-full h-20">
          {/* Main pipe */}
          <line x1="140" y1="15" x2="140" y2="90" stroke="#374151" strokeWidth="4" />
          {/* Branch pipes */}
          <line x1="140" y1="30" x2="40" y2="60" stroke="#374151" strokeWidth="3" />
          <line x1="140" y1="30" x2="240" y2="60" stroke="#374151" strokeWidth="3" />
          <line x1="140" y1="55" x2="70" y2="85" stroke="#374151" strokeWidth="2.5" />
          <line x1="140" y1="55" x2="210" y2="85" stroke="#374151" strokeWidth="2.5" />

          {/* Water flow (animated) */}
          {irrigationZones.map((zone, i) => {
            const points = [[140,15,40,60],[140,15,240,60],[140,30,70,85],[140,30,210,85]][i];
            if (!points || !zone.active) return null;
            return (
              <line key={zone.id}
                x1={points[0]} y1={points[1]} x2={points[2]} y2={points[3]}
                stroke="#38bdf8" strokeWidth="2" strokeDasharray="5,3"
                style={{ animation: "water-flow 1s linear infinite" }}
              />
            );
          })}

          {/* Source */}
          <circle cx="140" cy="12" r="8" fill="#1e40af" />
          <text x="140" y="16" textAnchor="middle" fontSize="8" fill="white">💧</text>

          {/* Zone circles */}
          {[{x:40,y:65,i:0},{x:240,y:65,i:1},{x:70,y:90,i:2},{x:210,y:90,i:3}].map((p) => (
            <g key={p.i}>
              <circle cx={p.x} cy={p.y} r="10"
                fill={irrigationZones[p.i]?.active ? "#1d4ed8" : "#374151"}
              />
              <text x={p.x} y={p.y+3} textAnchor="middle" fontSize="7" fill="white">
                {irrigationZones[p.i]?.id}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
