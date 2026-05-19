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
  medias: { id: number; url: string; type: string; filename?: string }[];
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
  const [mediaList, setMediaList] = useState<{ pid: number; url: string; type: string; filename: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ filename: string; percent: number; status?: "uploading" | "error" | "done" } | null>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const mediaFileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextPidRef = useRef(1);

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

  const uploadFile = (file: File): Promise<{ url: string; type: string; filename: string }> => {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append("file", file);
      const xhr = new XMLHttpRequest();
      setUploadProgress({ filename: file.name, percent: 0, status: "uploading" });
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress({ filename: file.name, percent, status: "uploading" });
        }
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.error) {
              setUploadProgress({ filename: file.name, percent: 100, status: "error" });
              setTimeout(() => setUploadProgress(null), 2500);
              reject(new Error(data.error));
            } else {
              setUploadProgress({ filename: file.name, percent: 100, status: "done" });
              setTimeout(() => setUploadProgress(null), 800);
              resolve(data);
            }
          } catch {
            setUploadProgress({ filename: file.name, percent: 100, status: "error" });
            setTimeout(() => setUploadProgress(null), 2500);
            reject(new Error("解析响应失败"));
          }
        } else {
          let msg = `上传失败: ${xhr.status}`;
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.error) msg = data.error;
          } catch {}
          setUploadProgress({ filename: file.name, percent: 100, status: "error" });
          setTimeout(() => setUploadProgress(null), 2500);
          reject(new Error(msg));
        }
      });
      xhr.addEventListener("error", () => {
        setUploadProgress({ filename: file.name, percent: 100, status: "error" });
        setTimeout(() => setUploadProgress(null), 2500);
        reject(new Error("上传出错，请检查网络"));
      });
      xhr.addEventListener("abort", () => {
        setUploadProgress(null);
        reject(new Error("上传已取消"));
      });
      xhr.open("POST", "/api/upload");
      xhr.send(fd);
    });
  };

  const insertMediaPlaceholder = (pid: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const placeholder = `[MEDIA:${pid}]`;
    const newContent = form.content.slice(0, start) + placeholder + form.content.slice(end);
    setForm({ ...form, content: newContent });
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
    }, 0);
  };

  const removeMedia = (pid: number) => {
    setMediaList((prev) => prev.filter((m) => m.pid !== pid));
    // 同步删除 content 中对应的占位符
    const regex = new RegExp(`\\[MEDIA:${pid}\\]`, "g");
    setForm((prev) => ({ ...prev, content: prev.content.replace(regex, "") }));
  };

  const save = async () => {
    const payload = {
      ...form,
      collectionId: form.collectionId || null,
      medias: mediaList.map((m) => ({ url: m.url, type: m.type, filename: m.filename, sortOrder: m.pid - 1 })),
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
    nextPidRef.current = 1;
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
                onClick={() => coverFileRef.current?.click()}
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
                onClick={() => mediaFileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs glass"
              >
                <Upload size={14} /> 上传图片/视频
              </button>
            </div>

            {/* 封面图上传 */}
            <input
              type="file"
              ref={coverFileRef}
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const data = await uploadFile(file);
                  setForm((prev) => ({ ...prev, coverImage: data.url }));
                } catch (err) {
                  console.error("封面上传失败:", err);
                }
                e.target.value = "";
              }}
            />
            {/* 媒体上传 */}
            <input
              type="file"
              ref={mediaFileRef}
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                for (const file of files) {
                  try {
                    const data = await uploadFile(file);
                    const pid = nextPidRef.current++;
                    setMediaList((prev) => [...prev, { pid, url: data.url, type: data.type, filename: data.filename }]);
                  } catch (err) {
                    console.error("上传失败:", err);
                  }
                }
                e.target.value = "";
              }}
            />

            {/* 上传进度条 */}
            {uploadProgress && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs opacity-60">
                  <span className="truncate max-w-[200px]">{uploadProgress.filename}</span>
                  <span>
                    {uploadProgress.status === "error"
                      ? "上传失败"
                      : uploadProgress.status === "done"
                      ? "上传成功"
                      : `${uploadProgress.percent}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${uploadProgress.percent}%`,
                      background:
                        uploadProgress.status === "error"
                          ? "#ef4444"
                          : uploadProgress.status === "done"
                          ? "#22c55e"
                          : "var(--accent)",
                    }}
                  />
                </div>
              </div>
            )}

            {mediaList.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {mediaList.map((m) => (
                  <div key={m.pid} className="relative group flex flex-col items-center gap-1">
                    {m.type === "video" ? (
                      <video
                        src={m.url}
                        preload="metadata"
                        className="w-20 h-20 rounded-xl object-cover"
                        onLoadedMetadata={(e) => {
                          const video = e.currentTarget;
                          video.currentTime = 0.1;
                        }}
                      />
                    ) : (
                      <img src={m.url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                    )}
                    <span className="absolute top-0.5 right-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white">
                      #{m.pid}
                    </span>
                    <button
                      onClick={() => removeMedia(m.pid)}
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="删除"
                    >
                      ×
                    </button>
                    <button
                      onClick={() => insertMediaPlaceholder(m.pid)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      插入 [MEDIA:{m.pid}]
                    </button>
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
                  const restored =
                    art.medias
                      ?.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                      .map((m) => {
                        const pid = m.sortOrder !== undefined && m.sortOrder !== null ? m.sortOrder + 1 : nextPidRef.current++;
                        return { pid, url: m.url, type: m.type, filename: m.filename || "" };
                      }) || [];
                  setMediaList(restored);
                  // 更新 nextPid 避免新建时重复
                  const maxPid = restored.reduce((max, m) => Math.max(max, m.pid), 0);
                  nextPidRef.current = Math.max(nextPidRef.current, maxPid + 1);
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
