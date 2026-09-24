"use client";
import { motion } from "framer-motion";
import { useSimulation, ActivePanel } from "@/app/store/simulation";

const NAV_ITEMS: Array<{ id: ActivePanel; label: string; icon: string; desc: string }> = [
  { id: "overview",  label: "Overview",    icon: "🏠", desc: "Farm status" },
  { id: "animal",    label: "Detection",   icon: "📷", desc: "Animal & Bird AI" },
  { id: "fire",      label: "Fire Safety", icon: "🔥", desc: "Smoke & fire alerts" },
  { id: "irrigation",label: "Irrigation",  icon: "💧", desc: "Smart water mgmt" },
  { id: "crop",      label: "Crop AI",     icon: "🌾", desc: "Recommendation" },
  { id: "harvest",   label: "Harvest",     icon: "🎯", desc: "Timing prediction" },
  { id: "alerts",    label: "Alerts",      icon: "🔔", desc: "Notifications" },
];

export default function Sidebar() {
  const { activePanel, setActivePanel, alerts, activeThreat } = useSimulation();
  const unackedAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="w-16 lg:w-56 flex-shrink-0 glass-dark flex flex-col border-r border-white/5">
      {/* Logo */}
      <div className="p-3 lg:p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
            🌿
          </div>
          <div className="hidden lg:block">
            <div className="text-sm font-bold text-white">Krishi Drishti</div>
            <div className="text-[9px] text-green-400">SIH 2026 · #26210</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activePanel === item.id;
          const hasBadge = item.id === "alerts" && unackedAlerts > 0;
          const hasThreat =
            (item.id === "animal" && (activeThreat === "animal" || activeThreat === "bird")) ||
            (item.id === "fire" && activeThreat === "fire");

          return (
            <motion.button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 px-2 lg:px-3 py-2.5 rounded-xl transition-all relative ${
                isActive
                  ? "bg-green-900/40 border border-green-500/40 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <div className="hidden lg:block text-left min-w-0">
                <div className={`text-xs font-semibold truncate ${isActive ? "text-white" : ""}`}>
                  {item.label}
                </div>
                <div className="text-[9px] text-gray-500 truncate">{item.desc}</div>
              </div>
              {hasBadge && (
                <span className="absolute right-2 top-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                  {unackedAlerts}
                </span>
              )}
              {hasThreat && (
                <span className="absolute right-2 top-1.5 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
              )}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-green-400 rounded-r-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom system info */}
      <div className="p-3 border-t border-white/5">
        <div className="hidden lg:block space-y-1.5">
          {[
            { label: "YOLOv8 AI",   status: "Running", color: "text-green-400" },
            { label: "ESP32 Nodes", status: "5/5 Online", color: "text-green-400" },
            { label: "WiFi Mesh",   status: "Strong",  color: "text-cyan-400"  },
            { label: "Solar",       status: "12.4V",   color: "text-yellow-400"},
          ].map((s) => (
            <div key={s.label} className="flex justify-between items-center">
              <span className="text-[9px] text-gray-500">{s.label}</span>
              <span className={`text-[9px] font-mono ${s.color}`}>{s.status}</span>
            </div>
          ))}
        </div>
        <div className="lg:hidden flex justify-center mt-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
