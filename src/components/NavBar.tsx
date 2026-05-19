"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, MessageCircle, Home, Sparkles } from "lucide-react";
import { useTheme } from "@/app/providers";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  id: number;
  name: string;
  href: string;
}

interface NavBarProps {
  modules?: NavItem[];
  onModuleClick?: (index: number) => void;
  scrollActiveIndex?: number;
}

// 静态图标组件，避免每次渲染重新创建 JSX
const HomeIcon = <Home size={16} />;
const CommentIcon = <MessageCircle size={16} />;

export default function NavBar({ modules = [], onModuleClick, scrollActiveIndex }: NavBarProps) {
  const { theme, toggleTheme, particles, toggleParticles } = useTheme();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const itemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  const isHome = pathname === "/";
  const isCommentsPage = pathname === "/comments";

  // 用 useMemo 缓存 items，避免无限 effect 重跑
  const items = useMemo(() => {
    const list: { name: string; href: string; icon: React.ReactNode; isScroll?: boolean }[] = [
      { name: "首页", href: "/", icon: HomeIcon },
    ];

    if (!isCommentsPage) {
      list.push(
        ...modules.map((m) => ({
          name: m.name,
          href: isHome ? m.href : "/",
          icon: null as React.ReactNode,
          isScroll: true,
        }))
      );
    }

    list.push({ name: "评论", href: "/comments", icon: CommentIcon });
    return list;
  }, [modules, isHome, isCommentsPage]);

  // 根据路径或滚动位置设置 activeIndex
  useEffect(() => {
    if (isHome && scrollActiveIndex !== undefined && scrollActiveIndex >= 0) {
      setActiveIndex(1 + scrollActiveIndex);
      return;
    }
    if (isHome && scrollActiveIndex === -1) {
      setActiveIndex(0);
      return;
    }

    // 直接匹配 pathname
    let idx = items.findIndex((item) => item.href === pathname);
    if (idx !== -1) {
      setActiveIndex(idx);
      return;
    }

    // 模块详情页 /module/:id
    const moduleMatch = pathname.match(/^\/module\/(\d+)$/);
    if (moduleMatch) {
      const moduleId = Number(moduleMatch[1]);
      idx = items.findIndex((item) => item.href === `#module-${moduleId}`);
      if (idx !== -1) {
        setActiveIndex(idx);
        return;
      }
    }

    // 文章详情页 /article/:id → 高亮首页
    if (pathname.startsWith("/article/")) {
      setActiveIndex(0);
      return;
    }
  }, [pathname, items, isHome, scrollActiveIndex]);

  const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  const updatePill = useCallback(
    (index: number) => {
      const el = itemRefs.current[index];
      const container = navRef.current;
      if (!el || !container) return;

      const containerH = container.offsetHeight;
      const pillW = el.offsetWidth + 20;

      setPillStyle({
        width: pillW,
        height: containerH,
        x: el.offsetLeft - 10,
        y: 0,
      });
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => updatePill(targetIndex), 50);
    const onResize = () => updatePill(targetIndex);
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [targetIndex, updatePill]);

  const handleItemClick = (i: number, isScroll?: boolean) => {
    if (isScroll && onModuleClick) {
      onModuleClick(i - 1);
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div
        ref={navRef}
        className="glass-nav rounded-full px-2 flex items-center gap-1 relative"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)", cursor: "none" }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <motion.div
          className="absolute rounded-full pointer-events-none"
          animate={{
            width: pillStyle.width,
            height: pillStyle.height,
            x: pillStyle.x,
            y: pillStyle.y,
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30,
            mass: 1,
          }}
          style={{
            background:
              theme === "dark"
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,113,227,0.12)",
          }}
        />

        {items.map((item, i) =>
          item.isScroll && isHome ? (
            <button
              key={item.name}
              ref={(el) => { itemRefs.current[i] = el; }}
              onClick={() => handleItemClick(i, true)}
              onMouseEnter={() => setHoveredIndex(i)}
              className="relative z-10 px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-full flex items-center justify-center gap-1.5 whitespace-nowrap bg-transparent border-0"
              style={{ color: "var(--foreground)", cursor: "none" }}
            >
              {item.icon}
              {item.name}
            </button>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              ref={(el) => { itemRefs.current[i] = el; }}
              onClick={() => {
                if (item.href === "/" && isHome) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              className="relative z-10 px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-full flex items-center justify-center gap-1.5 whitespace-nowrap"
              style={{ color: "var(--foreground)", cursor: "none" }}
            >
              {item.icon}
              {item.name}
            </Link>
          )
        )}

        <div className="w-px h-5 mx-1 opacity-20" style={{ background: "var(--foreground)" }} />

        <button
          onClick={toggleParticles}
          className="relative z-10 p-2.5 rounded-full transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10"
          style={{ cursor: "none", opacity: particles ? 1 : 0.4 }}
          aria-label="切换粒子效果"
          title="粒子效果"
        >
          <Sparkles size={16} />
        </button>

        <button
          onClick={toggleTheme}
          className="relative z-10 p-2.5 rounded-full transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10"
          style={{ cursor: "none" }}
          aria-label="切换主题"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  );
}
