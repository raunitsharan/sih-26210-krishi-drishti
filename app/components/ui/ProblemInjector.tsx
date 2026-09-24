"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulation, AnimalType } from "@/app/store/simulation";

export default function ProblemInjector() {
  const { injectAnimal, injectFire, injectBirds, clearThreat, activeThreat } = useSimulation();
  const [expanded, setExpanded] = useState(true);

  const threats = [
    {
      id: "elephant",
      label: "Elephant",
      emoji: "🐘",
      desc: "Large animal intrusion",
      color: "from-red-900/60 to-red-800/40",
      border: "border-red-500/40",
      hover: "hover:border-red-400",
      action: () => injectAnimal("elephant" as AnimalType),
    },
    {
      id: "wildboar",
      label: "Wild Boar",
      emoji: "🐗",
      desc: "Medium animal intrusion",
      color: "from-orange-900/60 to-orange-800/40",
      border: "border-orange-500/40",
      hover: "hover:border-orange-400",
      action: () => injectAnimal("wildboar" as AnimalType),
    },
    {
      id: "birds",
      label: "Bird Flock",
      emoji: "🐦",
      desc: "Crop damage risk",
      color: "from-yellow-900/60 to-yellow-800/40",
      border: "border-yellow-500/40",
      hover: "hover:border-yellow-400",
      action: injectBirds,
    },
    {
      id: "fire",
      label: "Fire Hazard",
      emoji: "🔥",
      desc: "Emergency: crop fire",
      color: "from-red-950/80 to-orange-900/60",
      border: "border-red-400/60",
      hover: "hover:border-red-300",
      action: injectFire,
    },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-sm">
            ⚡
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">Problem Injector</div>
            <div className="text-[10px] text-gray-400">Simulate threats manually</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeThreat !== "none" && (
            <span className="px-2 py-0.5 bg-red-900/60 border border-red-500/40 rounded-full text-[10px] text-red-300 font-semibold animate-pulse uppercase">
              Active
            </span>
          )}
          <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {threats.map((t) => (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={t.action}
                  disabled={activeThreat !== "none"}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${t.color} border ${t.border} ${t.hover} transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <div className="text-left flex-1">
                    <div className="text-sm font-semibold text-white">{t.label}</div>
                    <div className="text-[10px] text-gray-400">{t.desc}</div>
                  </div>
                  <div className="text-xs text-gray-500">►</div>
                </motion.button>
              ))}

              {activeThreat !== "none" && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearThreat}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-green-900/60 to-emerald-800/40 border border-green-500/40 hover:border-green-400 transition-all"
                >
                  <span className="text-sm">✅</span>
                  <span className="text-sm font-semibold text-green-300">Clear Threat / Resolve</span>
                </motion.button>
              )}

              {/* Current status */}
              <div className="mt-3 p-3 rounded-xl bg-black/30 border border-white/10">
                <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Current Status</div>
                <div className={`text-sm font-semibold ${activeThreat === "none" ? "text-green-400" : "text-red-400"}`}>
                  {activeThreat === "none" ? "✅ All Clear — Farm Secure" :
                   activeThreat === "animal" ? "🚨 Animal Intrusion Detected" :
                   activeThreat === "bird" ? "⚠️ Bird Flock Incoming" :
                   "🚨 FIRE EMERGENCY"}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
