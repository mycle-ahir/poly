"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Loader2, MoreVertical, ShieldAlert, DollarSign, BookOpen, Ban, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  
  // Action Modal State
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [newCapital, setNewCapital] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/user/login");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) router.push("/user/login");
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchUsers();
    }
  };

  const performAction = async (accountId: string, action: string, data: any = {}) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/admin/accounts`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accountId, action, ...data }),
      });

      if (!res.ok) throw new Error("Action failed");
      
      setIsCapitalModalOpen(false);
      setNewCapital("");
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to perform action");
    } finally {
      setActionLoading(false);
    }
  };

  const tableRows: any[] = [];
  users.forEach((user) => {
    if (user.accounts && user.accounts.length > 0) {
      user.accounts.forEach((acc: any) => {
        tableRows.push({ user, account: acc });
      });
    } else {
      tableRows.push({ user, account: null });
    }
  });

  return (
    <div className="space-y-6 max-w-[1200px] pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">User Management</h1>
        <p className="text-[#a1a1aa] mt-1 text-sm">View and manage all users and their trading accounts</p>
      </div>

      <div className="p-4 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by name or email (press Enter)..."
            className="w-full bg-[#141923] border border-[#1f2937] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#a1a1aa] focus:outline-none focus:border-[#3b82f6] transition-colors"
          />
        </div>
        <div className="relative w-full sm:w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#141923] border border-[#1f2937] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-[#3b82f6] transition-colors cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="TEST_ACTIVE">Test Active</option>
            <option value="RESTRICTED">Restricted</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-[#0e1217] border border-[#1f2937] rounded-xl overflow-hidden min-h-[400px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-[#0e1217]/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
          </div>
        )}
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#a1a1aa] bg-[#0e1217] border-b border-[#1f2937]">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Account Type</th>
                <th className="px-6 py-4 font-medium">Capital</th>
                <th className="px-6 py-4 font-medium">Balance</th>
                <th className="px-6 py-4 font-medium">Trades</th>
                <th className="px-6 py-4 font-medium">Win/Loss</th>
                <th className="px-6 py-4 font-medium">Drawdown</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {tableRows.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-[#a1a1aa]">
                    No users found
                  </td>
                </tr>
              )}
              {tableRows.map((row, idx) => {
                const { user, account } = row;
                
                const balanceColor = account 
                  ? (account.currentBalance >= account.capitalSize ? "text-[#10b981]" : "text-[#ef4444]")
                  : "text-[#a1a1aa]";
                
                const drawdownColor = account
                  ? (account.dailyDrawdownPct > 10 ? "text-[#ef4444]" : account.dailyDrawdownPct > 5 ? "text-[#eab308]" : "text-[#10b981]")
                  : "text-[#a1a1aa]";

                let statusColor = "bg-[#374151] text-[#9ca3af]";
                if (account) {
                  if (account.status === "ACTIVE" || account.status === "TEST_ACTIVE") statusColor = "bg-[#064e3b] text-[#34d399]";
                  else if (account.status === "RESTRICTED") statusColor = "bg-[#78350f] text-[#fbbf24]";
                  else if (account.status === "SUSPENDED" || account.status.includes("FAILED")) statusColor = "bg-[#7f1d1d] text-[#f87171]";
                }

                return (
                  <tr key={account ? account.id : `user-${user.id}`} className="hover:bg-[#141923]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{user.fullName || "No Name"}</div>
                      <div className="text-xs text-[#a1a1aa] mt-0.5">{user.email}</div>
                      {account && <div className="text-[10px] text-[#4b5563] mt-0.5 font-mono">ID: {account.id.slice(-8)}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {!account ? (
                        <span className="text-[#a1a1aa] italic">No Account</span>
                      ) : account.type === "INSTANT" ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#1e3a8a]/40 border border-[#1e3a8a] text-[#60a5fa] text-[10px] font-medium whitespace-nowrap">
                          Instant
                        </span>
                      ) : (
                        <div className="px-2.5 py-1 rounded-full bg-[#064e3b]/40 border border-[#064e3b] text-[#34d399] text-[10px] font-medium whitespace-nowrap inline-block text-center">
                          One Step Test
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {account ? `$${account.capitalSize.toLocaleString()}` : "-"}
                    </td>
                    <td className={`px-6 py-4 font-semibold ${balanceColor}`}>
                      {account ? `$${account.currentBalance.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {account ? account.totalTrades : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {account ? (
                        <>
                          <span className="text-[#10b981] font-medium">{account.totalWins}W</span>
                          <span className="text-[#a1a1aa] mx-1">/</span>
                          <span className="text-[#ef4444] font-medium">{account.totalLosses}L</span>
                        </>
                      ) : "-"}
                    </td>
                    <td className={`px-6 py-4 font-medium ${drawdownColor}`}>
                      {account ? `${account.dailyDrawdownPct.toFixed(1)}% / ${account.lifetimeDrawdownPct.toFixed(1)}%` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {!account ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1f2937] text-[#a1a1aa]">
                            REGISTERED
                          </span>
                        ) : (
                          <>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColor}`}>
                              {account.status.replace("_", " ")}
                            </span>
                            {account.isABook && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#4c1d95] text-[#c4b5fd]">
                                A-BOOK
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {account && (
                        <div className="relative group/menu inline-block">
                          <button className="p-2 hover:bg-[#1f2937] rounded-md transition-colors text-[#a1a1aa] hover:text-white">
                            <MoreVertical size={16} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-48 bg-[#1f2937] border border-[#374151] rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden">
                            <button
                              onClick={() => { setSelectedAccount(account); setIsCapitalModalOpen(true); }}
                              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#374151] flex items-center gap-2"
                            >
                              <DollarSign size={14} /> Adjust Capital
                            </button>
                            <button
                              onClick={() => performAction(account.id, "toggle_abook")}
                              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#374151] flex items-center gap-2"
                            >
                              <BookOpen size={14} /> Toggle A-Book
                            </button>
                            {account.status === "RESTRICTED" ? (
                              <button
                                onClick={() => performAction(account.id, "activate")}
                                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#064e3b] flex items-center gap-2"
                              >
                                <CheckCircle size={14} /> Activate Account
                              </button>
                            ) : (
                              <button
                                onClick={() => performAction(account.id, "restrict")}
                                className="w-full px-4 py-2 text-left text-sm text-[#f87171] hover:bg-[#7f1d1d] flex items-center gap-2"
                              >
                                <Ban size={14} /> Restrict Account
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-[#a1a1aa]">
            Showing {(page - 1) * 20 + (tableRows.length > 0 ? 1 : 0)} to {Math.min(page * 20, pagination.total)} of {pagination.total} users
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md bg-[#1f2937] disabled:opacity-50 text-[#a1a1aa] hover:text-white transition-colors border border-transparent hover:border-[#374151]"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button 
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center font-medium ${
                    p === page 
                      ? "bg-[#064e3b] text-[#34d399] border border-[#064e3b]" 
                      : "bg-[#1f2937] text-[#a1a1aa] border border-transparent hover:border-[#374151] hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-md bg-[#1f2937] disabled:opacity-50 text-[#a1a1aa] hover:text-white transition-colors border border-transparent hover:border-[#374151]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isCapitalModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0e1217] border border-[#1f2937] rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Adjust Capital</h2>
            <p className="text-sm text-[#a1a1aa] mb-6">
              Enter the new capital size for account <span className="font-mono text-white">{selectedAccount.id.slice(-8)}</span>.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1">New Capital Size ($)</label>
                <input
                  type="number"
                  value={newCapital}
                  onChange={(e) => setNewCapital(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-[#141923] border border-[#1f2937] rounded-lg px-4 py-2 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsCapitalModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => performAction(selectedAccount.id, "adjust_capital", { capitalSize: Number(newCapital) })}
                className="px-4 py-2 text-sm font-medium bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg transition-colors flex items-center gap-2"
                disabled={actionLoading || !newCapital}
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

