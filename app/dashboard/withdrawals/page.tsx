import {
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  X,
  AlertCircle
} from "lucide-react";

export default function WithdrawalsPage() {
  const pendingWithdrawals = [
    {
      id: "WD001",
      user: "John Smith",
      userId: "U001",
      crypto: "USDT",
      blockchain: "TRC20",
      amount: "10000 USDT",
      requested: "Apr 24, 2026, 03:30 GMT",
      wallet: "TXYZuser1234567890ABCDEFGHIJ",
      eligibility: {
        passed: true,
        title: "Eligibility Check Passed",
        desc: "User meets all withdrawal requirements. Safe to approve.",
      }
    },
    {
      id: "WD002",
      user: "Michael Chen",
      userId: "U003",
      crypto: "BTC",
      blockchain: "Bitcoin",
      amount: "0.05 BTC",
      requested: "Apr 24, 2026, 05:00 GMT",
      wallet: "1UserWallet1234567890ABCDEFaser",
      eligibility: {
        passed: false,
        title: "Eligibility Check Failed",
        desc: "Profit below 20% minimum for bi-weekly withdrawal",
      }
    },
    {
      id: "WD003",
      user: "Sarah Johnson",
      userId: "U002",
      crypto: "ETH",
      blockchain: "Ethereum",
      amount: "1.5 ETH",
      requested: "Apr 24, 2026, 05:45 GMT",
      wallet: "0xUSER1234567890abcdef1234567890USER12",
      eligibility: {
        passed: true,
        title: "Eligibility Check Passed",
        desc: "User meets all withdrawal requirements. Safe to approve.",
      }
    },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Withdrawal Management</h1>
        <p className="text-[#a1a1aa] mt-1 text-sm">Review and approve user withdrawal requests</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-[#eab308]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Pending</span>
          </div>
          <div className="text-2xl font-bold text-white">3</div>
        </div>
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-[#22c55e]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Approved</span>
          </div>
          <div className="text-2xl font-bold text-white">0</div>
        </div>
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-center h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="text-[#ef4444]" size={16} />
            <span className="text-[#a1a1aa] text-sm font-medium">Rejected</span>
          </div>
          <div className="text-2xl font-bold text-white">0</div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white pt-2">Pending Withdrawals</h2>

      {/* Withdrawal Cards */}
      <div className="space-y-6">
        {pendingWithdrawals.map((wd, idx) => (
          <div key={idx} className="p-6 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col gap-5">
            {/* 3 Columns Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: User Details */}
              <div>
                <p className="text-[#a1a1aa] text-xs font-medium mb-3">User Details</p>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">{wd.user}</p>
                  <p className="text-xs text-[#a1a1aa]">User ID: {wd.userId}</p>
                  <p className="text-xs text-[#a1a1aa]">Withdrawal ID: {wd.id}</p>
                </div>
              </div>

              {/* Column 2: Withdrawal Details */}
              <div>
                <p className="text-[#a1a1aa] text-xs font-medium mb-3">Withdrawal Details</p>
                <div className="grid grid-cols-[80px_1fr] gap-y-1.5 text-xs">
                  <span className="text-[#a1a1aa]">Crypto:</span>
                  <span className="font-semibold text-white">{wd.crypto}</span>
                  
                  <span className="text-[#a1a1aa]">Blockchain:</span>
                  <span className="font-semibold text-white">{wd.blockchain}</span>
                  
                  <span className="text-[#a1a1aa]">Amount:</span>
                  <span className="font-semibold text-[#22c55e]">{wd.amount}</span>
                  
                  <span className="text-[#a1a1aa]">Requested:</span>
                  <span className="font-semibold text-white">{wd.requested}</span>
                </div>
              </div>

              {/* Column 3: Destination Wallet */}
              <div>
                <p className="text-[#a1a1aa] text-xs font-medium mb-3">Destination Wallet</p>
                <div className="flex items-center bg-[#141923] border border-[#1f2937] rounded-md px-3 py-2">
                  <input
                    type="text"
                    readOnly
                    value={wd.wallet}
                    className="bg-transparent border-none outline-none text-white text-[11px] w-full font-mono overflow-hidden text-ellipsis"
                  />
                  <button className="text-[#a1a1aa] hover:text-white transition-colors ml-2 shrink-0">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Eligibility Check Box */}
            <div>
              <p className="text-[#a1a1aa] text-xs font-medium mb-2">Eligibility Check</p>
              <div
                className={`rounded-lg p-3 flex items-center gap-3 border ${
                  wd.eligibility.passed 
                    ? "bg-[#064e3b]/30 border-[#064e3b]" 
                    : "bg-[#7f1d1d]/30 border-[#7f1d1d]"
                }`}
              >
                {wd.eligibility.passed ? (
                  <CheckCircle2 className="text-[#22c55e] shrink-0" size={18} />
                ) : (
                  <XCircle className="text-[#ef4444] shrink-0" size={18} />
                )}
                <div>
                  <p className={`text-xs font-semibold ${wd.eligibility.passed ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                    {wd.eligibility.title}
                  </p>
                  <p className={`text-[11px] ${wd.eligibility.passed ? "text-[#34d399]/70" : "text-[#f87171]/70"}`}>
                    {wd.eligibility.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <button
                disabled={!wd.eligibility.passed}
                className={`py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  wd.eligibility.passed
                    ? "bg-[#10b981] hover:bg-[#059669] text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-[#1f2937] text-[#6b7280] cursor-not-allowed border border-[#374151]"
                }`}
              >
                <Check size={16} />
                Approve Withdrawal
              </button>
              <button className="bg-[#f43f5e] hover:bg-[#e11d48] text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                <X size={16} />
                Reject Withdrawal
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Sections: Recently Approved & Rejected */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Recently Approved</h3>
          <div className="h-[100px] rounded-xl bg-[#0e1217] border border-[#1f2937] flex items-center justify-center">
            <span className="text-[#a1a1aa] text-xs">No approved withdrawals yet</span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Recently Rejected</h3>
          <div className="h-[100px] rounded-xl bg-[#0e1217] border border-[#1f2937] flex items-center justify-center">
            <span className="text-[#a1a1aa] text-xs">No rejected withdrawals</span>
          </div>
        </div>
      </div>

      {/* Eligibility Requirements Box */}
      <div className="p-6 rounded-xl bg-[#0e1217] border border-[#1f2937] mt-6">
        <h3 className="text-sm font-semibold text-white mb-5">Withdrawal Eligibility Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xs font-semibold text-[#10b981] mb-3">Bi-Weekly Withdrawals</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <div className="w-1 h-1 rounded-full bg-[#10b981]" /> Minimum 20% profit required
              </li>
              <li className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <div className="w-1 h-1 rounded-full bg-[#10b981]" /> Account must be active
              </li>
              <li className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <div className="w-1 h-1 rounded-full bg-[#10b981]" /> No pending rule violations
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#10b981] mb-3">Auto-Rejection Rules</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <div className="w-1 h-1 rounded-full bg-[#10b981]" /> Profit below 20% threshold
              </li>
              <li className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <div className="w-1 h-1 rounded-full bg-[#10b981]" /> Account suspended or restricted
              </li>
              <li className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <div className="w-1 h-1 rounded-full bg-[#10b981]" /> Active rule violations
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
