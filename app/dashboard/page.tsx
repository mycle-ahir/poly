"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  TrendingUp,
  CheckSquare,
  XCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return router.push("/user/login");

        const res = await fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.status === 401) return router.push("/user/login");

        const json = await res.json();
        setStats(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-[#10b981]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-[#a1a1aa] mt-1 text-sm">
          Monitor and manage your FundedFlips platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 */}
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
              <Users className="text-[#3b82f6]" size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium mb-1">Total Users</p>
            <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center">
              <ShieldCheck className="text-[#10b981]" size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium mb-1">Active Accounts</p>
            <p className="text-2xl font-bold text-white">{stats?.activeUsers || 0}</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center">
              <DollarSign className="text-[#10b981]" size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium mb-1">Total Capital</p>
            <p className="text-2xl font-bold text-white">${(stats?.totalCapital || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
              <AlertCircle className="text-[#f59e0b]" size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium mb-1">Pending Deposits</p>
            <p className="text-2xl font-bold text-white">{stats?.pendingDeposits || 0}</p>
          </div>
        </div>

        {/* Row 2 */}
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#14b8a6]/20 flex items-center justify-center">
              <TrendingUp className="text-[#14b8a6]" size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium mb-1">Total Trades</p>
            <p className="text-2xl font-bold text-white">{stats?.totalTrades || 0}</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center">
              <CheckSquare className="text-[#10b981]" size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-white">{stats?.winRate || "0.0"}%</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#ef4444]/20 flex items-center justify-center">
              <XCircle className="text-[#ef4444]" size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium mb-1">Violations (mock)</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center">
              <AlertCircle className="text-[#f59e0b]" size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] font-medium mb-1">Pending Actions</p>
            <p className="text-2xl font-bold text-white">{stats?.recentPendingActions?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Activity Chart */}
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937]">
          <h3 className="text-sm font-semibold text-white mb-6">Weekly Trading Activity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.weeklyActivity || []}>
                <defs>
                  <linearGradient id="colorTrades" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#22c55e' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="trades" 
                  stroke="#22c55e" 
                  fillOpacity={1} 
                  fill="url(#colorTrades)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capital Distribution Chart */}
        <div className="p-5 rounded-xl bg-[#0e1217] border border-[#1f2937]">
          <h3 className="text-sm font-semibold text-white mb-6">Capital Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.capitalDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#1f2937' }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Pending Actions */}
      <div className="rounded-xl bg-[#0e1217] border border-[#1f2937] p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Pending Actions</h3>
        <div className="space-y-3">
          {(!stats?.recentPendingActions || stats.recentPendingActions.length === 0) ? (
            <div className="text-center text-[#a1a1aa] py-10">No pending actions right now.</div>
          ) : (
            stats.recentPendingActions.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#141923] border border-[#1f2937] hover:border-[#374151] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#3b82f6]/20">
                    <ShieldCheck className="text-[#3b82f6]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-[#a1a1aa] mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push(item.type === "DEPOSIT" ? "/dashboard/deposits" : "/dashboard/withdrawals")}
                  className="text-xs font-medium text-[#f59e0b] border border-[#f59e0b]/30 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  Review
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
