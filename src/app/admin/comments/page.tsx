"use client";

import { useEffect, useState } from "react";
import { Trash2, Check, X } from "lucide-react";

interface CommentItem {
  id: number;
  content: string;
  author: string;
  isApproved: boolean;
  createdAt: string;
  article?: { title?: string; id: number } | null;
}

export default function AdminComments() {
  const [comments, setComments] = useState<CommentItem[]>([]);

  const load = () => {
    fetch("/api/comments")
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    load();
  };

  const toggleApprove = async (id: number, approved: boolean) => {
    await fetch(`/api/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !approved }),
    });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">评论管理</h1>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="glass rounded-2xl p-5 card-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{comment.author}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${comment.isApproved ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                    {comment.isApproved ? "已通过" : "待审核"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-2">{comment.content}</p>
                {comment.article && (
                  <p className="text-xs opacity-40">来自: {comment.article.title || "无标题"}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleApprove(comment.id, comment.isApproved)}
                  className="p-2 rounded-lg opacity-50 hover:opacity-100"
                  title={comment.isApproved ? "取消通过" : "通过"}
                >
                  {comment.isApproved ? <X size={16} /> : <Check size={16} />}
                </button>
                <button onClick={() => remove(comment.id)} className="p-2 rounded-lg opacity-50 hover:opacity-100 text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm opacity-40 text-center py-12">暂无评论</p>}
      </div>
    </div>
  );
}
