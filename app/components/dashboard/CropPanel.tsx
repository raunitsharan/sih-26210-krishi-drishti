"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSimulation } from "@/app/store/simulation";

const CROPS = [
  { name: "Wheat",  icon: "🌾", soilPH: [6.0, 7.5], moisture: [40, 65], temp: [15, 25], npk: "N:140 P:40 K:160" },
  { name: "Rice",   icon: "🌾", soilPH: [5.5, 7.0], moisture: [65, 90], temp: [22, 35], npk: "N:120 P:50 K:100" },
  { name: "Maize",  icon: "🌽", soilPH: [5.8, 7.0], moisture: [45, 70], temp: [20, 30], npk: "N:160 P:60 K:180" },
  { name: "Tomato", icon: "🍅", soilPH: [6.0, 6.8], moisture: [50, 75], temp: [18, 29], npk: "N:100 P:80 K:200" },
  { name: "Cotton", icon: "🌿", soilPH: [5.8, 8.0], moisture: [35, 65], temp: [20, 35], npk: "N:120 P:60 K:120" },
  { name: "Soybean",icon: "🫘", soilPH: [6.0, 7.0], moisture: [45, 70], temp: [20, 30], npk: "N:80  P:80 K:120" },
];

function computeScore(crop: typeof CROPS[0], ph: number, moisture: number, temp: number) {
  let score = 100;
  if (ph < crop.soilPH[0]) score -= (crop.soilPH[0] - ph) * 15;
  if (ph > crop.soilPH[1]) score -= (ph - crop.soilPH[1]) * 15;
  if (moisture < crop.moisture[0]) score -= (crop.moisture[0] - moisture) * 0.8;
  if (moisture > crop.moisture[1]) score -= (moisture - crop.moisture[1]) * 0.8;
  if (temp < crop.temp[0]) score -= (crop.temp[0] - temp) * 2;
  if (temp > crop.temp[1]) score -= (temp - crop.temp[1]) * 2;
  return Math.max(0, Math.min(100, score));
}

export default function CropPanel() {
  const { sensors } = useSimulation();
  const [scores, setScores] = useState<number[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    const s = CROPS.map((c) =>
      computeScore(c, sensors.soilPH, sensors.soilMoisture, sensors.temperature)
    );
    setScores(s);
  }, [sensors.soilPH, sensors.soilMoisture, sensors.temperature]);

  const topIdx = scores.indexOf(Math.max(...scores));

  const runAnalysis = () => {
    setAnalyzing(true);
    setShowAnalysis(false);
    setTimeout(() => {
      setAnalyzing(false);
      setShowAnalysis(true);
    }, 2400);
  };

  return (
    <div className="space-y-4">
      {/* Soil profile */}
      <div className="glass rounded-xl p-4">
        <div className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <span>🧪</span> Current Soil Profile
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "pH", val: sensors.soilPH.toFixed(2), color: "text-purple-400" },
            { label: "Moisture", val: sensors.soilMoisture.toFixed(0) + "%", color: "text-blue-400" },
            { label: "Temp", val: sensors.temperature.toFixed(1) + "°C", color: "text-red-400" },
            { label: "Nitrogen", val: sensors.nitrogen.toFixed(0), color: "text-green-400" },
            { label: "Phosphorus", val: sensors.phosphorus.toFixed(0), color: "text-yellow-400" },
            { label: "Potassium", val: sensors.potassium.toFixed(0), color: "text-orange-400" },
          ].map((item) => (
            <div key={item.label} className="text-center p-2 rounded-lg bg-black/30">
              <div className={`text-sm font-bold font-mono ${item.color}`}>{item.val}</div>
              <div className="text-[9px] text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendation button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={runAnalysis}
        disabled={analyzing}
        className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-900/60 to-green-800/40 border border-green-500/40 hover:border-green-400 transition-all disabled:opacity-60"
      >
        <div className="flex items-center justify-center gap-2">
          {analyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-green-300 font-semibold">Running AI Analysis...</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span className="text-sm text-green-300 font-semibold">Run AI Crop Recommendation</span>
            </>
          )}
        </div>
      </motion.button>

      {/* Scores */}
      <div className="space-y-2">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider px-1">
          AI Suitability Scores
        </div>
        {CROPS.map((crop, i) => (
          <motion.div
            key={crop.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass rounded-xl p-3 ${i === topIdx ? "border-green-500/50 glow-green" : ""}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">{crop.icon}</span>
              <span className="text-xs font-semibold text-white flex-1">{crop.name}</span>
              {i === topIdx && (
                <span className="text-[10px] px-2 py-0.5 bg-green-900/60 text-green-300 border border-green-500/40 rounded-full font-bold">
                  ⭐ BEST MATCH
                </span>
              )}
              <span className="text-xs font-mono text-white">{scores[i]?.toFixed(0) ?? "--"}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  i === topIdx ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                  scores[i] > 70 ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
                  scores[i] > 40 ? "bg-gradient-to-r from-yellow-500 to-amber-400" :
                  "bg-gradient-to-r from-red-500 to-rose-400"
                }`}
                animate={{ width: `${scores[i] ?? 0}%` }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
              />
            </div>
            <div className="text-[9px] text-gray-500 mt-1 font-mono">{crop.npk}</div>
          </motion.div>
        ))}
      </div>

      {/* AI Analysis result */}
      {showAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 border border-green-500/40"
        >
          <div className="flex items-center gap-2 mb-3">
            <span>🤖</span>
            <span className="text-sm font-bold text-green-400">AI Decision Engine</span>
            <span className="ml-auto text-[10px] text-gray-400 font-mono">YOLOv8 + Predictive AI</span>
          </div>
          <div className="text-xs text-gray-300 leading-relaxed">
            Based on current soil pH <span className="text-purple-400 font-mono">{sensors.soilPH.toFixed(2)}</span>,
            moisture <span className="text-blue-400 font-mono">{sensors.soilMoisture.toFixed(0)}%</span>,
            temperature <span className="text-red-400 font-mono">{sensors.temperature.toFixed(1)}°C</span>,
            and NPK levels, the optimal crop for this season is:
          </div>
          <div className="mt-3 p-3 rounded-lg bg-green-900/30 border border-green-500/30">
            <div className="text-xl font-bold text-white flex items-center gap-2">
              {CROPS[topIdx]?.icon} {CROPS[topIdx]?.name}
              <span className="text-sm text-green-400 font-mono">({scores[topIdx]?.toFixed(0)}% match)</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              Recommended seeding period: Oct–Nov • Expected yield: 35–40 qtl/acre
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
