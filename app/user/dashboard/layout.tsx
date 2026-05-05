"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Trophy, 
  LineChart, 
  Wallet, 
  ArrowDownToLine, 
  User, 
  Settings,
  ChevronDown
} from "lucide-react";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [balance, setBalance] = useState<number>(0);
  const [userEmail, setUserEmail] = useState<string>("user@fundedflips.com");

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const res = await fetch("/api/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.dashboard?.hasAccount) {
          setBalance(data.dashboard.account.currentBalance);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const fetchMe = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.user) {
          setUserEmail(data.user.email);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchDashboard();
    fetchMe();
  }, [pathname]); // Refetch when route changes to keep balance updated

  const navItems = [
    { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { name: "Trading", href: "#", icon: TrendingUp, hasDropdown: true },
    { name: "Sports Betting", href: "/user/dashboard/sports", icon: Trophy, isSub: true },
    { name: "Polymarket", href: "/user/dashboard/poly", icon: LineChart, isSub: true },
    { name: "Deposits", href: "/user/dashboard/deposits", icon: Wallet },
    { name: "Withdrawals", href: "/user/dashboard/withdrawals", icon: ArrowDownToLine },
    { name: "Order Receipts", href: "/user/dashboard/orders", icon: LayoutDashboard },
    { name: "Account", href: "/user/dashboard/account", icon: User },
    { name: "Settings", href: "/user/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-white">
      {/* Sidebar */}
      <div className="w-64 flex flex-col border-r border-[#1f2937] bg-[#0e1217] shrink-0 sticky top-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Logo */}
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center">
              <span className="font-bold text-black text-lg leading-none">F</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Funded<span className="text-[#10b981]">Flips</span>
            </span>
          </div>
        </div>

        {/* User Profile Snippet */}
        <div className="px-6 pb-6 border-b border-[#1f2937] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1f2937] text-white flex items-center justify-center text-xs font-bold uppercase">
              {userEmail.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-[#a1a1aa] truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                  item.isSub ? "ml-6" : ""
                } ${
                  isActive
                    ? "bg-[#10b981] text-black"
                    : "text-[#a1a1aa] hover:bg-[#141923] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? "text-black" : "text-[#a1a1aa] group-hover:text-white"} />
                  <span className={`text-sm font-medium ${isActive ? "text-black" : ""}`}>
                    {item.name}
                  </span>
                </div>
                {item.hasDropdown && (
                  <ChevronDown size={14} className={isActive ? "text-black" : "text-[#a1a1aa] group-hover:text-white"} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="h-20 border-b border-[#1f2937] flex items-center justify-end px-8 bg-[#0B0F17] sticky top-0 z-10">
          <div className="flex items-center gap-3 bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-2">
            <div className="w-6 h-6 rounded bg-[#10b981]/20 flex items-center justify-center">
              <DollarSign size={14} className="text-[#10b981]" />
            </div>
            <div>
              <p className="text-[10px] text-[#a1a1aa] leading-none mb-1">Account Balance</p>
              <p className="text-sm font-bold text-white leading-none">${balance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// Inline DollarSign icon since I forgot to import it above
function DollarSign(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
