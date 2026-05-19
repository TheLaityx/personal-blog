"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async () => {
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setError(data.error || `登录失败 (HTTP ${r.status})`);
        setLoading(false);
        return;
      }
      const data = await r.json();
      if (data.token) {
        localStorage.setItem("adminToken", data.token);
        router.push("/admin");
      } else {
        setError(data.error || "登录失败");
      }
    } catch (e) {
      setError("网络错误，请检查服务是否运行");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 md:p-10 w-full max-w-sm card-shadow"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-2xl font-bold">管理后台</h1>
          <p className="text-sm opacity-50 mt-1">请输入管理员账号</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass outline-none focus:ring-2"
              style={{ background: "var(--card-bg)" }}
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass outline-none focus:ring-2"
              style={{ background: "var(--card-bg)" }}
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={login}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
