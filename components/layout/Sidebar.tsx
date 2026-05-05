"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Activity,
  ArrowDownToLine,
  Gavel,
  Menu,
  ChevronLeft
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/dashboard/users", icon: Users },
  { name: "Deposit Approvals", href: "/dashboard/deposits", icon: Wallet },
  { name: "Wallet Settings", href: "/dashboard/wallet", icon: Settings },
  { name: "Capital Control", href: "/dashboard/capital-control", icon: ShieldAlert },
  { name: "Test Accounts", href: "/dashboard/test-accounts", icon: GraduationCap },
  { name: "Trade Management", href: "/dashboard/trade-management", icon: Briefcase },
  { name: "Trade Monitoring", href: "/dashboard/trade-monitoring", icon: Activity },
  { name: "Withdrawals", href: "/dashboard/withdrawals", icon: ArrowDownToLine },
  { name: "Rules", href: "/dashboard/rules", icon: Gavel },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-screen sticky top-0 flex flex-col border-r border-[var(--border)] bg-[var(--background)] z-20 shrink-0"
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border)]">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <div className="w-8 h-8 rounded bg-[var(--primary)] shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center justify-center">
              <span className="font-bold text-[#000] text-lg leading-none">F</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white whitespace-nowrap">
              Funded<span className="text-[var(--primary)]">Flips</span>
            </span>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-8 h-8 mx-auto rounded bg-[var(--primary)] shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center justify-center">
            <span className="font-bold text-[#000] text-lg leading-none">F</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-md hover:bg-[var(--card)] transition-colors text-[var(--muted)] hover:text-white",
            collapsed && "absolute -right-3 top-5 bg-[var(--card)] border border-[var(--border)] shadow-md"
          )}
        >
          {collapsed ? <Menu size={16} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-[var(--primary)] rounded-r-full shadow-[0_0_10px_var(--primary)]"
                />
              )}
              <item.icon size={20} className={cn("shrink-0", isActive ? "text-[var(--primary)]" : "group-hover:text-white")} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shrink-0">
            <span className="text-sm font-medium">AD</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-[var(--muted)] truncate">admin@fundedflips.com</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
