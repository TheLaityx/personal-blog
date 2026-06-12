"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { ArrowLeft, MessageCircle, Send, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Media {
  id: number;
  type: string;
  url: string;
  filename: string;
  sortOrder: number;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  replies?: Comment[];
}

interface ArticleData {
  id: number;
  title?: string;
  content?: string;
  coverImage?: string;
  createdAt: string;
  module?: { name: string };
  collection?: { name: string };
  medias: Media[];
  comments: Comment[];
}

export default function ArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: commentText,
        author: authorName || "匿名",
        articleId: Number(id),
      }),
    });
    setCommentText("");
    const r = await fetch(`/api/articles/${id}`);
    const data = await r.json();
    setArticle(data);
  };

  if (loading || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)" }} />
      </div>
    );
  }

  const renderContent = (content?: string) => {
    if (!content) return <p className="opacity-40 italic">暂无内容</p>;
    const sortedMedias = [...(article.medias || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const parts = content.split(/(\[MEDIA:\d+\])/g);
    let fallbackIndex = 0;
    return parts.map((part, i) => {
      const match = part.match(/\[MEDIA:(\d+)\]/);
      if (match) {
        const targetPid = Number(match[1]);
        // 新数据：sortOrder = pid - 1，即 [MEDIA:1] -> sortOrder=0, [MEDIA:2] -> sortOrder=1
        let media = sortedMedias.find((m) => (m.sortOrder || 0) === targetPid - 1);
        // 兼容旧数据：sortOrder 可能等于 pid（如果之前保存过 sortOrder = pid 的草稿）
        if (!media) {
          media = sortedMedias.find((m) => (m.sortOrder || 0) === targetPid);
        }
        // 最终 fallback：按出现顺序取
        if (!media) {
          media = sortedMedias[fallbackIndex];
        }
        fallbackIndex++;
        if (!media) {
          return (
            <div key={i} className="w-full rounded-2xl my-4 bg-black/5 flex items-center justify-center py-12 text-sm opacity-40">
              [媒体加载失败]
            </div>
          );
        }
        if (media.type === "video") {
          return (
            <video key={i} src={media.url} controls className="w-full rounded-2xl my-4" />
          );
        }
        return (
          <img key={i} src={media.url} alt={media.filename || ""} className="w-full rounded-2xl my-4 object-cover" />
        );
      }
      if (!part.trim()) return null;
      return (
        <div key={i}>
          {part.split("\n").map((line, j) => (
            <p key={j} className="my-2 leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      );
    });
  };

  return (
    <main className="min-h-screen">
      <NavBar />

      <div className="pt-28 px-6 md:px-12 max-w-3xl mx-auto pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 text-sm opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft size={16} /> 返回
          </button>

          {article.coverImage && (
            <div className="rounded-3xl overflow-hidden mb-8 card-shadow">
              <img src={article.coverImage} alt="" className="w-full h-64 md:h-80 object-cover" />
            </div>
          )}

          <div className="flex items-center gap-3 mb-4 text-xs opacity-50">
            <span>{article.module?.name}</span>
            {article.collection && <span>/ {article.collection.name}</span>}
            <span>· {formatDate(article.createdAt)}</span>
          </div>

          {article.title && (
            <h1 className="text-3xl md:text-4xl font-bold mb-8">{article.title}</h1>
          )}

          <div className="text-base leading-8 mb-16">
            {renderContent(article.content)}
          </div>

          <div className="glass rounded-3xl p-6 md:p-8 card-shadow">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle size={18} style={{ color: "var(--accent)" }} />
              <h2 className="text-lg font-bold">
                评论 ({article.comments?.length || 0})
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="text"
                placeholder="昵称"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="flex-shrink-0 w-full sm:w-28 px-4 py-2.5 rounded-xl text-sm glass outline-none focus:ring-2"
                style={{ background: "var(--card-bg)" }}
              />
              <div className="flex gap-3 flex-1">
                <input
                  type="text"
                  placeholder="写下你的评论..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitComment()}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm glass outline-none focus:ring-2"
                  style={{ background: "var(--card-bg)" }}
                />
                <button
                  onClick={submitComment}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 flex-shrink-0"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {article.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                    <User size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{comment.author}</span>
                      <span className="text-xs opacity-40">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-4 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center flex-shrink-0">
                              <User size={12} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{reply.author}</span>
                                <span className="text-xs opacity-40">{formatDate(reply.createdAt)}</span>
                              </div>
                              <p className="text-xs leading-relaxed mt-0.5">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(!article.comments || article.comments.length === 0) && (
                <p className="text-sm opacity-40 text-center py-8">暂无评论，来抢沙发吧</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
