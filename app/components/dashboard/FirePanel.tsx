"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulation } from "@/app/store/simulation";
import { useEffect, useState } from "react";

function FlameIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="animate-fire">
      <ellipse cx="24" cy="38" rx="10" ry="6" fill="#ef4444" fillOpacity="0.5"/>
      <path d="M24 4C24 4 12 16 12 26C12 33.2 17.4 39 24 39C30.6 39 36 33.2 36 26C36 16 24 4 24 4Z" fill="#f97316"/>
      <path d="M24 14C24 14 17 22 17 28C17 31.9 20.1 35 24 35C27.9 35 31 31.9 31 28C31 22 24 14 24 14Z" fill="#fbbf24"/>
      <path d="M24 22C24 22 20 26 20 29C20 31.2 21.8 33 24 33C26.2 33 28 31.2 28 29C28 26 24 22 24 22Z" fill="#fef9c3"/>
    </svg>
  );
}

export default function FirePanel() {
  const { activeThreat, fireIntensity, sensors, injectFire, clearThreat } = useSimulation();
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (activeThreat === "fire") {
      const id = setInterval(() => setTimeElapsed((p) => p + 1), 1000);
      return () => clearInterval(id);
    } else {
      setTimeElapsed(0);
    }
  }, [activeThreat]);

  const isFireActive = activeThreat === "fire";

  return (
    <div className="space-y-4">
      {/* Main fire status card */}
      <motion.div
        animate={isFireActive ? {
          boxShadow: ["0 0 20px rgba(239,68,68,0.2)", "0 0 40px rgba(239,68,68,0.5)", "0 0 20px rgba(239,68,68,0.2)"],
        } : {}}
        transition={{ duration: 1, repeat: Infinity }}
        className={`rounded-xl p-4 ${isFireActive
          ? "bg-gradient-to-br from-red-950 to-orange-950 border-2 border-red-500/70"
          : "glass border border-white/10"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={isFireActive ? "animate-fire" : ""}>
            <FlameIcon size={isFireActive ? 56 : 40} />
          </div>
          <div className="flex-1">
            <div className={`text-lg font-black ${isFireActive ? "text-red-300" : "text-gray-400"}`}>
              {isFireActive ? "🚨 FIRE EMERGENCY" : "✅ No Fire Detected"}
            </div>
            {isFireActive ? (
              <div className="space-y-1 mt-1">
                <div className="text-sm text-orange-300 font-semibold">Intensity: {fireIntensity.toFixed(0)}%</div>
                <div className="text-[10px] text-red-300 font-mono">
                  Duration: {Math.floor(timeElapsed / 60).toString().padStart(2,"0")}:{(timeElapsed%60).toString().padStart(2,"0")}
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 mt-1">All fire & smoke sensors normal</div>
            )}
          </div>
          {isFireActive && (
            <div className="text-center">
              <div className="text-2xl font-black text-red-400 font-mono animate-pulse">
                {fireIntensity.toFixed(0)}
              </div>
              <div className="text-[9px] text-red-500">%</div>
            </div>
          )}
        </div>

        {/* Intensity bar */}
        {isFireActive && (
          <div className="mt-3">
            <div className="h-3 bg-black/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"
                animate={{ width: `${fireIntensity}%` }}
                transition={{ duration: 0.3 }}
                style={{ boxShadow: "0 0 10px rgba(239,68,68,0.7)" }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Sensor readings */}
      <div className="glass rounded-xl p-4">
        <div className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <span>🌡️</span> Fire & Smoke Sensors
        </div>
        <div className="space-y-3">
          {[
            { label: "Smoke Density", val: sensors.fireSmokeLevel, unit: "%", max: 100, warnAt: 30, icon: "💨" },
            { label: "Temperature",   val: sensors.temperature,    unit: "°C", max: 50,  warnAt: 42, icon: "🌡️" },
            { label: "CO₂ Level",     val: sensors.co2Level,       unit: "ppm",max: 1000,warnAt: 800,icon: "🌿" },
          ].map((sensor) => {
            const isWarn = sensor.val > sensor.warnAt;
            return (
              <div key={sensor.label}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-400">{sensor.icon} {sensor.label}</span>
                  <span className={`font-mono font-semibold ${isWarn ? "text-red-400 animate-pulse" : "text-white"}`}>
                    {sensor.val.toFixed(1)}{sensor.unit}
                    {isWarn && " ⚠"}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${(sensor.val / sensor.max) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    className={`h-full rounded-full ${
                      isWarn
                        ? "bg-gradient-to-r from-orange-500 to-red-500"
                        : "bg-gradient-to-r from-green-500 to-emerald-400"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fire response protocol */}
      <AnimatePresence>
        {isFireActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass rounded-xl p-4 border border-red-500/30"
          >
            <div className="text-xs font-semibold text-red-400 mb-3">🚨 Emergency Response Protocol</div>
            <div className="space-y-2">
              {[
                { step: "1", action: "Fire detected via smoke + thermal sensors", status: "done", icon: "✅" },
                { step: "2", action: "YOLOv8 visual confirmation from camera feed", status: "done", icon: "✅" },
                { step: "3", action: "Telegram emergency alert sent to farmer", status: "done", icon: "✅" },
                { step: "4", action: "GPS coordinates sent to fire services", status: "done", icon: "✅" },
                { step: "5", action: "Neighbouring node cameras re-oriented", status: "active", icon: "⚡" },
                { step: "6", action: "Fire brigade notified at +91-101", status: "active", icon: "📞" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <span className="text-sm">{s.icon}</span>
                  <span className={`text-[10px] ${s.status === "done" ? "text-gray-400" : "text-red-300 font-semibold"}`}>
                    {s.action}
                  </span>
                  {s.status === "active" && <span className="text-red-400 text-[9px] animate-pulse">IN PROGRESS</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historical fire incidents */}
      <div className="glass rounded-xl p-4">
        <div className="text-xs font-semibold text-white mb-3">📋 Fire Incident Log</div>
        <div className="space-y-2">
          {[
            { date: "12 Sep 2026", time: "14:32", loc: "Zone B", resolved: true,  severity: "high"   },
            { date: "03 Aug 2026", time: "09:15", loc: "Zone A", resolved: true,  severity: "medium" },
            { date: "22 Jul 2026", time: "16:45", loc: "Zone D", resolved: true,  severity: "low"    },
          ].map((inc, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
              <span className="text-[10px]">{inc.resolved ? "✅" : "🔥"}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-gray-300">{inc.loc} • {inc.date} {inc.time}</div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                inc.severity === "high" ? "bg-red-900/60 text-red-300" :
                inc.severity === "medium" ? "bg-yellow-900/60 text-yellow-300" :
                "bg-green-900/60 text-green-300"
              }`}>{inc.severity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
