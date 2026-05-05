"use client";

import { useState, useEffect } from "react";
import { Trophy, CircleDot, Loader2 } from "lucide-react";

export default function SportsBettingPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  const [betSlip, setBetSlip] = useState<{ matchId: string; team: string; odds: number; name: string; startTime: string } | null>(null);
  const [stake, setStake] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  // Fetch user's active account
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

  // Fetch matches from the API (admin-managed)
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
        if (data.matches) setMatches(data.matches);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingMatches(false);
      }
    };
    fetchMatches();
  }, []);

  const teamColors = [
    "bg-[#3b82f6]", "bg-[#ef4444]", "bg-[#60a5fa]", "bg-[#7f1d1d]",
    "bg-[#eab308]", "bg-[#1d4ed8]", "bg-[#dc2626]", "bg-[#2563eb]",
    "bg-[#10b981]", "bg-[#8b5cf6]", "bg-[#f59e0b]", "bg-[#06b6d4]",
  ];

  const getColor = (index: number) => teamColors[index % teamColors.length];

  const handleSelectBet = (matchId: string, team: string, odds: number, name: string, startTime: string) => {
    setBetSlip({ matchId, team, odds, name, startTime });
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
          matchId: betSlip.matchId,
          matchTitle: betSlip.name,
          matchStartTime: betSlip.startTime,
          selection: betSlip.team,
          odds: betSlip.odds,
          stake: Number(stake),
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.reasons?.join(", ") || "Failed to place bet.");
      }

      alert("Bet placed successfully!");
      setBetSlip(null);
      setStake("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const liveCount = matches.filter((m) => m.isLive).length;

  return (
    <div className="max-w-[1200px] h-full flex flex-col pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center border border-[#10b981]/30">
            <Trophy className="text-[#10b981]" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Live Matches</h1>
            <p className="text-[#a1a1aa] mt-0.5 text-xs">Place your bets on live and upcoming matches</p>
          </div>
        </div>
        {liveCount > 0 && (
          <div className="bg-[#7f1d1d]/40 border border-[#ef4444]/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse"></div>
            <span className="text-xs font-semibold text-[#ef4444]">{liveCount} Live</span>
          </div>
        )}
      </div>

      {isLoadingMatches ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-[#10b981]" size={32} />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 bg-[#111827] border border-[#1f2937] rounded-xl">
          <Trophy className="mx-auto text-[#374151] mb-3" size={32} />
          <p className="text-sm text-[#a1a1aa]">No matches available right now. Check back soon!</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Content (Matches Grid) */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match, idx) => (
              <div key={match.id} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex flex-col gap-4 hover:border-[#374151] transition-colors">
                {/* Match Header */}
                <div className="flex justify-between items-center border-b border-[#1f2937] pb-3">
                  <span className="text-xs text-[#a1a1aa] font-medium">{match.league}</span>
                  <div className="flex items-center gap-2">
                    {match.isLive && (
                      <span className="bg-[#ef4444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div> LIVE
                      </span>
                    )}
                    <span className="text-xs text-[#6b7280] flex items-center gap-1">
                      <CircleDot size={10} /> {new Date(match.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Teams */}
                <div className="space-y-3">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full ${getColor(idx * 2)} flex items-center justify-center text-[10px] font-bold text-white shadow-inner`}>
                        {match.team1Name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-white">{match.team1Name}</span>
                    </div>
                    <button 
                      onClick={() => handleSelectBet(match.id, match.team1Name, match.team1Odds, `${match.team1Name} vs ${match.team2Name}`, match.startTime)}
                      className={`font-bold text-xs px-4 py-1.5 rounded transition-colors ${
                        betSlip?.matchId === match.id && betSlip?.team === match.team1Name
                          ? "bg-[#10b981] text-black"
                          : "bg-[#10b981]/10 border border-[#10b981]/50 text-[#10b981] hover:bg-[#10b981]/20"
                      }`}
                    >
                      {match.team1Odds}
                    </button>
                  </div>

                  {/* Draw (if applicable) */}
                  {match.drawOdds && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#374151] flex items-center justify-center text-[10px] font-bold text-white">
                          DR
                        </div>
                        <span className="text-sm font-semibold text-[#a1a1aa]">Draw</span>
                      </div>
                      <button 
                        onClick={() => handleSelectBet(match.id, "Draw", match.drawOdds, `${match.team1Name} vs ${match.team2Name}`, match.startTime)}
                        className={`font-bold text-xs px-4 py-1.5 rounded transition-colors ${
                          betSlip?.matchId === match.id && betSlip?.team === "Draw"
                            ? "bg-[#10b981] text-black"
                            : "bg-[#10b981]/10 border border-[#10b981]/50 text-[#10b981] hover:bg-[#10b981]/20"
                        }`}
                      >
                        {match.drawOdds}
                      </button>
                    </div>
                  )}

                  {/* Team 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full ${getColor(idx * 2 + 1)} flex items-center justify-center text-[10px] font-bold text-white shadow-inner`}>
                        {match.team2Name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-white">{match.team2Name}</span>
                    </div>
                    <button 
                      onClick={() => handleSelectBet(match.id, match.team2Name, match.team2Odds, `${match.team1Name} vs ${match.team2Name}`, match.startTime)}
                      className={`font-bold text-xs px-4 py-1.5 rounded transition-colors ${
                        betSlip?.matchId === match.id && betSlip?.team === match.team2Name
                          ? "bg-[#10b981] text-black"
                          : "bg-[#10b981]/10 border border-[#10b981]/50 text-[#10b981] hover:bg-[#10b981]/20"
                      }`}
                    >
                      {match.team2Odds}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Content (Bet Slip) */}
          <div className="w-full lg:w-[320px] bg-[#111827] border border-[#1f2937] rounded-xl p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-[#374151] flex items-center justify-center">
                <Trophy className="text-white" size={12} />
              </div>
              <h2 className="text-sm font-bold text-white">Bet Slip</h2>
            </div>

            {!betSlip ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center">
                <Trophy className="text-[#374151] mb-3" size={32} />
                <p className="text-xs text-[#6b7280]">Select a team to place your bet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="bg-[#0e1217] rounded-lg p-3 border border-[#1f2937]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-white">{betSlip.team}</span>
                    <button onClick={() => setBetSlip(null)} className="text-[#a1a1aa] hover:text-white text-xs">&times;</button>
                  </div>
                  <p className="text-[10px] text-[#a1a1aa] mb-2">{betSlip.name}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a1a1aa]">Odds</span>
                    <span className="text-[#10b981] font-bold">{betSlip.odds}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#a1a1aa] mb-1 block">Stake Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] text-sm">$</span>
                    <input 
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#0e1217] border border-[#1f2937] rounded-lg pl-7 pr-3 py-2 text-white outline-none focus:border-[#10b981] transition-colors text-sm font-medium"
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
                  className="w-full mt-2 bg-[#10b981] hover:bg-[#059669] disabled:bg-[#10b981]/50 text-black py-2.5 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Place Bet"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
