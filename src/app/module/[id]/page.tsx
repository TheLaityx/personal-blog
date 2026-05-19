"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { ArrowLeft, Folder, FileText, User } from "lucide-react";
import Link from "next/link";

interface Collection {
  id: number;
  name: string;
  description?: string;
  wallpaper?: string;
  articles: Article[];
}

interface Article {
  id: number;
  title?: string;
  coverImage?: string;
  createdAt: string;
}

interface ModuleData {
  id: number;
  name: string;
  wallpaper?: string;
  collections: Collection[];
  articles: Article[];
}

interface Config {
  avatar?: string;
  siteName?: string;
  homeWallpaper?: string;
}

export default function ModulePage() {
  const { id } = useParams();
  const router = useRouter();
  const [module, setModule] = useState<ModuleData | null>(null);
  const [config, setConfig] = useState<Config>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/modules/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setModule(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch("/api/config")
      .then((r) => r.json())
      .then((cfg) => {
        setConfig(cfg);
      })
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)" }} />
      </div>
    );
  }

  if (!module) return null;

  return (
    <main className="min-h-screen">
      <NavBar />

      <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto flex gap-8">
        {/* 左侧头像栏 */}
        <motion.aside
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex flex-col items-center w-48 flex-shrink-0 pt-8 sticky top-24 h-fit"
        >
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/20 shadow-xl mb-4">
            {config.avatar && config.avatar !== "/default-avatar.png" ? (
              <img src={config.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white text-2xl font-bold">
                <User size={32} />
              </div>
            )}
          </div>
          <p className="text-sm font-medium mb-6 opacity-80">{config.siteName || "BLOG"}</p>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full glass hover:scale-105 transition-transform text-sm"
          >
            <ArrowLeft size={16} />
            返回
          </button>
        </motion.aside>

        {/* 右侧内容 */}
        <div className="flex-1 pt-8 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden flex items-center gap-4 mb-8"
          >
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-full glass"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">{module.name}</h1>
          </motion.div>

          <div className="hidden md:block mb-8">
            <h1 className="text-3xl font-bold">{module.name}</h1>
          </div>

          {module.collections.length > 0 ? (
            <div className="space-y-8">
              {module.collections.map((col, i) => (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-3xl p-6 card-shadow"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Folder size={18} style={{ color: "var(--accent)" }} />
                    <h2 className="text-lg font-bold">{col.name}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {col.articles?.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    )) || (
                      <p className="text-sm opacity-40 col-span-full">暂无文章</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {module.articles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`}>
      <div className="glass rounded-2xl overflow-hidden card-shadow hover:scale-[1.02] transition-transform duration-300">
        {article.coverImage ? (
          <div className="h-40 overflow-hidden">
            <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center bg-black/5">
            <FileText size={32} opacity={0.3} />
          </div>
        )}
        <div className="p-4">
          <h3 className="font-medium text-sm line-clamp-2">
            {article.title || "无标题"}
          </h3>
        </div>
      </div>
    </Link>
  );
}
