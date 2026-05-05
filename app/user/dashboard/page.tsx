"use client";

import { useEffect, useState } from "react";
import {
  Zap,
  TrendingUp,
  Target,
  Activity,
  History,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserDashboardHome() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return router.push("/user/login");

        const res = await fetch("/api/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.status === 401) return router.push("/user/login");

        const json = await res.json();
        setData(json.dashboard);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-[#10b981]" size={32} />
      </div>
    );
  }

  if (!data?.hasAccount) {
    return (
      <div className="space-y-6 max-w-[1200px]">
        <div className="p-8 text-center text-[#a1a1aa] bg-[#0e1217] rounded-xl border border-[#1f2937]">
          <p className="mb-4">{data?.message || "No active trading account."}</p>
          <button 
            onClick={() => router.push("/user/deposit")}
            className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Purchase Account
          </button>
        </div>
      </div>
    );
  }

  const { account, recentTrades, weeklyTradeCount } = data;

  return (
    <div className="space-y-6 max-w-[1200px] pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center border border-[#10b981]/30">
            <LayoutDashboardIcon className="text-[#10b981]" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Dashboard
            </h1>
            <p className="text-[#a1a1aa] mt-0.5 text-sm">
              {account.type.replace(/_/g, " ")} - ${account.capitalSize.toLocaleString()} Capital
            </p>
          </div>
        </div>
        <div className="bg-[#064e3b] border border-[#10b981]/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></div>
          <span className="text-xs font-semibold text-[#34d399]">{account.status}</span>
        </div>
      </div>

      {/* Top 4 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1f2937]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-[#a1a1aa] font-medium">Current Balance</p>
            <div className="w-6 h-6 rounded bg-[#10b981]/10 flex items-center justify-center">
              <Zap className="text-[#10b981]" size={12} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">${account.currentBalance.toLocaleString()}</h2>
          <p className="text-[11px] text-[#a1a1aa] flex items-center gap-1">
            <TrendingUp size={12} /> Initial: ${account.capitalSize.toLocaleString()}
          </p>
        </div>

        {/* Total P&L */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1f2937]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-[#a1a1aa] font-medium">Total P&L</p>
            <div className="w-6 h-6 rounded bg-[#10b981]/10 flex items-center justify-center">
              <TrendingUp className="text-[#10b981]" size={12} />
            </div>
          </div>
          <h2 className={`text-2xl font-bold mb-1 ${account.totalPnl >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
            {account.totalPnl >= 0 ? "+" : "-"}${Math.abs(account.totalPnl).toLocaleString()}
          </h2>
          <p className={`text-[11px] flex items-center gap-1 ${account.profitPct >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
            {account.profitPct >= 0 ? "+" : ""}{account.profitPct}%
          </p>
        </div>

        {/* Win Rate */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1f2937]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-[#a1a1aa] font-medium">Win Rate</p>
            <div className="w-6 h-6 rounded bg-[#3b82f6]/10 flex items-center justify-center">
              <Target className="text-[#3b82f6]" size={12} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{account.winRate}%</h2>
          <p className="text-[11px] text-[#a1a1aa] flex items-center gap-1">
            <span className="text-[#10b981] font-medium">{account.totalWins}W</span> / <span className="text-[#ef4444] font-medium">{account.totalLosses}L</span>
          </p>
        </div>

        {/* Total Trades */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1f2937]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-[#a1a1aa] font-medium">Total Trades</p>
            <div className="w-6 h-6 rounded bg-[#8b5cf6]/10 flex items-center justify-center">
              <Activity className="text-[#8b5cf6]" size={12} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{account.totalTrades}</h2>
          <p className="text-[11px] text-[#a1a1aa]">
            {weeklyTradeCount} This week
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Trades */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#111827] border border-[#1f2937]">
          <div className="flex items-center gap-2 mb-6">
            <History className="text-[#10b981]" size={18} />
            <h3 className="text-base font-semibold text-white">Recent Trades</h3>
          </div>
          
          {recentTrades.length === 0 ? (
            <div className="text-center text-[#a1a1aa] py-10">No recent trades.</div>
          ) : (
            <div className="space-y-4">
              {recentTrades.map((trade: any) => (
                <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0e1217] hover:bg-[#1f2937]/50 transition-colors border border-transparent hover:border-[#374151]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs bg-[#1e3a8a] text-[#60a5fa]">
                      {trade.matchTitle?.substring(0, 2).toUpperCase() || "T"}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{trade.matchTitle}</h4>
                      <p className="text-[11px] text-[#a1a1aa]">
                        ${trade.stake} • {trade.odds}x • {new Date(trade.createdAt).toLocaleDateString()}
                        <span className="ml-2 font-medium px-1.5 py-0.5 rounded bg-gray-800">{trade.outcome}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${trade.pnl > 0 ? "text-[#10b981]" : trade.pnl < 0 ? "text-[#ef4444]" : "text-gray-400"}`}>
                    {trade.pnl > 0 ? "+" : ""}{trade.pnl ? `$${trade.pnl}` : "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Performance & Rules */}
        <div className="space-y-6">
          {/* Performance */}
          <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937]">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 className="text-[#3b82f6]" size={18} />
              <h3 className="text-base font-semibold text-white">Performance</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#a1a1aa]">Daily Drawdown</span>
                  <span className="text-xs font-semibold text-white">{account.dailyDrawdownPct.toFixed(1)}% / 20%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#06b6d4] rounded-full" 
                    style={{ width: `${Math.min((account.dailyDrawdownPct / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#a1a1aa]">Lifetime Drawdown</span>
                  <span className="text-xs font-semibold text-white">{account.lifetimeDrawdownPct.toFixed(1)}% / 30%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ef4444] rounded-full"
                    style={{ width: `${Math.min((account.lifetimeDrawdownPct / 30) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Rules */}
          <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937]">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck className="text-[#10b981]" size={18} />
              <h3 className="text-base font-semibold text-white">Account Rules</h3>
            </div>
            <ul className="space-y-3">
              {[
                { label: "Max daily loss", val: "20%" },
                { label: "Max lifetime loss", val: "30%" },
                { label: "Profit target", val: "25%" },
                { label: "Min trading days", val: "5/week" },
                { label: "Reward split", val: "75-25" },
                { label: "Max bet", val: "20% of capital" },
              ].map((rule, idx) => (
                <li key={idx} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-[#a1a1aa]">
                    <CheckCircle2 size={14} className="text-[#10b981]/70" />
                    {rule.label}
                  </div>
                  <span className="text-white font-medium">{rule.val}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoutDashboardIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1"/>
      <rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/>
      <rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  );
}
