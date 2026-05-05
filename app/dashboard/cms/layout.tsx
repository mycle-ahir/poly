"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  PlusSquare, 
  ExternalLink 
} from "lucide-react";

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "All Posts", href: "/dashboard/cms", icon: FileText },
    { name: "Add New Post", href: "/dashboard/cms/new", icon: PlusSquare },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-white">
      {/* Sidebar */}
      <div className="w-64 flex flex-col border-r border-[#1f2937] bg-[#0e1217] shrink-0 sticky top-0 h-screen">
        <div className="h-20 flex items-center px-6">
          <span className="font-bold text-xl tracking-tight text-white">
            FundedFlips <span className="text-[#3b82f6]">CMS</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? "bg-[#3b82f6] text-white"
                    : "text-[#a1a1aa] hover:bg-[#1f2937] hover:text-white"
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1f2937]">
          <Link 
            href="/" 
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs text-[#a1a1aa] hover:text-white transition-colors"
          >
            <ExternalLink size={14} />
            View Public Blog
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
