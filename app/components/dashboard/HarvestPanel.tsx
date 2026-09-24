"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useSimulation } from "@/app/store/simulation";

const GROWTH_STAGES = [
  { stage: "Germination",   days: 0,  icon: "🌱", pct: 0  },
  { stage: "Seedling",      days: 10, icon: "🌿", pct: 15 },
  { stage: "Vegetative",    days: 30, icon: "🌾", pct: 35 },
  { stage: "Reproductive",  days: 55, icon: "🌼", pct: 55 },
  { stage: "Grain Filling", days: 75, icon: "🌽", pct: 78 },
  { stage: "Maturity",      days: 95, icon: "🎉", pct: 100 },
];

const growthData = [
  { day: 0,  height: 2,  health: 85 },
  { day: 10, height: 12, health: 88 },
  { day: 20, height: 25, health: 91 },
  { day: 30, height: 42, health: 87 },
  { day: 40, height: 58, health: 82 },
  { day: 50, height: 70, health: 78 },
  { day: 60, height: 82, health: 80 },
  { day: 70, height: 91, health: 83 },
  { day: 80, height: 96, health: 79 },
  { day: 90, height: 100,health: 75 },
  { day: 95, height: 100,health: 70 },
];

export default function HarvestPanel() {
  const { harvestDaysLeft, currentGrowthStage, growthProgress, sensors } = useSimulation();
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);

  const currentStageIdx = GROWTH_STAGES.findIndex((s) => s.stage === currentGrowthStage);
  const todayDay = 75; // current day in growth cycle

  const runPrediction = () => {
    setPredicting(true);
    setPrediction(null);
    setTimeout(() => {
      setPredicting(false);
      const adjustment = sensors.soilMoisture < 40 ? "+3" : sensors.temperature > 38 ? "+2" : "0";
      setPrediction(adjustment);
    }, 2200);
  };

  return (
    <div className="space-y-4">
      {/* Countdown */}
      <div className="glass rounded-xl p-4 text-center">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Estimated Days to Harvest</div>
        <motion.div
          key={harvestDaysLeft}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-5xl font-black font-mono text-green-400 my-2"
          style={{ textShadow: "0 0 30px rgba(34,197,94,0.6)" }}
        >
          {harvestDaysLeft}
        </motion.div>
        <div className="text-sm text-gray-300">days until optimal harvest</div>
        <div className="text-xs text-gray-500 mt-1">Est. date: {new Date(Date.now() + harvestDaysLeft * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
      </div>

      {/* Growth stage timeline */}
      <div className="glass rounded-xl p-4">
        <div className="text-xs font-semibold text-white mb-4">🌱 Growth Stage Timeline</div>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10" />
          <motion.div
            className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-400"
            style={{ boxShadow: "0 0 6px rgba(34,197,94,0.5)" }}
            animate={{ width: `${growthProgress}%` }}
            transition={{ duration: 1 }}
          />
          {/* Stage markers */}
          <div className="flex justify-between relative">
            {GROWTH_STAGES.map((stage, i) => {
              const isDone = stage.pct <= growthProgress;
              const isCurrent = i === currentStageIdx;
              return (
                <div key={stage.stage} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-base z-10 border-2 transition-all ${
                      isCurrent
                        ? "border-green-400 bg-green-900/60 shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                        : isDone
                        ? "border-green-600 bg-green-900/30"
                        : "border-gray-600 bg-gray-800/50"
                    }`}
                  >
                    {stage.icon}
                  </div>
                  <div className={`text-[8px] text-center leading-tight ${isCurrent ? "text-green-400 font-bold" : isDone ? "text-gray-400" : "text-gray-600"}`}>
                    {stage.stage.split(" ").map((w, j) => <div key={j}>{w}</div>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Current stage highlight */}
        <div className="mt-4 p-3 rounded-lg bg-green-900/20 border border-green-500/20">
          <div className="flex items-center gap-2">
            <span className="text-lg">{GROWTH_STAGES[currentStageIdx]?.icon}</span>
            <div>
              <div className="text-sm font-bold text-green-400">{currentGrowthStage}</div>
              <div className="text-[10px] text-gray-400">Day {todayDay} of ~95 • {growthProgress.toFixed(0)}% complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth chart */}
      <div className="glass rounded-xl p-4">
        <div className="text-xs font-semibold text-white mb-3">📈 Growth & Health Curve</div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="heightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#6b7280" }} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f1a10", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", fontSize: "11px" }}
                labelStyle={{ color: "#9ca3af" }}
              />
              <ReferenceLine x={todayDay} stroke="#fbbf24" strokeDasharray="4 2" label={{ value: "Today", fill: "#fbbf24", fontSize: 9 }} />
              <Area type="monotone" dataKey="height" stroke="#22c55e" strokeWidth={2} fill="url(#heightGrad)" name="Growth %" />
              <Area type="monotone" dataKey="health" stroke="#3b82f6" strokeWidth={1.5} fill="url(#healthGrad)" name="Health %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Harvest prediction */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={runPrediction}
        disabled={predicting}
        className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-900/60 to-yellow-800/40 border border-yellow-500/40 hover:border-yellow-400 transition-all"
      >
        <div className="flex items-center justify-center gap-2">
          {predicting ? (
            <>
              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-yellow-300 font-semibold">Calculating optimal harvest window...</span>
            </>
          ) : (
            <>
              <span>🎯</span>
              <span className="text-sm text-yellow-300 font-semibold">Predict Optimal Harvest Window</span>
            </>
          )}
        </div>
      </motion.button>

      {prediction !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 border border-yellow-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <span>🎯</span>
            <span className="text-xs font-bold text-yellow-400">Harvest Prediction Result</span>
          </div>
          <div className="text-xs text-gray-300 leading-relaxed">
            Based on current growth stage (<span className="text-green-400">{currentGrowthStage}</span>),
            soil conditions, and climate data:
          </div>
          <div className="mt-2 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/20">
            <div className="text-sm font-bold text-yellow-300">
              Optimal Window: <span className="text-white">{harvestDaysLeft + parseInt(prediction)} – {harvestDaysLeft + parseInt(prediction) + 5} days</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              {prediction !== "0"
                ? `Delay of ${prediction} days due to ${sensors.soilMoisture < 40 ? "low soil moisture" : "high temperature"}`
                : "Conditions are optimal — harvest on schedule"}
            </div>
            <div className="text-[10px] text-green-400 mt-1">Expected Yield: 36–42 qtl/acre (+12% vs last season)</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
