"use client";

import { TestTube, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function TestAccountsPage() {
  const testAccounts = [
    {
      user: "John Doe",
      email: "john@email.com",
      capital: "$10,000",
      phase: "Phase 1",
      daysLeft: 8,
      totalDays: 14,
      trades: 3,
      profitPct: 12.5,
      drawdown: 2.1,
      status: "active",
    },
    {
      user: "Sarah Connor",
      email: "sarah@email.com",
      capital: "$5,000",
      phase: "Phase 1",
      daysLeft: 2,
      totalDays: 14,
      trades: 5,
      profitPct: 28.4,
      drawdown: 5.2,
      status: "active",
    },
    {
      user: "Mike Chen",
      email: "mike@email.com",
      capital: "$25,000",
      phase: "Phase 1",
      daysLeft: 0,
      totalDays: 14,
      trades: 2,
      profitPct: -8.3,
      drawdown: 18.1,
      status: "failed",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Test Accounts</h1>
        <p className="text-[#a1a1aa] mt-1 text-sm">Monitor evaluation phases and challenge progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <TestTube className="text-[#3b82f6]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Active Tests</span>
          </div>
          <div className="text-2xl font-bold text-white">2</div>
        </div>
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-[#22c55e]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Passed</span>
          </div>
          <div className="text-2xl font-bold text-white">0</div>
        </div>
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="text-[#ef4444]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Failed</span>
          </div>
          <div className="text-2xl font-bold text-white">1</div>
        </div>
      </div>

      <div className="space-y-4">
        {testAccounts.map((acc, idx) => (
          <div key={idx} className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-white">{acc.user}</h3>
                <p className="text-xs text-[#a1a1aa]">{acc.email} • {acc.capital} Capital</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1e3a8a]/40 text-[#60a5fa] border border-[#1e3a8a]">
                  {acc.phase}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  acc.status === "active"
                    ? "bg-[#064e3b]/50 text-[#34d399] border border-[#064e3b]"
                    : "bg-[#7f1d1d]/50 text-[#f87171] border border-[#7f1d1d]"
                }`}>
                  {acc.status === "active" ? "Active" : "Failed"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-[#141923] border border-[#1f2937] rounded-lg p-3">
                <p className="text-[10px] text-[#a1a1aa] mb-0.5">Days Left</p>
                <p className="text-sm font-bold text-white flex items-center gap-1">
                  <Clock size={12} className="text-[#a1a1aa]" /> {acc.daysLeft}/{acc.totalDays}
                </p>
              </div>
              <div className="bg-[#141923] border border-[#1f2937] rounded-lg p-3">
                <p className="text-[10px] text-[#a1a1aa] mb-0.5">Trades</p>
                <p className="text-sm font-bold text-white">{acc.trades} / 4 min</p>
              </div>
              <div className="bg-[#141923] border border-[#1f2937] rounded-lg p-3">
                <p className="text-[10px] text-[#a1a1aa] mb-0.5">Profit</p>
                <p className={`text-sm font-bold ${acc.profitPct >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                  {acc.profitPct >= 0 ? "+" : ""}{acc.profitPct}%
                </p>
              </div>
              <div className="bg-[#141923] border border-[#1f2937] rounded-lg p-3">
                <p className="text-[10px] text-[#a1a1aa] mb-0.5">Target</p>
                <p className="text-sm font-bold text-[#10b981]">25%</p>
              </div>
              <div className="bg-[#141923] border border-[#1f2937] rounded-lg p-3">
                <p className="text-[10px] text-[#a1a1aa] mb-0.5">Drawdown</p>
                <p className={`text-sm font-bold ${acc.drawdown > 10 ? "text-[#ef4444]" : "text-[#eab308]"}`}>
                  {acc.drawdown}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-[#a1a1aa]">Progress to target (25%)</span>
                <span className="text-[10px] text-white font-medium">{Math.max(0, Math.round((acc.profitPct / 25) * 100))}%</span>
              </div>
              <div className="w-full h-2 bg-[#1f2937] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${acc.profitPct >= 25 ? "bg-[#10b981]" : acc.profitPct >= 0 ? "bg-[#3b82f6]" : "bg-[#ef4444]"}`}
                  style={{ width: `${Math.max(0, Math.min(100, (acc.profitPct / 25) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
