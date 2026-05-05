"use client";

import { useState } from "react";
import { CheckCircle2, Settings, XCircle, Info } from "lucide-react";

export default function RulesConfigurationPage() {
  // Using state to make toggles interactive
  const [rules, setRules] = useState([
    {
      id: "prematch",
      title: "Pre-Match Trading Window",
      enabled: true,
      desc: "No trades within X minutes of match start",
      currentValue: "10",
      bullets: ["Prevents last-minute betting", "Ensures fair market analysis time"]
    },
    {
      id: "minweekly",
      title: "Minimum Weekly Trades",
      enabled: true,
      desc: "Minimum number of trades required per week",
      currentValue: "3",
      bullets: ["Maintains account activity", "Prevents account stagnation"]
    },
    {
      id: "maxbet",
      title: "Maximum Single Bet",
      enabled: true,
      desc: "Maximum percentage of capital per single bet",
      currentValue: "20",
      bullets: ["Protects capital from single large losses", "Enforces risk management"]
    },
    {
      id: "minodds",
      title: "Minimum Odds",
      enabled: true,
      desc: "Minimum allowed odds for any bet",
      currentValue: "1.5",
    },
    {
      id: "maxodds",
      title: "Maximum Odds",
      enabled: true,
      desc: "Maximum allowed odds for any bet",
      currentValue: "5",
    },
    {
      id: "hedging",
      title: "Hedging Protection",
      enabled: true,
      desc: "Prevents multiple bets on same trade",
      currentValue: "Enabled",
    },
    {
      id: "marketrest",
      title: "Market Type Restriction",
      enabled: true,
      desc: "Only match winner markets allowed",
      currentValue: "Match Winner Only",
    },
    {
      id: "inactivity",
      title: "Inactivity Suspension",
      enabled: true,
      desc: "Suspend account after X days of inactivity",
      currentValue: "7",
    },
    {
      id: "minwdprofit",
      title: "Minimum Withdrawal Profit",
      enabled: true,
      desc: "Minimum profit percentage for bi-weekly withdrawal",
      currentValue: "20",
      bullets: ["Ensures profitable trading before withdrawal", "Bi-weekly withdrawal eligibility"]
    },
    {
      id: "drawdownreset",
      title: "Daily Drawdown Reset",
      enabled: true,
      desc: "Reset time for daily drawdown (GMT)",
      currentValue: "00:00",
    }
  ]);

  const toggleRule = (index: number) => {
    const newRules = [...rules];
    newRules[index].enabled = !newRules[index].enabled;
    setRules(newRules);
  };

  const activeCount = rules.filter(r => r.enabled).length;
  const disabledCount = rules.length - activeCount;

  return (
    <div className="space-y-6 max-w-[1000px] pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Rules Configuration</h1>
        <p className="text-[#a1a1aa] mt-1 text-sm">Configure and manage platform trading rules and restrictions</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-[#22c55e]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Active Rules</span>
          </div>
          <div className="text-2xl font-bold text-white">{activeCount}</div>
        </div>
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="text-[#3b82f6]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Total Rules</span>
          </div>
          <div className="text-2xl font-bold text-white">{rules.length}</div>
        </div>
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="text-[#6b7280]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Disabled</span>
          </div>
          <div className="text-2xl font-bold text-white">{disabledCount}</div>
        </div>
      </div>

      {/* Rule Cards List */}
      <div className="space-y-4 pt-2">
        {rules.map((rule, idx) => (
          <div key={rule.id} className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col gap-4 transition-opacity" style={{ opacity: rule.enabled ? 1 : 0.6 }}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-semibold text-white">{rule.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    rule.enabled 
                      ? "bg-[#064e3b]/50 text-[#34d399] border border-[#064e3b]" 
                      : "bg-[#374151]/50 text-[#9ca3af] border border-[#374151]"
                  }`}>
                    {rule.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-[#a1a1aa]">{rule.desc}</p>
              </div>
              
              {/* Custom Toggle Switch */}
              <button 
                onClick={() => toggleRule(idx)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors flex ${
                  rule.enabled ? "bg-[#10b981]/20 border border-[#10b981] justify-end" : "bg-[#1f2937] border border-[#374151] justify-start"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  rule.enabled ? "bg-[#10b981]" : "bg-[#6b7280]"
                }`} />
              </button>
            </div>

            {/* Current Value Block */}
            <div className="flex items-center justify-between bg-[#141923] border border-[#1f2937] rounded-lg p-3">
              <div>
                <p className="text-[10px] text-[#a1a1aa] mb-0.5">Current Value</p>
                <p className="text-sm font-bold text-[#10b981]">{rule.currentValue}</p>
              </div>
              <button className="bg-[#1f2937] hover:bg-[#374151] text-xs text-white px-4 py-1.5 rounded transition-colors font-medium">
                Edit
              </button>
            </div>

            {/* Bullet Points (if any) */}
            {rule.bullets && rule.bullets.length > 0 && (
              <ul className="space-y-1 mt-1">
                {rule.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-center gap-2 text-[11px] text-[#a1a1aa]">
                    <div className="w-1 h-1 rounded-full bg-[#10b981]" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Rule Categories */}
      <div className="p-6 rounded-xl bg-[#0e1217] border border-[#1f2937] mt-6">
        <h3 className="text-sm font-semibold text-white mb-5">Rule Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-white flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Trading Rules
            </h4>
            <ul className="space-y-2">
              {["Pre-match trading window", "Minimum weekly trades", "Maximum single bet", "Odds restrictions"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                  <div className="w-1 h-1 rounded-full bg-[#374151]" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#10b981]" /> Protection Rules
            </h4>
            <ul className="space-y-2">
              {["Hedging protection", "Market type restriction", "Drawdown limits", "Daily reset timing"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                  <div className="w-1 h-1 rounded-full bg-[#374151]" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#14b8a6]" /> Account Rules
            </h4>
            <ul className="space-y-2">
              {["Inactivity suspension", "Withdrawal requirements", "Test account criteria", "Capital restrictions"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                  <div className="w-1 h-1 rounded-full bg-[#374151]" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-[#064e3b]/30 border border-[#064e3b] rounded-xl p-5 flex items-start gap-3 mt-4">
        <Info className="text-[#10b981] shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-sm font-semibold text-[#10b981] mb-1">Important Notice</h4>
          <p className="text-xs text-[#10b981]/80 leading-relaxed">
            Rule changes take effect immediately for all users. Ensure you understand the implications before modifying any rules. Disabled rules will not be enforced but will remain visible to admins.
          </p>
        </div>
      </div>
    </div>
  );
}
