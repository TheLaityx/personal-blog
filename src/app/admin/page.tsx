"use client";

import { useEffect, useState } from "react";
import { Layers, FileText, MessageSquare, Image } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ moduleCount: 0, articleCount: 0, commentCount: 0, mediaCount: 0 });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    { label: "模块", value: stats.moduleCount, icon: Layers, color: "#0071e3" },
    { label: "文章", value: stats.articleCount, icon: FileText, color: "#34c759" },
    { label: "评论", value: stats.commentCount, icon: MessageSquare, color: "#ff9500" },
    { label: "媒体", value: stats.mediaCount, icon: Image, color: "#af52de" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">仪表盘</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="glass rounded-2xl p-5 card-shadow">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${card.color}15` }}
            >
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs opacity-50 mt-1">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
