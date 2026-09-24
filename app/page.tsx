"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "@/app/components/ui/Sidebar";
import ProblemInjector from "@/app/components/ui/ProblemInjector";
import TelegramNotifications from "@/app/components/alerts/TelegramNotification";
import OverviewPanel from "@/app/components/dashboard/OverviewPanel";
import DetectionPanel from "@/app/components/dashboard/DetectionPanel";
import FirePanel from "@/app/components/dashboard/FirePanel";
import IrrigationPanel from "@/app/components/dashboard/IrrigationPanel";
import CropPanel from "@/app/components/dashboard/CropPanel";
import HarvestPanel from "@/app/components/dashboard/HarvestPanel";
import AlertsPanel from "@/app/components/dashboard/AlertsPanel";
import SensorPanel from "@/app/components/dashboard/SensorPanel";

import { useSimulation } from "@/app/store/simulation";
import { useSimulationTick } from "@/app/hooks/useSimulationTick";

// 3D scene loaded client-side only
const FarmScene = dynamic(() => import("@/app/components/3d/FarmScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0c1a3a] to-[#0a0f0d]">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-green-400 text-sm font-semibold">Loading 3D Farm...</div>
        <div className="text-gray-500 text-xs mt-1">Initializing Three.js scene</div>
      </div>
    </div>
  ),
});

const PANEL_LABELS: Record<string, string> = {
  overview:   "Farm Overview",
  animal:     "Animal & Bird Detection",
  fire:       "Fire Safety System",
  irrigation: "Smart Irrigation",
  crop:       "AI Crop Recommendation",
  harvest:    "Harvest Prediction",
  alerts:     "Alert Log",
};

function MainContent() {
  useSimulationTick();
  const { activePanel, activeThreat } = useSimulation();

  const panelContent: Record<string, React.ReactNode> = {
    overview:   <OverviewPanel />,
    animal:     <DetectionPanel />,
    fire:       <FirePanel />,
    irrigation: <IrrigationPanel />,
    crop:       <CropPanel />,
    harvest:    <HarvestPanel />,
    alerts:     <AlertsPanel />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f0d]">
      {/* Sidebar */}
      <Sidebar />

      {/* Center — 3D Scene */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 glass-dark border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-white">{PANEL_LABELS[activePanel]}</div>
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-500">
              <span>SIH 2026</span>
              <span>·</span>
              <span>PS ID: 26210</span>
              <span>·</span>
              <span>Team: Krishi Drishti</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeThreat !== "none" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-900/60 border border-red-500/50"
              >
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-red-300 font-semibold uppercase">
                  {activeThreat === "animal" ? "Animal Threat" :
                   activeThreat === "bird" ? "Bird Intrusion" : "FIRE"}
                </span>
              </motion.div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="font-mono">{new Date().toLocaleTimeString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* 3D Scene */}
        <div className="flex-1 relative">
          <Suspense>
            <FarmScene />
          </Suspense>

          {/* Overlay hints */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] text-gray-500 pointer-events-none">
            <span>🖱️ Drag to orbit</span>
            <span>·</span>
            <span>🔍 Scroll to zoom</span>
            <span>·</span>
            <span>✋ Right-drag to pan</span>
          </div>

          {/* Scene legend */}
          <div className="absolute top-3 left-3 glass rounded-xl p-2 space-y-1 pointer-events-none">
            {[
              { color: "bg-green-400", label: "ESP32 Node (active)" },
              { color: "bg-red-400",   label: "Node (threat detected)" },
              { color: "bg-blue-400",  label: "Irrigation active" },
              { color: "bg-yellow-400",label: "Soil sensor" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-[9px] text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — dashboard */}
      <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col glass-dark border-l border-white/5 overflow-hidden">
        {/* Panel header */}
        <div className="px-4 py-2.5 border-b border-white/5 flex-shrink-0">
          <div className="text-xs font-semibold text-white">{PANEL_LABELS[activePanel]}</div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {panelContent[activePanel]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Far-right — sensors + injector (always visible) */}
      <div className="w-60 xl:w-64 flex-shrink-0 flex flex-col glass-dark border-l border-white/5 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/5 flex-shrink-0">
          <div className="text-xs font-semibold text-white">Live Sensors & Controls</div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <ProblemInjector />
          <SensorPanel />
        </div>
      </div>

      {/* Telegram notifications overlay */}
      <TelegramNotifications />
    </div>
  );
}

export default function Home() {
  return <MainContent />;
}
