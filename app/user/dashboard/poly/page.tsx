"use client";

import { useState, useEffect } from "react";
import { Globe, ArrowRight, Loader2 } from "lucide-react";

const CAT_COLORS: Record<string, string> = {
  Crypto: "bg-[#f59e0b] text-white",
  Economics: "bg-[#3b82f6] text-white",
  Politics: "bg-[#8b5cf6] text-white",
  Technology: "bg-[#10b981] text-white",
  Climate: "bg-[#06b6d4] text-white",
  Sports: "bg-[#ef4444] text-white",
  Science: "bg-[#ec4899] text-white",
};

export default function PolymarketPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const [betSlip, setBetSlip] = useState<{ id: string; question: string; outcome: string; odds: number; endDate: string } | null>(null);
  const [stake, setStake] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const res = await fetch("/api/user/dashboard", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.dashboard?.hasAccount) setAccountId(data.dashboard.account.id);
      } catch (e) {}
    };
    fetchAccount();
  }, []);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await fetch("/api/markets");
        const data = await res.json();
        if (data.markets) setPredictions(data.markets);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingMarkets(false);
      }
    };
    fetchMarkets();
  }, []);

  const handleSelectBet = (id: string, question: string, outcome: string, odds: number, endDate: string) => {
    setBetSlip({ id, question, outcome, odds, endDate });
  };

  const handlePlaceBet = async () => {
    if (!accountId) return alert("You don't have an active trading account.");
    if (!betSlip || !stake || isNaN(Number(stake)) || Number(stake) <= 0) {
      alert("Please enter a valid stake amount.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          accountId,
          matchId: betSlip.id,
          matchTitle: betSlip.question,
          matchStartTime: betSlip.endDate,
          selection: betSlip.outcome,
          odds: betSlip.odds,
          stake: Number(stake),
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.reasons?.join(", ") || "Failed to place bet.");
      }

      alert("Trade placed successfully!");
      setBetSlip(null);
      setStake("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique categories for filters
  const categories = ["All", ...Array.from(new Set(predictions.map((p) => p.category)))];
  const filteredPredictions = activeFilter === "All" 
    ? predictions 
    : predictions.filter((p) => p.category === activeFilter);

  return (
    <div className="max-w-[1200px] h-full flex flex-col pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center border border-[#3b82f6]/30">
            <Globe className="text-[#3b82f6]" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Polymarket Predictions</h1>
            <p className="text-[#a1a1aa] mt-0.5 text-xs">Trade on real-world events and outcomes</p>
          </div>
        </div>
        <div className="bg-[#064e3b] border border-[#10b981]/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[#34d399]">{filteredPredictions.length} Markets</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === cat
                ? "bg-[#10b981] text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "bg-[#111827] border border-[#1f2937] text-[#a1a1aa] hover:text-white hover:border-[#374151]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoadingMarkets ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-[#10b981]" size={32} />
        </div>
      ) : filteredPredictions.length === 0 ? (
        <div className="text-center py-20 bg-[#111827] border border-[#1f2937] rounded-xl">
          <Globe className="mx-auto text-[#374151] mb-3" size={32} />
          <p className="text-sm text-[#a1a1aa]">No prediction markets available. Check back soon!</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Content (Predictions List) */}
          <div className="flex-1 space-y-4">
            {filteredPredictions.map((item) => {
              const yesPercent = Math.round((1 / item.yesOdds) * 100);
              const noPercent = 100 - yesPercent;
              const yesPrice = `${yesPercent}¢`;
              const noPrice = `${noPercent}¢`;

              return (
                <div key={item.id} className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 hover:border-[#374151] transition-colors">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase ${CAT_COLORS[item.category] || "bg-[#374151] text-white"}`}>
                        {item.category}
                      </span>
                      <span className="text-[10px] text-[#6b7280]">
                        Ends {new Date(item.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Question */}
                  <h3 className="text-sm font-semibold text-white mb-4">
                    {item.question}
                  </h3>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                      onClick={() => handleSelectBet(item.id, item.question, "YES", item.yesOdds, item.endDate)}
                      className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${
                        betSlip?.id === item.id && betSlip?.outcome === "YES" 
                          ? "bg-[#10b981]/10 border-[#10b981]" 
                          : "bg-[#0B0F17] border-[#1f2937] hover:border-[#374151]"
                      }`}
                    >
                      <span className="text-xs font-bold text-[#a1a1aa]">YES</span>
                      <div className="text-right">
                        <span className={`text-lg font-bold block leading-none ${betSlip?.id === item.id && betSlip?.outcome === "YES" ? "text-[#10b981]" : "text-white"}`}>{yesPrice}</span>
                        <span className={`text-[10px] ${betSlip?.id === item.id && betSlip?.outcome === "YES" ? "text-[#10b981]" : "text-[#6b7280]"}`}>{yesPercent}%</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleSelectBet(item.id, item.question, "NO", item.noOdds, item.endDate)}
                      className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${
                        betSlip?.id === item.id && betSlip?.outcome === "NO" 
                          ? "bg-[#ef4444]/10 border-[#ef4444]" 
                          : "bg-[#0B0F17] border-[#1f2937] hover:border-[#374151]"
                      }`}
                    >
                      <span className="text-xs font-bold text-[#a1a1aa]">NO</span>
                      <div className="text-right">
                        <span className={`text-lg font-bold block leading-none ${betSlip?.id === item.id && betSlip?.outcome === "NO" ? "text-[#ef4444]" : "text-white"}`}>{noPrice}</span>
                        <span className={`text-[10px] ${betSlip?.id === item.id && betSlip?.outcome === "NO" ? "text-[#ef4444]" : "text-[#6b7280]"}`}>{noPercent}%</span>
                      </div>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center border-t border-[#1f2937] pt-3">
                    <span className="text-[10px] text-[#6b7280]">Volume: {item.volume}</span>
                    <span className="text-[10px] font-semibold text-[#10b981]">Active</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Content (Bet Slip) */}
          <div className="w-full lg:w-[320px] bg-[#111827] border border-[#1f2937] rounded-xl p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-[#374151] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">B</span>
              </div>
              <h2 className="text-sm font-bold text-white">Bet Slip</h2>
            </div>

            {!betSlip ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center">
                <Globe className="text-[#374151] mb-3" size={32} />
                <p className="text-xs text-[#6b7280]">Select an outcome to place your bet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative pr-6">
                  <button onClick={() => setBetSlip(null)} className="absolute right-0 top-0 text-[#a1a1aa] hover:text-white">&times;</button>
                  <p className="text-[10px] text-[#6b7280] mb-1">Selected Market</p>
                  <p className="text-xs font-medium text-white mb-2 leading-snug">
                    {betSlip.question}
                  </p>
                  <div className="flex justify-between items-center bg-[#0B0F17] p-2 rounded border border-[#1f2937]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#6b7280]">Outcome:</span>
                      <span className={`${betSlip.outcome === 'YES' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'} text-[10px] font-bold px-1.5 py-0.5 rounded`}>{betSlip.outcome}</span>
                    </div>
                    <span className="text-xs text-white">{betSlip.odds.toFixed(2)}x</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#6b7280] mb-1 block">Bet Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] text-sm">$</span>
                    <input 
                      type="number" 
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#10b981] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[#1f2937]">
                  <span className="text-xs text-[#a1a1aa]">Potential Payout</span>
                  <span className="text-sm font-bold text-white">
                    ${(Number(stake || 0) * betSlip.odds).toFixed(2)}
                  </span>
                </div>

                <button 
                  onClick={handlePlaceBet}
                  disabled={isSubmitting}
                  className="w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-[#10b981]/50 text-black py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] mt-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (
                    <>Place Bet <ArrowRight size={14} /></>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
