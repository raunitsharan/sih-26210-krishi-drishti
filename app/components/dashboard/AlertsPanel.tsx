"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulation } from "@/app/store/simulation";

const severityConfig = {
  critical: { bg: "bg-red-900/40",    border: "border-red-500/50",    text: "text-red-300",    dot: "bg-red-400",    badge: "bg-red-900/60 text-red-300" },
  high:     { bg: "bg-orange-900/40", border: "border-orange-500/50", text: "text-orange-300", dot: "bg-orange-400", badge: "bg-orange-900/60 text-orange-300" },
  medium:   { bg: "bg-yellow-900/40", border: "border-yellow-500/50", text: "text-yellow-300", dot: "bg-yellow-400", badge: "bg-yellow-900/60 text-yellow-300" },
  low:      { bg: "bg-green-900/40",  border: "border-green-500/50",  text: "text-green-300",  dot: "bg-green-400",  badge: "bg-green-900/60 text-green-300" },
};

export default function AlertsPanel() {
  const { alerts, acknowledgeAlert, clearAlerts } = useSimulation();
  const unacked = alerts.filter((a) => !a.acknowledged);
  const acked = alerts.filter((a) => a.acknowledged);

  return (
    <div className="space-y-3">
      {/* Header stats */}
      <div className="grid grid-cols-4 gap-2">
        {["critical", "high", "medium", "low"].map((sev) => {
          const count = alerts.filter((a) => a.severity === sev).length;
          const c = severityConfig[sev as keyof typeof severityConfig];
          return (
            <div key={sev} className={`${c.bg} border ${c.border} rounded-xl p-2 text-center`}>
              <div className={`text-lg font-bold font-mono ${c.text}`}>{count}</div>
              <div className="text-[9px] text-gray-400 capitalize">{sev}</div>
            </div>
          );
        })}
      </div>

      {/* Clear all */}
      {alerts.length > 0 && (
        <button
          onClick={clearAlerts}
          className="w-full text-[10px] text-gray-500 hover:text-gray-300 transition-colors py-1"
        >
          Clear all ({alerts.length})
        </button>
      )}

      {/* Active alerts */}
      {unacked.length > 0 && (
        <div>
          <div className="text-[10px] text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            Active Alerts ({unacked.length})
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {unacked.map((alert) => {
                const c = severityConfig[alert.severity];
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`${c.bg} border ${c.border} rounded-xl p-3`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${c.dot} mt-1 flex-shrink-0 animate-pulse`} />
                        <div className="min-w-0">
                          <div className={`text-xs font-bold ${c.text} truncate`}>{alert.title}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{alert.message}</div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[9px] text-gray-500">📍 {alert.location}</span>
                            {alert.telegramSent && (
                              <span className="text-[9px] text-blue-400">✈️ Telegram sent</span>
                            )}
                            <span className="text-[9px] text-gray-600 font-mono">
                              {alert.timestamp.toLocaleTimeString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                      >
                        ACK
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Acknowledged */}
      {acked.length > 0 && (
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
            Resolved ({acked.length})
          </div>
          <div className="space-y-1.5">
            {acked.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 opacity-60">
                <span className="text-[10px]">✅</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-gray-400 truncate">{alert.title}</div>
                  <div className="text-[9px] text-gray-600 font-mono">{alert.timestamp.toLocaleTimeString("en-IN")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-sm">No active alerts</div>
          <div className="text-[10px]">Farm is secure</div>
        </div>
      )}
    </div>
  );
}
