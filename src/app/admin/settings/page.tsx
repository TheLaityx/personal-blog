"use client";

import { useEffect, useState, useRef } from "react";
import { Save, Upload, User } from "lucide-react";

export default function AdminSettings() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const avatarRef = useRef<HTMLInputElement>(null);
  const wallpaperRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  const update = async (key: string, value: string) => {
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    return r.json();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">站点设置</h1>

      <div className="space-y-6 max-w-xl">
        <div className="glass rounded-2xl p-5 card-shadow">
          <h3 className="font-bold mb-4">基本信息</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs opacity-50 mb-1.5 block">站点名称</label>
              <input
                value={config.siteName || ""}
                onChange={(e) => update("siteName", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm glass outline-none"
                style={{ background: "var(--card-bg)" }}
              />
            </div>
            <div>
              <label className="text-xs opacity-50 mb-1.5 block">头像</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-black/5 flex items-center justify-center">
                  {config.avatar ? (
                    <img src={config.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} opacity={0.3} />
                  )}
                </div>
                <input
                  value={config.avatar || ""}
                  onChange={(e) => update("avatar", e.target.value)}
                  placeholder="头像URL"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm glass outline-none"
                  style={{ background: "var(--card-bg)" }}
                />
                <button
                  onClick={() => avatarRef.current?.click()}
                  className="px-3 py-2.5 rounded-xl glass"
                >
                  <Upload size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 card-shadow">
          <h3 className="font-bold mb-4">外观</h3>
          <div>
            <label className="text-xs opacity-50 mb-1.5 block">首页壁纸</label>
            <div className="flex gap-2">
              <input
                value={config.homeWallpaper || ""}
                onChange={(e) => update("homeWallpaper", e.target.value)}
                placeholder="壁纸URL"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm glass outline-none"
                style={{ background: "var(--card-bg)" }}
              />
              <button
                onClick={() => wallpaperRef.current?.click()}
                className="px-3 py-2.5 rounded-xl glass"
              >
                <Upload size={16} />
              </button>
            </div>
            {config.homeWallpaper && (
              <img src={config.homeWallpaper} alt="" className="mt-3 w-full h-32 rounded-xl object-cover" />
            )}
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={avatarRef}
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const data = await uploadFile(file);
            update("avatar", data.url);
          }
          e.target.value = "";
        }}
      />
      <input
        type="file"
        ref={wallpaperRef}
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const data = await uploadFile(file);
            update("homeWallpaper", data.url);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}
