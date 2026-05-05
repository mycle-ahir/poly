"use client";

import { useState, useEffect } from "react";
import { ArrowDownToLine, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EligibilityCheck {
  rule: string;
  passed: boolean;
  detail: string;
}

interface EligibilityData {
  eligible: boolean;
  checks: EligibilityCheck[];
}

export default function UserWithdrawalsPage() {
  const [crypto, setCrypto] = useState("USDT");
  const [network, setNetwork] = useState("ERC20");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [account, setAccount] = useState<any>(null);
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    fetchEligibility();
  }, []);

  const fetchEligibility = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // 1. Get user accounts
      const accountsRes = await fetch("/api/withdrawals/eligibility", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const accountsData = await accountsRes.json();
      
      if (accountsData.accounts && accountsData.accounts.length > 0) {
        const activeAccount = accountsData.accounts[0]; // Take first active account for now
        setAccount(activeAccount);

        // 2. Get eligibility for this account
        const eligibilityRes = await fetch(`/api/withdrawals/eligibility?accountId=${activeAccount.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const eligibilityData = await eligibilityRes.json();
        
        setEligibility(eligibilityData.eligibility);
        setProfit(eligibilityData.profit);
      } else {
        setAccount(null);
      }
    } catch (error) {

      console.error("Error fetching eligibility:", error);
      toast.error("Failed to load account data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!account) {
      toast.error("No active account found");
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > profit) {
      toast.error(`Max withdrawal amount is $${profit.toFixed(2)}`);
      return;
    }

    if (!walletAddress) {
      toast.error("Please enter a wallet address");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          accountId: account.id,
          cryptocurrency: crypto,
          blockchain: network,
          walletAddress,
          amount: parseFloat(amount),
        }),
      });


      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Withdrawal request submitted");
        setAmount("");
        setWalletAddress("");
        fetchEligibility(); // Refresh status
      } else {
        toast.error(data.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch("/api/withdrawals", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.withdrawals || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-[#a1a1aa]">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm">Loading withdrawal details...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#1f2937] flex items-center justify-center mb-6">
          <AlertCircle className="text-[#a1a1aa]" size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Active Funded Account</h2>
        <p className="text-[#a1a1aa] text-sm mb-6">
          You need an active funded account to request withdrawals. Complete a challenge or purchase an instant account to get started.
        </p>
        <a href="/user/purchase" className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all">
          Get Started
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center border border-[#10b981]/30">
            <ArrowDownToLine className="text-[#10b981]" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Request Withdrawal</h1>
            <p className="text-[#a1a1aa] mt-0.5 text-xs">Request payout for your trading profits</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left Column - Form */}
          <div className="flex-1 bg-[#111827] border border-[#1f2937] rounded-xl p-6 w-full">
            <h2 className="text-sm font-semibold text-white mb-5">Withdrawal Details</h2>
            
            <div className="space-y-6">
              {/* Crypto */}
              <div>
                <p className="text-[11px] text-[#a1a1aa] mb-2">Select Cryptocurrency</p>
                <div className="grid grid-cols-4 gap-2">
                  {["USDT", "USDC", "ETH", "BTC"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCrypto(c)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        crypto === c 
                          ? "bg-[#10b981]/10 border-[#10b981] text-[#10b981]" 
                          : "bg-[#0B0F17] border-[#1f2937] text-[#a1a1aa] hover:border-[#374151]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Network */}
              <div>
                <p className="text-[11px] text-[#a1a1aa] mb-2">Select Blockchain</p>
                <div className="grid grid-cols-3 gap-2">
                  {["ERC20", "TRC20", "BEP20"].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNetwork(n)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        network === n 
                          ? "bg-[#10b981]/10 border-[#10b981] text-[#10b981]" 
                          : "bg-[#0B0F17] border-[#1f2937] text-[#a1a1aa] hover:border-[#374151]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <p className="text-[11px] text-[#a1a1aa] mb-2">Withdrawal Amount</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] text-sm">$</span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg pl-7 pr-3 py-2.5 text-sm text-white placeholder-[#374151] focus:outline-none focus:border-[#10b981] transition-colors"
                  />
                </div>
                <p className="text-[10px] text-[#10b981] mt-1.5">Available: ${profit.toLocaleString()} (Profit only)</p>
              </div>

              {/* Wallet Address */}
              <div>
                <p className="text-[11px] text-[#a1a1aa] mb-2">Wallet Address</p>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-[#0B0F17] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#374151] focus:outline-none focus:border-[#10b981] transition-colors font-mono"
                />
              </div>
              
              <button 
                onClick={handleSubmit}
                disabled={submitting || !eligibility?.eligible}
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] mt-2 ${
                  submitting || !eligibility?.eligible
                    ? "bg-[#1f2937] text-[#4b5563] cursor-not-allowed border border-[#374151]"
                    : "bg-[#10b981] hover:bg-[#059669] text-black"
                }`}
              >
                {submitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Submit Withdrawal Request"}
              </button>
              {!eligibility?.eligible && (
                <p className="text-[10px] text-center text-red-500 mt-2">You must meet all rules below to withdraw.</p>
              )}
            </div>
          </div>

          {/* Right Column - Rules */}
          <div className="w-full md:w-[320px] bg-[#111827] border border-[#1f2937] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
              <CheckCircle2 className="text-[#10b981]" size={16} /> Withdrawal Rules
            </h2>
            
            <div className="space-y-3">
              {eligibility?.checks.map((rule, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-lg p-3 border transition-colors ${
                    rule.passed 
                      ? "bg-[#064e3b]/20 border-[#10b981]/30" 
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {rule.passed ? (
                      <CheckCircle2 className="text-[#10b981] shrink-0 mt-0.5" size={14} />
                    ) : (
                      <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
                    )}
                    <div>
                      <h3 className={`text-xs font-semibold ${rule.passed ? "text-[#34d399]" : "text-red-400"}`}>
                        {rule.rule}
                      </h3>
                      <p className={`text-[10px] mt-0.5 ${rule.passed ? "text-[#10b981]/80" : "text-red-400/80"}`}>
                        {rule.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#1f2937]">
          <h2 className="text-sm font-semibold text-white">Withdrawal History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F17] text-[#a1a1aa] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Asset</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Wallet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#4b5563]">
                    No withdrawal requests yet.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1f2937]/30 transition-colors">
                    <td className="px-6 py-4 text-white">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">${item.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[#a1a1aa]">
                      {item.cryptocurrency} ({item.blockchain})
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        item.status === "APPROVED" ? "bg-green-500/20 text-green-500" :
                        item.status === "PENDING" ? "bg-yellow-500/20 text-yellow-500" :
                        "bg-red-500/20 text-red-500"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[#4b5563]">
                      {item.walletAddress.substring(0, 6)}...{item.walletAddress.substring(item.walletAddress.length - 4)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

