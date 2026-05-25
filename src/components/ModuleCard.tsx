"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import Link from "next/link";

interface ModuleCardProps {
  module: {
    id: number;
    name: string;
    wallpaper?: string;
  };
  index: number;
}

export default function ModuleCard({ module, index }: ModuleCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="rounded-3xl overflow-hidden card-shadow relative flex items-center justify-center transition-transform duration-500 hover:scale-[1.02]"
        style={{
          backgroundImage: module.wallpaper
            ? `url(${module.wallpaper})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "240px",
        }}
      >
        {/* 半透明遮罩，降低不透明度让背景透出 */}
        <div className="absolute inset-0 bg-white/30 dark:bg-black/60" />

        {/* 模块名 - 水平垂直居中，固定白色确保可读 */}
        <h3 className="relative z-10 text-2xl font-bold text-center tracking-wide text-white drop-shadow-lg">
          {module.name}
        </h3>

        {/* 悬停显示的前往按钮 - 玻璃磨砂 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 12 }}
          transition={{ duration: 0.35 }}
          className="absolute bottom-5 left-5 right-5"
        >
          <Link
            href={`/module/${module.id}`}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "var(--card-bg)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--card-border)",
              color: "var(--foreground)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              cursor: "none",
            }}
          >
            <Send size={14} />
            前往
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
