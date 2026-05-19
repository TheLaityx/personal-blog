"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { MessageCircle, User, FileText, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface CommentItem {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  article?: { title?: string; id: number } | null;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [modules, setModules] = useState<{ id: number; name: string }[]>([]);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");

  const load = () => {
    fetch("/api/comments")
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
    fetch("/api/modules")
      .then((r) => r.json())
      .then((mods) => setModules(mods.map((m: { id: number; name: string }) => ({ id: m.id, name: m.name }))))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: commentText,
        author: authorName || "匿名",
      }),
    });
    setCommentText("");
    load();
  };

  return (
    <main className="min-h-screen">
      <NavBar modules={modules.map((m) => ({ id: m.id, name: m.name, href: `/module/${m.id}` }))} />

      <div className="pt-28 px-6 md:px-12 max-w-3xl mx-auto pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">全部评论</h1>
          <p className="text-sm opacity-50">共 {comments.length} 条评论</p>
        </motion.div>

        {/* 评论输入 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 card-shadow mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Send size={16} style={{ color: "var(--accent)" }} />
            <span className="text-sm font-medium">发表评论</span>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="昵称"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="flex-shrink-0 w-28 px-4 py-2.5 rounded-xl text-sm glass outline-none"
              style={{ background: "var(--card-bg)" }}
            />
            <input
              type="text"
              placeholder="写下你的评论..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm glass outline-none"
              style={{ background: "var(--card-bg)" }}
            />
            <button
              onClick={submitComment}
              className="px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Send size={14} />
            </button>
          </div>
        </motion.div>

        <div className="space-y-4">
          {comments.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 card-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium">{comment.author}</span>
                    <span className="text-xs opacity-40">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed mb-2">{comment.content}</p>
                  {comment.article && (
                    <Link
                      href={`/article/${comment.article.id}`}
                      className="inline-flex items-center gap-1.5 text-xs opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <FileText size={12} />
                      来自: {comment.article.title || "无标题"}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <MessageCircle size={48} className="mx-auto mb-4" />
              <p>还没有评论</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
