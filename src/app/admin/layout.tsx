"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Home,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "仪表盘", href: "/admin" },
  { icon: Layers, label: "模块管理", href: "/admin/modules" },
  { icon: FileText, label: "文章管理", href: "/admin/articles" },
  { icon: MessageSquare, label: "评论管理", href: "/admin/comments" },
  { icon: Settings, label: "站点设置", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthorized(true);
      return;
    }
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [router, pathname]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 glass border-r border-white/10 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-bold">管理后台</h2>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  active ? "font-medium" : "opacity-60 hover:opacity-100"
                }`}
                style={active ? { background: "var(--accent)", color: "#fff" } : {}}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 space-y-1 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm opacity-60 hover:opacity-100 transition-colors"
          >
            <Home size={16} />
            回到站点
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm opacity-60 hover:opacity-100 transition-colors"
          >
            <LogOut size={16} />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="md:hidden flex items-center justify-between p-4 glass sticky top-0 z-50">
          <h2 className="font-bold">管理后台</h2>
          <button onClick={logout} className="text-sm opacity-60">
            退出
          </button>
        </div>
        <div className="p-6 md:p-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
