"use client";

import { useState, useEffect } from "react";
import { Activity, Loader2 } from "lucide-react";

export default function TradeMonitoringPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const res = await fetch("/api/admin/trades", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.trades) setTrades(data.trades);
      } catch (e) { console.error(e); }
      setIsLoading(false);
    };
    fetchTrades();
  }, []);

  const totalTrades = trades.length;
  const totalWins = trades.filter((t) => t.outcome === "WON").length;
  const totalLosses = trades.filter((t) => t.outcome === "LOST").length;
  const winRate = totalTrades > 0 ? ((totalWins / (totalWins + totalLosses || 1)) * 100).toFixed(1) : "0";
  const totalVolume = trades.reduce((sum, t) => sum + t.stake, 0);
  const pendingCount = trades.filter((t) => t.outcome === "PENDING").length;

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-[#10b981]" size={32} /></div>;

  return (
    <div className="space-y-6 max-w-[1200px] pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Trade Monitoring</h1>
        <p className="text-[#a1a1aa] mt-1 text-sm">Real-time surveillance of user positions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Trades", value: totalTrades },
          { label: "Win Rate", value: `${winRate}%`, color: "text-[#10b981]" },
          { label: "Pending", value: pendingCount, color: "text-[#f59e0b]" },
          { label: "Total Volume", value: `$${totalVolume.toLocaleString()}` },
        ].map((s, i) => (
          <div key={i} className="bg-[#0e1217] border border-[#1f2937] rounded-xl p-4">
            <p className="text-sm text-[#a1a1aa] mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color || "text-white"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Trades Table */}
      <div className="bg-[#0e1217] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1f2937] flex items-center gap-2">
          <Activity size={16} className="text-[#10b981]" />
          <h2 className="font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f2937] text-left">
                <th className="px-4 py-3 text-xs text-[#a1a1aa] font-medium">User</th>
                <th className="px-4 py-3 text-xs text-[#a1a1aa] font-medium">Market</th>
                <th className="px-4 py-3 text-xs text-[#a1a1aa] font-medium">Selection</th>
                <th className="px-4 py-3 text-xs text-[#a1a1aa] font-medium">Stake / Odds</th>
                <th className="px-4 py-3 text-xs text-[#a1a1aa] font-medium">P&L</th>
                <th className="px-4 py-3 text-xs text-[#a1a1aa] font-medium">Status</th>
                <th className="px-4 py-3 text-xs text-[#a1a1aa] font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, 20).map((trade) => (
                <tr key={trade.id} className="border-b border-[#1f2937] hover:bg-[#111827] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{trade.account?.user?.email?.split("@")[0] || "?"}</td>
                  <td className="px-4 py-3 text-white">{trade.matchTitle}</td>
                  <td className="px-4 py-3 text-white">{trade.selection}</td>
                  <td className="px-4 py-3"><span className="text-white">${trade.stake}</span> <span className="text-[#a1a1aa]">@ {trade.odds}</span></td>
                  <td className="px-4 py-3">
                    {trade.outcome === "PENDING" ? <span className="text-[#a1a1aa]">Open</span> : (
                      <span className={trade.pnl >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}>{trade.pnl >= 0 ? "+" : ""}${trade.pnl}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      trade.outcome === "PENDING" ? "bg-[#f59e0b]/20 text-[#f59e0b]" :
                      trade.outcome === "WON" ? "bg-[#10b981]/20 text-[#10b981]" :
                      trade.outcome === "LOST" ? "bg-[#ef4444]/20 text-[#ef4444]" :
                      "bg-[#a1a1aa]/20 text-[#a1a1aa]"
                    }`}>{trade.outcome}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#a1a1aa]">{new Date(trade.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {trades.length === 0 && <div className="text-center py-10 text-[#a1a1aa] text-sm">No trades yet.</div>}
        </div>
      </div>
    </div>
  );
}
