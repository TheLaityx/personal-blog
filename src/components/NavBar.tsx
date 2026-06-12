"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, MessageCircle, Home, Sparkles, Menu, X } from "lucide-react";
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
  heroVisible?: boolean;
}

const HomeIcon = <Home size={16} />;
const CommentIcon = <MessageCircle size={16} />;

export default function NavBar({ modules = [], onModuleClick, scrollActiveIndex, heroVisible = true }: NavBarProps) {
  const { theme, toggleTheme, particles, toggleParticles } = useTheme();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  // 手机端滚动标题动画状态
  const [displayTitle, setDisplayTitle] = useState({ name: "首页", key: 0 });
  const [slideDirection, setSlideDirection] = useState(1);
  const prevActiveIndexRef = useRef(0);

  const isHome = pathname === "/";
  const isCommentsPage = pathname === "/comments";

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

  useEffect(() => {
    if (isHome && scrollActiveIndex !== undefined && scrollActiveIndex >= 0) {
      setActiveIndex(1 + scrollActiveIndex);
      return;
    }
    if (isHome && scrollActiveIndex === -1) {
      setActiveIndex(0);
      return;
    }

    let idx = items.findIndex((item) => item.href === pathname);
    if (idx !== -1) {
      setActiveIndex(idx);
      return;
    }

    const moduleMatch = pathname.match(/^\/module\/(\d+)$/);
    if (moduleMatch) {
      const moduleId = Number(moduleMatch[1]);
      idx = items.findIndex((item) => item.href === `#module-${moduleId}`);
      if (idx !== -1) {
        setActiveIndex(idx);
        return;
      }
    }

    if (pathname.startsWith("/article/")) {
      setActiveIndex(0);
      return;
    }
  }, [pathname, items, isHome, scrollActiveIndex]);

  // 手机端标题动画：监听 activeIndex 变化
  useEffect(() => {
    const newName = items[activeIndex]?.name || "首页";
    const direction = activeIndex > prevActiveIndexRef.current ? 1 : -1;
    prevActiveIndexRef.current = activeIndex;
    setSlideDirection(direction);
    setDisplayTitle({ name: newName, key: Date.now() });
  }, [activeIndex, items]);

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
    setMobileOpen(false);
  };

  // 手机端点击标题跳转
  const handleTitleClick = () => {
    if (!isHome) return;
    if (activeIndex === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (activeIndex > 0 && activeIndex < items.length - 1) {
      // 模块索引 = activeIndex - 1
      onModuleClick?.(activeIndex - 1);
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      {/* Desktop / Tablet */}
      <div
        ref={navRef}
        className="glass-nav rounded-full px-2 hidden md:flex items-center gap-1 relative"
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
                setMobileOpen(false);
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
          aria-label="切换粒子"
          title="粒子"
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

      {/* Mobile */}
      <div className="md:hidden w-[calc(100vw-2rem)] max-w-xl">
        <div
          className="glass-nav rounded-full px-4 py-2.5 flex items-center relative"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        >
          {/* 可点击的滚动标题 - 居中 */}
          <button
            onClick={handleTitleClick}
            className="flex-1 flex items-center justify-center bg-transparent border-0"
            style={{ cursor: isHome ? "pointer" : "default" }}
          >
            <div className="relative h-5 overflow-hidden w-full flex items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={displayTitle.key}
                  initial={{ y: slideDirection * 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: slideDirection * -20, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="absolute text-sm font-medium whitespace-nowrap"
                  style={{ color: "var(--foreground)" }}
                >
                  {displayTitle.name}
                </motion.span>
              </AnimatePresence>
            </div>
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-full transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="菜单"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="glass-nav mt-2 rounded-2xl p-2 flex flex-col gap-0.5 overflow-hidden"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            >
              {items.map((item, i) =>
                item.isScroll && isHome ? (
                  <button
                    key={item.name}
                    onClick={() => handleItemClick(i, true)}
                    className="relative z-10 px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-xl flex items-center gap-2.5 bg-transparent border-0 w-full text-left"
                    style={{
                      color: "var(--foreground)",
                      background: activeIndex === i
                        ? theme === "dark"
                          ? "rgba(255,255,255,0.10)"
                          : "rgba(0,113,227,0.10)"
                        : "transparent",
                    }}
                  >
                    {item.icon}
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      if (item.href === "/" && isHome) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                      setMobileOpen(false);
                    }}
                    className="relative z-10 px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-xl flex items-center gap-2.5"
                    style={{
                      color: "var(--foreground)",
                      background: activeIndex === i
                        ? theme === "dark"
                          ? "rgba(255,255,255,0.10)"
                          : "rgba(0,113,227,0.10)"
                        : "transparent",
                    }}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                )
              )}

              <div className="h-px mx-2 my-1 opacity-15" style={{ background: "var(--foreground)" }} />

              <div className="flex items-center gap-1 px-2 py-1">
                <button
                  onClick={() => { toggleParticles(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  style={{
                    opacity: particles ? 1 : 0.5,
                    background: theme === "dark"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,113,227,0.06)",
                    color: "var(--foreground)",
                  }}
                >
                  <Sparkles size={16} />
                  粒子
                </button>
                <button
                  onClick={() => { toggleTheme(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  style={{
                    background: theme === "dark"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,113,227,0.06)",
                    color: "var(--foreground)",
                  }}
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  {theme === "dark" ? "亮色" : "暗色"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
