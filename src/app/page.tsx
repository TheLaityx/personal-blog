"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import ModuleCard from "@/components/ModuleCard";
import { ChevronDown } from "lucide-react";

interface ModuleItem {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  wallpaper?: string;
  articles: { id: number; title?: string; coverImage?: string }[];
}

interface Config {
  siteName?: string;
  avatar?: string;
  homeWallpaper?: string;
}

export default function HomePage() {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [config, setConfig] = useState<Config>({});
  const [heroVisible, setHeroVisible] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(-1);
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const moduleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastActiveIndex = useRef(-1);
  const clipRectRef = useRef<SVGRectElement>(null);
  const lineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then(setModules)
      .catch(() => {});
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  // 滚动监听：hero 可见性 + 模块高亮 + 线条绘制进度
  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight;

      // hero 可见性
      if (heroRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        setHeroVisible(heroRect.bottom > 100);
      }

      // 线条进度：线条顶端到达视口下方30%时开始出现，底端到达视口底部上方时完全显示
      if (lineContainerRef.current) {
        const rect = lineContainerRef.current.getBoundingClientRect();
        const startTrigger = vh * 0.7; // 视口下方30%位置
        const endTrigger = vh * 0.92;  // 视口底部上方8%
        const totalTravel = rect.height + (startTrigger - endTrigger);
        const lineEnter = startTrigger - rect.top;
        const progress = Math.max(0, Math.min(1, lineEnter / totalTravel));
        if (clipRectRef.current) {
          clipRectRef.current.setAttribute("height", String(5000 * progress));
        }
      }

      // 检查哪个模块卡片区域最接近视口中心
      let foundIndex = -1;
      let minDistance = Infinity;
      moduleRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = vh / 2;
        const threshold = vh * 0.3;
        if (rect.top < center + threshold && rect.bottom > center - threshold) {
          const moduleCenter = (rect.top + rect.bottom) / 2;
          const distance = Math.abs(moduleCenter - center);
          if (distance < minDistance) {
            minDistance = distance;
            foundIndex = i;
          }
        }
      });

      // 保留上一次活跃索引，避免间隙跳回首页
      if (foundIndex === -1 && lastActiveIndex.current >= 0) {
        const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? Infinity;
        if (heroBottom <= 100) {
          foundIndex = lastActiveIndex.current;
        }
      } else if (foundIndex >= 0) {
        lastActiveIndex.current = foundIndex;
      }
      setActiveModuleIndex(foundIndex);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // init
    return () => window.removeEventListener("scroll", onScroll);
  }, [modules.length]);

  const scrollToModule = useCallback((index: number) => {
    const el = moduleRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  return (
    <main className="min-h-screen">
      <NavBar
        modules={modules.map((m, i) => ({ id: m.id, name: m.name, href: `#module-${m.id}` }))}
        onModuleClick={scrollToModule}
        scrollActiveIndex={activeModuleIndex}
      />

      {/* Hero 区域 */}
      <section
        ref={heroRef}
        className="h-screen flex flex-col items-center justify-center relative"
        style={{
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "scale(1)" : "scale(0.95)",
          pointerEvents: heroVisible ? "auto" : "none",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl animate-float">
              {config.avatar && config.avatar !== "/default-avatar.png" ? (
                <img src={config.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white text-4xl font-bold">
                  の
                </div>
              )}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient">{config.siteName || "BLOG"}</span>
          </h1>
          <p className="text-sm opacity-60 tracking-widest uppercase">Welcome to my space</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
        >
          <span className="text-xs opacity-40">向下滚动</span>
          <ChevronDown className="animate-bounce opacity-40" size={20} />
        </motion.div>
      </section>

      {/* 模块区域 */}
      <section ref={sectionRef} className="min-h-screen px-6 md:px-12 py-24 max-w-5xl mx-auto relative">
        {/* 白色实线 - 随滚动向下绘制 */}
        <div ref={lineContainerRef} className="absolute left-1/2 top-40 bottom-24 w-20 -translate-x-1/2 hidden md:block">
          <svg className="w-full h-full" viewBox="0 0 80 5000" preserveAspectRatio="none">
            <defs>
              <clipPath id="line-clip">
                <rect ref={clipRectRef} x="0" y="0" width="80" height="0" />
              </clipPath>
            </defs>
            <g clipPath="url(#line-clip)">
              {/* 顶部端点 */}
              <circle cx="40" cy="0" r="4" fill="#fff" opacity="0.4" vectorEffect="non-scaling-stroke" />
              {/* 线条 */}
              <path
                d="M 40 0 C 10 500 70 1000 40 1500 C 10 2000 70 2500 40 3000 C 10 3500 70 4000 40 4500 C 10 4750 40 5000 40 5000"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.4"
                vectorEffect="non-scaling-stroke"
              />
              {/* 底部端点 */}
              <circle cx="40" cy="5000" r="4" fill="#fff" opacity="0.4" vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
        </div>

        <div className="relative space-y-24 md:space-y-32">
          {modules.map((mod, i) => {
            // 虚线两侧交替分布，奇数右、偶数左
            const isRight = i % 2 === 1;
            const alignClass = isRight
              ? "md:ml-auto md:mr-0"
              : "md:mr-auto md:ml-0";

            return (
              <div
                key={mod.id}
                id={`module-${mod.id}`}
                ref={(el) => { moduleRefs.current[i] = el; }}
                className={`${alignClass} md:w-[45%]`}
              >
                <ModuleCard module={mod} index={i} />
              </div>
            );
          })}
        </div>

        {/* 底部留白，让最后一个卡片能被视口中心捕获 */}
        <div className="h-[50vh]" />
      </section>

      <footer className="py-12 text-center text-xs opacity-40">
        <p> 2026 {config.siteName || "BLOG"} · Built with love</p>
      </footer>
    </main>
  );
}
