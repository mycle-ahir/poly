"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, Eye, Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DepositApprovalsPage() {
  const router = useRouter();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchDeposits = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return router.push("/user/login");

      const res = await fetch("/api/admin/deposits", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) return router.push("/user/login");

      const data = await res.json();
      if (data.deposits) {
        setDeposits(data.deposits);
        
        let p = 0, a = 0, r = 0;
        data.deposits.forEach((d: any) => {
          if (d.status === "PENDING") p++;
          if (d.status === "APPROVED") a++;
          if (d.status === "REJECTED") r++;
        });
        setStats({ pending: p, approved: a, rejected: r });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (depositId: string, action: "APPROVE" | "REJECT") => {
    if (!confirm(`Are you sure you want to ${action} this deposit?`)) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/admin/deposits", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ depositId, action, rejectionReason: action === "REJECT" ? "Admin rejected via dashboard" : undefined }),
      });

      if (res.ok) {
        alert(`Deposit ${action.toLowerCase()}ed successfully.`);
        fetchDeposits();
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${action} deposit`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingDeposits = deposits.filter(d => d.status === "PENDING");
  const approvedDeposits = deposits.filter(d => d.status === "APPROVED").slice(0, 5); // Just show top 5 recently
  const rejectedDeposits = deposits.filter(d => d.status === "REJECTED").slice(0, 5);

  return (
    <div className="space-y-6 max-w-[1200px] pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Deposit Approvals</h1>
        <p className="text-[#a1a1aa] mt-1 text-sm">Review and approve user deposit requests</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-[#eab308]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Pending</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.pending}</div>
        </div>
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-[#22c55e]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Approved</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.approved}</div>
        </div>
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="text-[#ef4444]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Rejected</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.rejected}</div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white pt-2">Pending Deposits</h2>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-[#10b981]" size={32} />
        </div>
      ) : pendingDeposits.length === 0 ? (
        <div className="p-8 text-center text-[#a1a1aa] bg-[#0e1217] rounded-xl border border-[#1f2937]">
          No pending deposits to review.
        </div>
      ) : (
        <div className="space-y-6">
          {pendingDeposits.map((deposit) => (
            <div key={deposit.id} className="p-6 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: User Details */}
                <div>
                  <p className="text-[#a1a1aa] text-xs font-medium mb-3">User Details</p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{deposit.user?.fullName || "No Name"}</p>
                    <p className="text-xs text-[#a1a1aa]">Email: {deposit.user?.email}</p>
                    <p className="text-xs text-[#a1a1aa]">Order ID: {deposit.order?.hashId || deposit.orderId}</p>
                    <div className="pt-1">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          deposit.order?.accountType === "INSTANT"
                            ? "bg-[#1e3a8a]/40 text-[#60a5fa] border border-[#1e3a8a]"
                            : "bg-[#064e3b]/40 text-[#34d399] border border-[#064e3b]"
                        }`}
                      >
                        {deposit.order?.accountType?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Transaction Details */}
                <div>
                  <p className="text-[#a1a1aa] text-xs font-medium mb-3">Transaction Details</p>
                  <div className="grid grid-cols-[80px_1fr] gap-y-1.5 text-xs">
                    <span className="text-[#a1a1aa]">Crypto:</span>
                    <span className="font-semibold text-white">{deposit.cryptocurrency}</span>
                    
                    <span className="text-[#a1a1aa]">Blockchain:</span>
                    <span className="font-semibold text-white">{deposit.blockchain}</span>
                    
                    <span className="text-[#a1a1aa]">Account Size:</span>
                    <span className="font-semibold text-[#22c55e]">${deposit.order?.capitalSize?.toLocaleString()}</span>
                    
                    <span className="text-[#a1a1aa]">Amount Paid:</span>
                    <span className="font-semibold text-[#3b82f6]">${deposit.order?.finalPrice}</span>
                    
                    <span className="text-[#a1a1aa]">Time:</span>
                    <span className="font-semibold text-white">{new Date(deposit.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Column 3: Verification */}
                <div>
                  <p className="text-[#a1a1aa] text-xs font-medium mb-3">Verification</p>
                  <div className="bg-[#141923] border border-[#1f2937] rounded-md p-3 mb-3 break-all">
                    <p className="text-[#a1a1aa] text-[10px] mb-1">Hash ID</p>
                    <p className="text-xs text-white font-mono">{deposit.txHash}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction(deposit.id, "APPROVE")}
                  className="bg-[#10b981] hover:bg-[#059669] text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <Check size={16} />
                  Approve Deposit
                </button>
                <button 
                  onClick={() => handleAction(deposit.id, "REJECT")}
                  className="bg-[#f43f5e] hover:bg-[#e11d48] text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                >
                  <X size={16} />
                  Reject Deposit
                </button>
              </div>

              {/* Bottom Info Box */}
              <div className="bg-[#1e3a8a]/20 border border-[#1e3a8a]/50 rounded-lg p-3 text-xs flex items-center">
                <span className="text-[#60a5fa]">
                  <strong className="font-semibold">{deposit.order?.accountType === "INSTANT" ? "Instant Account" : "Test Account"}: </strong>
                  Capital will be added directly to the user's trading account upon approval.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Sections: Recently Approved & Rejected */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Recently Approved</h3>
          {approvedDeposits.length === 0 ? (
             <div className="h-24 rounded-lg bg-[#0e1217] border border-[#1f2937] flex items-center justify-center">
              <span className="text-[#a1a1aa] text-xs">No approved deposits</span>
             </div>
          ) : (
            <div className="space-y-3">
              {approvedDeposits.map(d => (
                <div key={d.id} className="p-3 rounded-lg bg-[#0e1217] border border-[#1f2937] flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{d.user?.fullName}</span>
                    <span className="text-[#a1a1aa]">{d.order?.hashId}</span>
                  </div>
                  <span className="text-[#34d399] font-medium">${d.order?.finalPrice}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Recently Rejected</h3>
          {rejectedDeposits.length === 0 ? (
            <div className="h-24 rounded-lg bg-[#0e1217] border border-[#1f2937] flex items-center justify-center">
              <span className="text-[#a1a1aa] text-xs">No rejected deposits</span>
            </div>
          ) : (
             <div className="space-y-3">
              {rejectedDeposits.map(d => (
                <div key={d.id} className="p-3 rounded-lg bg-[#0e1217] border border-[#1f2937] flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{d.user?.fullName}</span>
                    <span className="text-[#a1a1aa]">{d.order?.hashId}</span>
                  </div>
                  <span className="text-[#f87171] font-medium">${d.order?.finalPrice}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
