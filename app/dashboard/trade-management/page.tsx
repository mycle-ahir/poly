"use client";

import { useState, useEffect } from "react";
import { Trophy, CheckCircle2, XCircle, Clock, AlertCircle, Loader2, Plus, Trash2, X, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TradeManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("trades");
  const [trades, setTrades] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showAddMarket, setShowAddMarket] = useState(false);
  const [matchForm, setMatchForm] = useState({ league: "", team1Name: "", team1Odds: "", team2Name: "", team2Odds: "", drawOdds: "", startTime: "", isLive: false });
  const [marketForm, setMarketForm] = useState({ category: "Crypto", question: "", endDate: "", yesOdds: "", noOdds: "", volume: "" });

  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  };

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [tRes, mRes, mkRes] = await Promise.all([
        fetch("/api/admin/trades", { headers: getHeaders() }),
        fetch("/api/admin/matches", { headers: getHeaders() }),
        fetch("/api/admin/markets", { headers: getHeaders() }),
      ]);
      const [tData, mData, mkData] = await Promise.all([tRes.json(), mRes.json(), mkRes.json()]);
      if (tData.trades) setTrades(tData.trades);
      if (mData.matches) setMatches(mData.matches);
      if (mkData.markets) setMarkets(mkData.markets);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const resolveTrade = async (tradeId: string, action: "WON" | "LOST" | "VOID") => {
    if (!confirm(`Mark trade as ${action}?`)) return;
    setResolvingId(tradeId);
    try {
      const res = await fetch("/api/admin/trades", { method: "PUT", headers: getHeaders(), body: JSON.stringify({ tradeId, action }) });
      if (res.ok) fetchAll(); else alert((await res.json()).error || "Failed");
    } catch (e) { alert("Error"); }
    setResolvingId(null);
  };

  const resolveMatchBulk = async (matchId: string, winningSelection: string) => {
    if (!confirm(`Resolve match with "${winningSelection}" as the winner? This will settle all pending trades.`)) return;
    setResolvingId(matchId);
    try {
      const res = await fetch("/api/admin/matches/resolve", { method: "POST", headers: getHeaders(), body: JSON.stringify({ matchId, winningSelection }) });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchAll();
      } else {
        alert(data.error || "Failed");
      }
    } catch (e) { alert("Error"); }
    setResolvingId(null);
  };

  const resolveMarketBulk = async (marketId: string, winningSelection: string) => {
    if (!confirm(`Resolve market with "${winningSelection}" as the winner? This will settle all pending trades.`)) return;
    setResolvingId(marketId);
    try {
      const res = await fetch("/api/admin/markets/resolve", { method: "POST", headers: getHeaders(), body: JSON.stringify({ marketId, winningSelection }) });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchAll();
      } else {
        alert(data.error || "Failed");
      }
    } catch (e) { alert("Error"); }
    setResolvingId(null);
  };

  const createMatch = async () => {
    if (!matchForm.league || !matchForm.team1Name || !matchForm.team2Name || !matchForm.team1Odds || !matchForm.team2Odds || !matchForm.startTime) return alert("Fill all required fields");
    try {
      const res = await fetch("/api/admin/matches", { method: "POST", headers: getHeaders(), body: JSON.stringify(matchForm) });
      if (res.ok) { setShowAddMatch(false); setMatchForm({ league: "", team1Name: "", team1Odds: "", team2Name: "", team2Odds: "", drawOdds: "", startTime: "", isLive: false }); fetchAll(); }
      else alert((await res.json()).error || "Failed");
    } catch (e) { alert("Error"); }
  };

  const deleteMatch = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    await fetch(`/api/admin/matches?matchId=${id}`, { method: "DELETE", headers: getHeaders() });
    fetchAll();
  };

  const toggleMatchLive = async (id: string, isLive: boolean) => {
    await fetch("/api/admin/matches", { method: "PUT", headers: getHeaders(), body: JSON.stringify({ matchId: id, isLive: !isLive }) });
    fetchAll();
  };

  const createMarket = async () => {
    if (!marketForm.question || !marketForm.endDate || !marketForm.yesOdds || !marketForm.noOdds) return alert("Fill all required fields");
    try {
      const res = await fetch("/api/admin/markets", { method: "POST", headers: getHeaders(), body: JSON.stringify(marketForm) });
      if (res.ok) { setShowAddMarket(false); setMarketForm({ category: "Crypto", question: "", endDate: "", yesOdds: "", noOdds: "", volume: "" }); fetchAll(); }
      else alert((await res.json()).error || "Failed");
    } catch (e) { alert("Error"); }
  };

  const deleteMarket = async (id: string) => {
    if (!confirm("Delete this market?")) return;
    await fetch(`/api/admin/markets?marketId=${id}`, { method: "DELETE", headers: getHeaders() });
    fetchAll();
  };

  const pendingTrades = trades.filter((t) => t.outcome === "PENDING");
  const resolvedTrades = trades.filter((t) => t.outcome !== "PENDING");

  const inputCls = "w-full bg-[#141923] border border-[#1f2937] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10b981]";
  const labelCls = "text-xs text-[#a1a1aa] mb-1 block";

  return (
    <div className="space-y-6 max-w-[1200px] pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Trade Management</h1>
        <p className="text-[#a1a1aa] mt-1 text-sm">Create events, manage bets, and resolve trades</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-[#1f2937]">
        {[
          { key: "trades", label: `Pending Trades (${pendingTrades.length})`, icon: <Clock size={16} /> },
          { key: "resolved", label: `Resolved (${resolvedTrades.length})`, icon: <CheckCircle2 size={16} /> },
          { key: "matches", label: `Sports Matches (${matches.length})`, icon: <Trophy size={16} /> },
          { key: "markets", label: `Predictions (${markets.length})`, icon: <Globe size={16} /> },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === tab.key ? "text-[#10b981]" : "text-[#a1a1aa] hover:text-white"}`}>
            {tab.icon} {tab.label}
            {activeTab === tab.key && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#10b981] shadow-[0_0_8px_#10b981]" />}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-[#10b981]" size={32} /></div>
      ) : (
        <>
          {/* ─── PENDING TRADES ─── */}
          {activeTab === "trades" && (
            <div className="space-y-4">
              {pendingTrades.length === 0 ? (
                <div className="text-center py-20 bg-[#0e1217] border border-[#1f2937] rounded-xl"><p className="text-sm text-[#a1a1aa]">No pending trades.</p></div>
              ) : pendingTrades.map((trade) => (
                <div key={trade.id} className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">{trade.matchTitle}</h3>
                    <p className="text-xs text-[#a1a1aa] mt-1">User: <span className="text-white">{trade.account?.user?.email || "?"}</span> • {new Date(trade.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-[#111827] px-4 py-2 rounded-lg border border-[#1f2937]">
                    <div className="text-center"><p className="text-[10px] text-[#a1a1aa]">Selection</p><p className="text-sm font-bold text-white">{trade.selection}</p></div>
                    <div className="w-px h-6 bg-[#1f2937]" />
                    <div className="text-center"><p className="text-[10px] text-[#a1a1aa]">Stake</p><p className="text-sm font-bold text-white">${trade.stake} <span className="text-[#10b981]">@{trade.odds}</span></p></div>
                    <div className="w-px h-6 bg-[#1f2937]" />
                    <div className="text-center"><p className="text-[10px] text-[#a1a1aa]">Payout</p><p className="text-sm font-bold text-[#10b981]">${trade.potentialPayout}</p></div>
                  </div>
                  <div className="flex flex-col items-end gap-2 min-w-[140px]">
                    {resolvingId === trade.id ? <Loader2 className="animate-spin text-[#10b981]" size={20} /> : (
                      <>
                        <div className="flex gap-2 w-full">
                          <button onClick={() => resolveTrade(trade.id, "WON")} className="flex-1 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/50 py-2 rounded-lg text-xs font-bold">WON</button>
                          <button onClick={() => resolveTrade(trade.id, "LOST")} className="flex-1 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/50 py-2 rounded-lg text-xs font-bold">LOST</button>
                        </div>
                        <button onClick={() => resolveTrade(trade.id, "VOID")} className="text-[10px] text-[#a1a1aa] hover:text-white">Void (Refund)</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── RESOLVED TRADES ─── */}
          {activeTab === "resolved" && (
            <div className="space-y-4">
              {resolvedTrades.length === 0 ? (
                <div className="text-center py-20 bg-[#0e1217] border border-[#1f2937] rounded-xl"><p className="text-sm text-[#a1a1aa]">No resolved trades yet.</p></div>
              ) : resolvedTrades.map((trade) => (
                <div key={trade.id} className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">{trade.matchTitle}</h3>
                    <p className="text-xs text-[#a1a1aa] mt-1">User: {trade.account?.user?.email || "?"} • Settled: {trade.settledAt ? new Date(trade.settledAt).toLocaleString() : "—"}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-[#111827] px-4 py-2 rounded-lg border border-[#1f2937]">
                    <div className="text-center"><p className="text-[10px] text-[#a1a1aa]">Selection</p><p className="text-sm font-bold text-white">{trade.selection}</p></div>
                    <div className="w-px h-6 bg-[#1f2937]" />
                    <div className="text-center"><p className="text-[10px] text-[#a1a1aa]">Stake</p><p className="text-sm font-bold text-white">${trade.stake}</p></div>
                    <div className="w-px h-6 bg-[#1f2937]" />
                    <div className="text-center"><p className="text-[10px] text-[#a1a1aa]">P&L</p><p className={`text-sm font-bold ${trade.pnl >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>{trade.pnl >= 0 ? "+" : ""}${trade.pnl}</p></div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${trade.outcome === "WON" ? "bg-[#10b981]/20 text-[#10b981]" : trade.outcome === "LOST" ? "bg-[#ef4444]/20 text-[#ef4444]" : "bg-[#f59e0b]/20 text-[#f59e0b]"}`}>
                    {trade.outcome === "WON" && <CheckCircle2 size={14} />}{trade.outcome === "LOST" && <XCircle size={14} />}{trade.outcome === "VOID" && <AlertCircle size={14} />}
                    {trade.outcome}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── SPORTS MATCHES ─── */}
          {activeTab === "matches" && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Sports Matches</h2>
                <button onClick={() => setShowAddMatch(!showAddMatch)} className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16} /> Add Match</button>
              </div>

              {showAddMatch && (
                <div className="p-6 rounded-xl bg-[#0e1217] border border-[#10b981] space-y-4">
                  <div className="flex justify-between"><h3 className="font-bold text-white">New Match</h3><button onClick={() => setShowAddMatch(false)} className="text-[#a1a1aa] hover:text-white"><X size={18} /></button></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>League *</label><input value={matchForm.league} onChange={(e) => setMatchForm({...matchForm, league: e.target.value})} className={inputCls} placeholder="Premier League" /></div>
                    <div><label className={labelCls}>Start Time *</label><input type="datetime-local" value={matchForm.startTime} onChange={(e) => setMatchForm({...matchForm, startTime: e.target.value})} className={inputCls} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Team 1 *</label><input value={matchForm.team1Name} onChange={(e) => setMatchForm({...matchForm, team1Name: e.target.value})} className={inputCls} placeholder="Manchester City" /></div>
                    <div><label className={labelCls}>Team 1 Odds *</label><input type="number" step="0.01" value={matchForm.team1Odds} onChange={(e) => setMatchForm({...matchForm, team1Odds: e.target.value})} className={inputCls} placeholder="2.10" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Team 2 *</label><input value={matchForm.team2Name} onChange={(e) => setMatchForm({...matchForm, team2Name: e.target.value})} className={inputCls} placeholder="Liverpool" /></div>
                    <div><label className={labelCls}>Team 2 Odds *</label><input type="number" step="0.01" value={matchForm.team2Odds} onChange={(e) => setMatchForm({...matchForm, team2Odds: e.target.value})} className={inputCls} placeholder="1.85" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Draw Odds (optional)</label><input type="number" step="0.01" value={matchForm.drawOdds} onChange={(e) => setMatchForm({...matchForm, drawOdds: e.target.value})} className={inputCls} placeholder="3.20" /></div>
                    <div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={matchForm.isLive} onChange={(e) => setMatchForm({...matchForm, isLive: e.target.checked})} className="accent-[#10b981]" /><span className="text-sm text-white">Is Live</span></label></div>
                  </div>
                  <button onClick={createMatch} className="bg-[#10b981] hover:bg-[#059669] text-black font-bold py-2 px-6 rounded-lg">Create Match</button>
                </div>
              )}

              <div className="space-y-4">
                {matches.map((m) => (
                  <div key={m.id} className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#115e59]/40 text-[#2dd4bf] border border-[#115e59]">{m.league}</span>
                          {m.isLive && <span className="text-[10px] px-2 py-0.5 rounded bg-[#7f1d1d]/40 text-[#f87171] border border-[#7f1d1d]">LIVE</span>}
                          {!m.isActive && <span className="text-[10px] px-2 py-0.5 rounded bg-[#374151] text-[#a1a1aa]">Hidden</span>}
                        </div>
                        <h3 className="text-sm font-semibold text-white">{m.team1Name} vs {m.team2Name}</h3>
                        <p className="text-[11px] text-[#a1a1aa]">{new Date(m.startTime).toLocaleString()} • Odds: {m.team1Odds} / {m.drawOdds || "—"} / {m.team2Odds}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleMatchLive(m.id, m.isLive)} className={`text-xs px-3 py-1 rounded ${m.isLive ? "bg-[#ef4444]/20 text-[#ef4444]" : "bg-[#10b981]/20 text-[#10b981]"}`}>{m.isLive ? "End Live" : "Go Live"}</button>
                        <button onClick={() => deleteMatch(m.id)} className="text-[#ef4444] hover:text-[#dc2626]"><Trash2 size={16} /></button>
                      </div>
                      {m.isActive && (
                        <div className="flex gap-2 mt-2">
                           <span className="text-[10px] text-[#a1a1aa] flex items-center mr-1">Resolve:</span>
                           {resolvingId === m.id ? <Loader2 className="animate-spin text-[#10b981]" size={16} /> : (
                             <>
                               <button onClick={() => resolveMatchBulk(m.id, m.team1Name)} className="text-[10px] px-2 py-1 bg-[#111827] border border-[#1f2937] hover:bg-[#374151] rounded text-white">{m.team1Name}</button>
                               {m.drawOdds && <button onClick={() => resolveMatchBulk(m.id, "Draw")} className="text-[10px] px-2 py-1 bg-[#111827] border border-[#1f2937] hover:bg-[#374151] rounded text-white">Draw</button>}
                               <button onClick={() => resolveMatchBulk(m.id, m.team2Name)} className="text-[10px] px-2 py-1 bg-[#111827] border border-[#1f2937] hover:bg-[#374151] rounded text-white">{m.team2Name}</button>
                               <button onClick={() => resolveMatchBulk(m.id, "VOID")} className="text-[10px] px-2 py-1 bg-[#7f1d1d]/20 text-[#f87171] border border-[#7f1d1d] hover:bg-[#7f1d1d]/40 rounded">VOID</button>
                             </>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {matches.length === 0 && <div className="text-center py-16 bg-[#0e1217] border border-[#1f2937] rounded-xl"><p className="text-sm text-[#a1a1aa]">No matches created yet.</p></div>}
              </div>
            </>
          )}

          {/* ─── PREDICTION MARKETS ─── */}
          {activeTab === "markets" && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Prediction Markets</h2>
                <button onClick={() => setShowAddMarket(!showAddMarket)} className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16} /> Add Market</button>
              </div>

              {showAddMarket && (
                <div className="p-6 rounded-xl bg-[#0e1217] border border-[#10b981] space-y-4">
                  <div className="flex justify-between"><h3 className="font-bold text-white">New Prediction Market</h3><button onClick={() => setShowAddMarket(false)} className="text-[#a1a1aa] hover:text-white"><X size={18} /></button></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Category *</label>
                      <select value={marketForm.category} onChange={(e) => setMarketForm({...marketForm, category: e.target.value})} className={inputCls}>
                        {["Crypto", "Economics", "Politics", "Technology", "Climate", "Sports", "Science"].map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><label className={labelCls}>End Date *</label><input type="date" value={marketForm.endDate} onChange={(e) => setMarketForm({...marketForm, endDate: e.target.value})} className={inputCls} /></div>
                  </div>
                  <div><label className={labelCls}>Question *</label><input value={marketForm.question} onChange={(e) => setMarketForm({...marketForm, question: e.target.value})} className={inputCls} placeholder="Will Bitcoin reach $100,000 by end of 2026?" /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className={labelCls}>YES Odds *</label><input type="number" step="0.01" value={marketForm.yesOdds} onChange={(e) => setMarketForm({...marketForm, yesOdds: e.target.value})} className={inputCls} placeholder="1.61" /></div>
                    <div><label className={labelCls}>NO Odds *</label><input type="number" step="0.01" value={marketForm.noOdds} onChange={(e) => setMarketForm({...marketForm, noOdds: e.target.value})} className={inputCls} placeholder="2.63" /></div>
                    <div><label className={labelCls}>Volume (display)</label><input value={marketForm.volume} onChange={(e) => setMarketForm({...marketForm, volume: e.target.value})} className={inputCls} placeholder="$1.2M" /></div>
                  </div>
                  <button onClick={createMarket} className="bg-[#10b981] hover:bg-[#059669] text-black font-bold py-2 px-6 rounded-lg">Create Market</button>
                </div>
              )}

              <div className="space-y-4">
                {markets.map((m) => (
                  <div key={m.id} className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e3a8a]/40 text-[#60a5fa] border border-[#1e3a8a]">{m.category}</span>
                        <span className="text-[10px] text-[#6b7280]">Ends {new Date(m.endDate).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white">{m.question}</h3>
                      <p className="text-[11px] text-[#a1a1aa] mt-1">YES: {m.yesOdds}x • NO: {m.noOdds}x • Volume: {m.volume}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => deleteMarket(m.id)} className="text-[#ef4444] hover:text-[#dc2626]"><Trash2 size={16} /></button>
                      {m.isActive && (
                        <div className="flex gap-2 mt-2">
                           <span className="text-[10px] text-[#a1a1aa] flex items-center mr-1">Resolve:</span>
                           {resolvingId === m.id ? <Loader2 className="animate-spin text-[#10b981]" size={16} /> : (
                             <>
                               <button onClick={() => resolveMarketBulk(m.id, "YES")} className="text-[10px] px-2 py-1 bg-[#111827] border border-[#1f2937] hover:bg-[#374151] rounded text-white">YES</button>
                               <button onClick={() => resolveMarketBulk(m.id, "NO")} className="text-[10px] px-2 py-1 bg-[#111827] border border-[#1f2937] hover:bg-[#374151] rounded text-white">NO</button>
                               <button onClick={() => resolveMarketBulk(m.id, "VOID")} className="text-[10px] px-2 py-1 bg-[#7f1d1d]/20 text-[#f87171] border border-[#7f1d1d] hover:bg-[#7f1d1d]/40 rounded">VOID</button>
                             </>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {markets.length === 0 && <div className="text-center py-16 bg-[#0e1217] border border-[#1f2937] rounded-xl"><p className="text-sm text-[#a1a1aa]">No prediction markets created yet.</p></div>}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
