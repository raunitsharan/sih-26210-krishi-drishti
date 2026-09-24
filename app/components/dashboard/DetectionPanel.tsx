"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulation } from "@/app/store/simulation";
import { useEffect, useState } from "react";

interface DetectionBoxProps {
  label: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

function DetectionBox({ label, confidence, x, y, w, h, color }: DetectionBoxProps) {
  return (
    <div
      className="absolute border-2 rounded"
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, borderColor: color }}
    >
      <div
        className="absolute -top-5 left-0 px-1.5 py-0.5 text-[9px] font-bold font-mono rounded text-black whitespace-nowrap"
        style={{ background: color }}
      >
        {label} {(confidence * 100).toFixed(0)}%
      </div>
      {/* Corner markers */}
      {[[0,0],[100,0],[0,100],[100,100]].map(([cx,cy],i) => (
        <div key={i} className="absolute w-2 h-2 border-2 rounded-sm"
          style={{ left: `${cx}%`, top: `${cy}%`, transform: "translate(-50%,-50%)", borderColor: color }} />
      ))}
    </div>
  );
}

export default function DetectionPanel() {
  const { activeThreat, animalType, animalPosition, birdFlock, birdPosition, injectAnimal, injectBirds, clearThreat } = useSimulation();
  const [scanLine, setScanLine] = useState(0);

  // Animate scan line
  useEffect(() => {
    const id = setInterval(() => {
      setScanLine((p) => (p + 2) % 100);
    }, 30);
    return () => clearInterval(id);
  }, []);

  const cameraFeeds = [
    { id: "N1", label: "Node 1 - North", hasDetection: activeThreat !== "none" && activeThreat !== "fire" },
    { id: "N2", label: "Node 2 - East",  hasDetection: false },
    { id: "N3", label: "Node 3 - South", hasDetection: false },
    { id: "N4", label: "Node 4 - West",  hasDetection: activeThreat === "bird" },
  ];

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className={`glass rounded-xl p-3 border ${
        activeThreat !== "none" && activeThreat !== "fire"
          ? "border-red-500/50 glow-red"
          : "border-green-500/20"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              activeThreat !== "none" && activeThreat !== "fire"
                ? "bg-red-400 animate-pulse"
                : "bg-green-400"
            }`} />
            <span className="text-xs font-semibold text-white">
              {activeThreat === "animal" ? `🚨 ${animalType.toUpperCase()} DETECTED` :
               activeThreat === "bird"   ? "🚨 BIRD INTRUSION" :
               "✅ All Clear — Monitoring Active"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            YOLOv8 LIVE
          </div>
        </div>
        {activeThreat !== "none" && activeThreat !== "fire" && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs text-red-300 font-mono"
          >
            🔊 Deterrent activated · 📡 Telegram sent · 📍 GPS: 28.14°N 85.36°E
          </motion.div>
        )}
      </div>

      {/* Camera grid */}
      <div className="grid grid-cols-2 gap-2">
        {cameraFeeds.map((cam) => (
          <div key={cam.id} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
            {/* Simulated camera feed background */}
            <div className={`absolute inset-0 ${
              cam.hasDetection
                ? "bg-gradient-to-br from-red-950 to-gray-900"
                : "bg-gradient-to-br from-gray-900 to-gray-950"
            }`}>
              {/* Fake camera noise / grain */}
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 100%)`,
                }}
              />
              {/* Green horizon line / terrain */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-green-950 to-transparent" />
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "linear-gradient(rgba(34,197,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.5) 1px, transparent 1px)",
                  backgroundSize: "20% 20%",
                }}
              />
            </div>

            {/* Scan line */}
            <div
              className="absolute left-0 right-0 h-px bg-green-400/30 pointer-events-none"
              style={{ top: `${scanLine}%` }}
            />

            {/* Detection boxes */}
            {cam.id === "N1" && activeThreat === "animal" && animalPosition > 0.2 && (
              <DetectionBox
                label={animalType}
                confidence={animalType === "elephant" ? 0.91 : 0.86}
                x={20 + animalPosition * 20}
                y={30}
                w={40}
                h={50}
                color={animalType === "elephant" ? "#ef4444" : "#f97316"}
              />
            )}
            {cam.id === "N4" && activeThreat === "bird" && birdPosition > 0.15 && (
              <DetectionBox
                label="bird_flock"
                confidence={0.88}
                x={15}
                y={10}
                w={60}
                h={40}
                color="#eab308"
              />
            )}

            {/* Camera info overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-[8px] font-mono text-white">REC</span>
                </div>
                <div className="bg-black/60 rounded px-1.5 py-0.5 text-[8px] font-mono text-white">
                  {cam.id}
                </div>
              </div>
              <div>
                <div className="bg-black/60 rounded px-1.5 py-0.5 text-[8px] font-mono text-gray-300 inline-block">
                  {cam.label}
                </div>
              </div>
            </div>

            {cam.hasDetection && (
              <div className="absolute inset-0 border-2 border-red-500/60 rounded-xl pointer-events-none animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* YOLO confidence display */}
      <AnimatePresence>
        {activeThreat === "animal" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass rounded-xl p-3 border border-red-500/30"
          >
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
              YOLOv8 Detection Result
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">{animalType === "elephant" ? "🐘" : "🐗"}</div>
              <div>
                <div className="text-sm font-bold text-white capitalize">{animalType}</div>
                <div className="text-[10px] text-gray-400">Confidence: {animalType === "elephant" ? "91.2%" : "86.4%"} • IoU: 0.78</div>
              </div>
              <div className="ml-auto">
                <span className="px-2 py-0.5 bg-red-900/60 text-red-300 border border-red-500/40 rounded-full text-[10px] font-bold">
                  THREAT
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Animal Detection", val: animalType === "elephant" ? 91.2 : 86.4, color: "bg-red-500" },
                { label: "Size Classification", val: animalType === "elephant" ? 95.1 : 78.3, color: "bg-orange-500" },
                { label: "Threat Level",  val: animalType === "elephant" ? 97 : 82, color: "bg-red-600" },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-400 w-28">{m.label}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${m.color}`}
                      animate={{ width: `${m.val}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-white">{m.val.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2 text-[10px]">
              <span className="px-2 py-0.5 bg-green-900/40 text-green-400 border border-green-500/30 rounded">🔊 Ultrasonic ON</span>
              <span className="px-2 py-0.5 bg-blue-900/40 text-blue-400 border border-blue-500/30 rounded">💡 Strobe ON</span>
              <span className="px-2 py-0.5 bg-purple-900/40 text-purple-400 border border-purple-500/30 rounded">📡 Alert Sent</span>
            </div>
          </motion.div>
        )}

        {activeThreat === "bird" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass rounded-xl p-3 border border-yellow-500/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🐦</span>
              <div>
                <div className="text-sm font-bold text-white">Bird Flock Detected</div>
                <div className="text-[10px] text-gray-400">Count: ~12 birds • Confidence: 88%</div>
              </div>
            </div>
            <div className="flex gap-2 text-[10px]">
              <span className="px-2 py-0.5 bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 rounded">🔊 Deterrent ON</span>
              <span className="px-2 py-0.5 bg-blue-900/40 text-blue-400 border border-blue-500/30 rounded">📡 Farmer Notified</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
