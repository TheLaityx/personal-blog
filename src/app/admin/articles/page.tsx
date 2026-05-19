"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit2, FileText, Upload } from "lucide-react";

interface ModuleItem {
  id: number;
  name: string;
  collections: { id: number; name: string }[];
}

interface ArticleItem {
  id: number;
  title?: string;
  content?: string;
  coverImage?: string;
  isPublished: boolean;
  moduleId: number;
  collectionId?: number;
  medias: { id: number; url: string; type: string }[];
}

export default function AdminArticles() {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ArticleItem | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    coverImage: "",
    moduleId: 0,
    collectionId: 0,
    isPublished: true,
  });
  const [mediaList, setMediaList] = useState<{ url: string; type: string; filename: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const load = () => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then(setModules)
      .catch(() => {});
    fetch("/api/articles")
      .then((r) => r.json())
      .then(setArticles)
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    return r.json();
  };

  const insertMediaPlaceholder = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const placeholder = `[MEDIA:${mediaList.length + 1}]`;
    const newContent = form.content.slice(0, start) + placeholder + form.content.slice(end);
    setForm({ ...form, content: newContent });
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
    }, 0);
  };

  const save = async () => {
    const payload = {
      ...form,
      collectionId: form.collectionId || null,
      medias: mediaList.map((m, i) => ({ ...m, sortOrder: i })),
    };

    const url = editing ? `/api/articles/${editing.id}` : "/api/articles";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowForm(false);
    setEditing(null);
    resetForm();
    load();
  };

  const resetForm = () => {
    setForm({ title: "", content: "", coverImage: "", moduleId: 0, collectionId: 0, isPublished: true });
    setMediaList([]);
  };

  const remove = async (id: number) => {
    if (!confirm("确定删除此文章？")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    load();
  };

  const selectedModule = modules.find((m) => m.id === form.moduleId);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Plus size={16} /> 发布文章
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-5 mb-6 card-shadow">
          <h3 className="font-bold mb-4">{editing ? "编辑文章" : "发布文章"}</h3>
          <div className="space-y-3">
            <input
              placeholder="标题（可选）"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm glass outline-none"
              style={{ background: "var(--card-bg)" }}
            />
            <div className="flex gap-2">
              <select
                value={form.moduleId || ""}
                onChange={(e) => setForm({ ...form, moduleId: Number(e.target.value), collectionId: 0 })}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm glass outline-none"
                style={{ background: "var(--card-bg)" }}
              >
                <option value="">选择模块</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <select
                value={form.collectionId || ""}
                onChange={(e) => setForm({ ...form, collectionId: Number(e.target.value) })}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm glass outline-none"
                style={{ background: "var(--card-bg)" }}
              >
                <option value="">选择合集（可选）</option>
                {selectedModule?.collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                placeholder="封面图URL"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm glass outline-none"
                style={{ background: "var(--card-bg)" }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="px-3 py-2.5 rounded-xl glass"
              >
                <Upload size={16} />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              placeholder="内容... 点击插入媒体按钮在光标处插入占位符"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-2.5 rounded-xl text-sm glass outline-none resize-none font-mono"
              style={{ background: "var(--card-bg)" }}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs glass"
              >
                <Upload size={14} /> 上传图片/视频
              </button>
              <button
                onClick={insertMediaPlaceholder}
                disabled={mediaList.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs glass disabled:opacity-30"
              >
                插入占位符 [MEDIA:{mediaList.length + 1}]
              </button>
            </div>

            <input
              type="file"
              ref={fileRef}
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                for (const file of files) {
                  const data = await uploadFile(file);
                  setMediaList((prev) => [...prev, { url: data.url, type: data.type, filename: data.filename }]);
                }
              }}
            />

            {mediaList.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {mediaList.map((m, i) => (
                  <div key={i} className="relative">
                    {m.type === "video" ? (
                      <video src={m.url} className="w-20 h-20 rounded-xl object-cover" />
                    ) : (
                      <img src={m.url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                    )}
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
              立即发布
            </label>

            <div className="flex gap-2">
              <button onClick={save} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
                保存
              </button>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 rounded-xl text-sm opacity-60">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {articles.map((art) => (
          <div key={art.id} className="glass rounded-2xl p-4 card-shadow flex items-center gap-4">
            {art.coverImage ? (
              <img src={art.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-black/5 flex items-center justify-center flex-shrink-0">
                <FileText size={20} opacity={0.3} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{art.title || "无标题"}</h3>
              <p className="text-xs opacity-40 mt-0.5">
                {modules.find((m) => m.id === art.moduleId)?.name} · {art.isPublished ? "已发布" : "草稿"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setEditing(art);
                  setForm({
                    title: art.title || "",
                    content: art.content || "",
                    coverImage: art.coverImage || "",
                    moduleId: art.moduleId,
                    collectionId: art.collectionId || 0,
                    isPublished: art.isPublished,
                  });
                  setShowForm(true);
                }}
                className="p-2 rounded-lg opacity-50 hover:opacity-100"
              >
                <Edit2 size={16} />
              </button>
              <button onClick={() => remove(art.id)} className="p-2 rounded-lg opacity-50 hover:opacity-100 text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
