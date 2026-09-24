"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulation, Alert } from "@/app/store/simulation";

function TelegramMessage({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  const icons: Record<string, string> = {
    animal: "🐘",
    bird: "🐦",
    fire: "🔥",
    irrigation: "💧",
    system: "⚙️",
  };

  const severityColors: Record<string, string> = {
    critical: "border-red-500 bg-red-950/60",
    high: "border-orange-500 bg-orange-950/60",
    medium: "border-yellow-500 bg-yellow-950/60",
    low: "border-green-500 bg-green-950/60",
  };

  const timeStr = alert.timestamp.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      className={`w-80 rounded-xl border-2 p-4 shadow-2xl backdrop-blur-xl ${severityColors[alert.severity]}`}
    >
      {/* Telegram header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
          ✈️
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-blue-300">Krishi Drishti Bot</div>
          <div className="text-[10px] text-gray-400">@KrishiDrishtiAlert</div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Message content */}
      <div className="rounded-lg p-3 mb-2" style={{
        background: "linear-gradient(135deg, rgba(20,30,48,0.9), rgba(10,15,25,0.95))",
        borderLeft: "3px solid",
        borderColor: alert.severity === "critical" ? "#ef4444" : alert.severity === "high" ? "#f97316" : "#eab308",
      }}>
        <div className="font-bold text-sm text-white mb-1">{alert.title}</div>
        <div className="text-xs text-gray-300 leading-relaxed mb-2">{alert.message}</div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <span>📍</span>
          <span>{alert.location}</span>
        </div>
        {alert.telegramSent && (
          <div className="flex items-center gap-1 text-[10px] text-blue-400 mt-1">
            <span>✅</span>
            <span>Telegram alert sent to farmer</span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <span className="font-mono">{timeStr}</span>
        <span className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[9px] ${
          alert.severity === "critical" ? "bg-red-900/60 text-red-300" :
          alert.severity === "high" ? "bg-orange-900/60 text-orange-300" :
          alert.severity === "medium" ? "bg-yellow-900/60 text-yellow-300" :
          "bg-green-900/60 text-green-300"
        }`}>
          {alert.severity}
        </span>
        <button onClick={onDismiss} className="text-gray-500 hover:text-gray-300 transition-colors text-base leading-none">
          ×
        </button>
      </div>

      {/* Node ID footer */}
      <div className="mt-2 pt-2 border-t border-white/10 flex gap-3 text-[10px] text-gray-500 font-mono">
        <span>Node: FARM_NODE_01</span>
        <span>•</span>
        <span>GPS: 28.14°N 85.36°E</span>
      </div>
    </motion.div>
  );
}

export default function TelegramNotifications() {
  const { alerts, acknowledgeAlert } = useSimulation();
  const [shown, setShown] = useState<Set<string>>(new Set());

  // Auto-dismiss after 8s
  useEffect(() => {
    const unacknowledged = alerts.filter(
      (a) => !a.acknowledged && !shown.has(a.id)
    );
    if (unacknowledged.length > 0) {
      const newIds = new Set(shown);
      unacknowledged.forEach((a) => newIds.add(a.id));
      setShown(newIds);

      unacknowledged.forEach((a) => {
        setTimeout(() => {
          acknowledgeAlert(a.id);
        }, 8000);
      });
    }
  }, [alerts]);

  const visibleAlerts = alerts.filter((a) => !a.acknowledged).slice(0, 3);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {visibleAlerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <TelegramMessage
              alert={alert}
              onDismiss={() => acknowledgeAlert(alert.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
