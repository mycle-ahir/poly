"use client";

import { useState, useEffect } from "react";
import { Wallet, ArrowDownRight, CheckCircle2, Clock, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserDepositsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const res = await fetch("/api/deposits", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.deposits) {
          setTransactions(data.deposits);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  return (
    <div className="max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center border border-[#10b981]/30">
            <Wallet className="text-[#10b981]" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Deposit History</h1>
            <p className="text-[#a1a1aa] mt-0.5 text-xs">View all your deposit transactions</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/user/deposit")}
          className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Plus size={16} /> New Deposit
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-[#a1a1aa]">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 bg-[#111827] border border-[#1f2937] rounded-xl">
            <Wallet className="mx-auto text-[#374151] mb-3" size={32} />
            <p className="text-sm text-[#a1a1aa]">No deposit transactions found.</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex items-center justify-between hover:border-[#374151] transition-colors relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${tx.status === "COMPLETED" ? "bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.5)]" : tx.status === "REJECTED" ? "bg-red-500" : "bg-yellow-500"}`}></div>
              
              <div className="flex items-center gap-4 pl-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === "COMPLETED" ? "bg-[#10b981]/10" : "bg-[#1f2937]"}`}>
                  <ArrowDownRight className={tx.status === "COMPLETED" ? "text-[#10b981]" : "text-white"} size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {tx.cryptocurrency} via {tx.blockchain}
                  </h3>
                  <p className="text-[11px] text-[#a1a1aa]">{new Date(tx.createdAt).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5 max-w-[200px] truncate">{tx.txHash}</p>
                </div>
              </div>

              <div className="text-right">
                <h3 className="text-lg font-bold text-white mb-1">
                  ${tx.order?.finalPrice || "---"}
                </h3>
                <div className={`flex items-center gap-1.5 justify-end text-[10px] font-medium px-2.5 py-1 rounded-full ${
                  tx.status === "COMPLETED" ? "text-[#10b981] bg-[#10b981]/10" : 
                  tx.status === "REJECTED" ? "text-red-500 bg-red-500/10" : 
                  "text-yellow-500 bg-yellow-500/10"
                }`}>
                  {tx.status === "COMPLETED" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {tx.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
