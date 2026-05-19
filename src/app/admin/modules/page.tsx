"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit2, Image, FolderPlus, ArrowUp, ArrowDown } from "lucide-react";

interface ModuleItem {
  id: number;
  name: string;
  description?: string;
  wallpaper?: string;
  sortOrder: number;
  isActive: boolean;
  collections: { id: number; name: string }[];
}

export default function AdminModules() {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [editing, setEditing] = useState<ModuleItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", wallpaper: "", sortOrder: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then((data) => setModules(data))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await r.json();
    return data.url;
  };

  const save = async () => {
    const url = editing ? `/api/modules/${editing.id}` : "/api/modules";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", description: "", wallpaper: "", sortOrder: 0 });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("确定删除此模块？")) return;
    await fetch(`/api/modules/${id}`, { method: "DELETE" });
    load();
  };

  const addCollection = async (moduleId: number) => {
    const name = prompt("合集名称：");
    if (!name) return;
    await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, moduleId, sortOrder: 0 }),
    });
    load();
  };

  const moveModule = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;

    const reordered = [...modules];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

    await Promise.all(
      reordered.map((mod, i) =>
        fetch(`/api/modules/${mod.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: i }),
        })
      )
    );
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">模块管理</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: "", description: "", wallpaper: "", sortOrder: 0 });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Plus size={16} /> 添加模块
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-5 mb-6 card-shadow">
          <h3 className="font-bold mb-4">{editing ? "编辑模块" : "添加模块"}</h3>
          <div className="space-y-3">
            <input
              placeholder="模块名称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm glass outline-none"
              style={{ background: "var(--card-bg)" }}
            />
            <input
              placeholder="描述"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm glass outline-none"
              style={{ background: "var(--card-bg)" }}
            />
            <div className="flex gap-2">
              <input
                placeholder="壁纸URL或上传"
                value={form.wallpaper}
                onChange={(e) => setForm({ ...form, wallpaper: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm glass outline-none"
                style={{ background: "var(--card-bg)" }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="px-3 py-2.5 rounded-xl glass"
              >
                <Image size={16} />
              </button>
            </div>
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await uploadFile(file);
                  setForm({ ...form, wallpaper: url });
                }
              }}
            />
            <div className="flex gap-2">
              <button onClick={save} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
                保存
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm opacity-60">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {modules.map((mod, i) => (
          <div key={mod.id} className="glass rounded-2xl p-5 card-shadow flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {mod.wallpaper && (
                  <img src={mod.wallpaper} alt="" className="w-12 h-12 rounded-xl object-cover" />
                )}
                <div>
                  <h3 className="font-bold">{mod.name}</h3>
                  <p className="text-xs opacity-50">{mod.description}</p>
                  <p className="text-xs opacity-40 mt-1">
                    排序: {mod.sortOrder} · 合集: {mod.collections.length}个
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveModule(i, "up")}
                className="p-2 rounded-lg opacity-50 hover:opacity-100"
                title="上移"
                disabled={i === 0}
              >
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => moveModule(i, "down")}
                className="p-2 rounded-lg opacity-50 hover:opacity-100"
                title="下移"
                disabled={i === modules.length - 1}
              >
                <ArrowDown size={16} />
              </button>
              <button
                onClick={() => addCollection(mod.id)}
                className="p-2 rounded-lg opacity-50 hover:opacity-100"
                title="添加合集"
              >
                <FolderPlus size={16} />
              </button>
              <button
                onClick={() => {
                  setEditing(mod);
                  setForm({
                    name: mod.name,
                    description: mod.description || "",
                    wallpaper: mod.wallpaper || "",
                    sortOrder: mod.sortOrder,
                  });
                  setShowForm(true);
                }}
                className="p-2 rounded-lg opacity-50 hover:opacity-100"
              >
                <Edit2 size={16} />
              </button>
              <button onClick={() => remove(mod.id)} className="p-2 rounded-lg opacity-50 hover:opacity-100 text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
