"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit2, Image, FolderPlus, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from "lucide-react";

interface CollectionItem {
  id: number;
  name: string;
  description?: string;
  wallpaper?: string;
  sortOrder: number;
}

interface ModuleItem {
  id: number;
  name: string;
  description?: string;
  wallpaper?: string;
  sortOrder: number;
  isActive: boolean;
  collections: CollectionItem[];
}

export default function AdminModules() {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [editing, setEditing] = useState<ModuleItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", wallpaper: "", sortOrder: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [collectionForm, setCollectionForm] = useState({ name: "", description: "", wallpaper: "", sortOrder: 0, moduleId: 0 });
  const collectionFileRef = useRef<HTMLInputElement>(null);

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

  const toggleExpand = (moduleId: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const saveCollection = async () => {
    const url = editingCollection ? `/api/collections/${editingCollection.id}` : "/api/collections";
    const method = editingCollection ? "PUT" : "POST";
    const body = editingCollection
      ? JSON.stringify({
          name: collectionForm.name,
          description: collectionForm.description,
          wallpaper: collectionForm.wallpaper,
          sortOrder: collectionForm.sortOrder,
        })
      : JSON.stringify({
          name: collectionForm.name,
          description: collectionForm.description,
          wallpaper: collectionForm.wallpaper,
          sortOrder: collectionForm.sortOrder,
          moduleId: collectionForm.moduleId,
        });
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
    setShowCollectionForm(false);
    setEditingCollection(null);
    setCollectionForm({ name: "", description: "", wallpaper: "", sortOrder: 0, moduleId: 0 });
    load();
  };

  const removeCollection = async (id: number) => {
    if (!confirm("确定删除此合集？")) return;
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    load();
  };

  const openAddCollection = (moduleId: number) => {
    setEditingCollection(null);
    setCollectionForm({ name: "", description: "", wallpaper: "", sortOrder: 0, moduleId });
    setShowCollectionForm(true);
  };

  const openEditCollection = (col: CollectionItem, moduleId: number) => {
    setEditingCollection(col);
    setCollectionForm({
      name: col.name,
      description: col.description || "",
      wallpaper: col.wallpaper || "",
      sortOrder: col.sortOrder,
      moduleId,
    });
    setShowCollectionForm(true);
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

      {showCollectionForm && (
        <div className="glass rounded-2xl p-5 mb-6 card-shadow">
          <h3 className="font-bold mb-4">{editingCollection ? "编辑合集" : "添加合集"}</h3>
          <div className="space-y-3">
            <input
              placeholder="合集名称"
              value={collectionForm.name}
              onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm glass outline-none"
              style={{ background: "var(--card-bg)" }}
            />
            <input
              placeholder="描述"
              value={collectionForm.description}
              onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm glass outline-none"
              style={{ background: "var(--card-bg)" }}
            />
            <div className="flex gap-2">
              <input
                placeholder="壁纸URL或上传"
                value={collectionForm.wallpaper}
                onChange={(e) => setCollectionForm({ ...collectionForm, wallpaper: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm glass outline-none"
                style={{ background: "var(--card-bg)" }}
              />
              <button
                onClick={() => collectionFileRef.current?.click()}
                className="px-3 py-2.5 rounded-xl glass"
              >
                <Image size={16} />
              </button>
            </div>
            <input
              type="file"
              ref={collectionFileRef}
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await uploadFile(file);
                  setCollectionForm({ ...collectionForm, wallpaper: url });
                }
              }}
            />
            <div className="flex gap-2">
              <button onClick={saveCollection} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
                保存
              </button>
              <button onClick={() => setShowCollectionForm(false)} className="px-4 py-2 rounded-xl text-sm opacity-60">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {modules.map((mod, i) => {
          const expanded = expandedModules.has(mod.id);
          return (
            <div key={mod.id} className="glass rounded-2xl p-5 card-shadow">
              <div className="flex items-start justify-between">
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
                    onClick={() => openAddCollection(mod.id)}
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

              {mod.collections.length > 0 && (
                <button
                  onClick={() => toggleExpand(mod.id)}
                  className="mt-3 flex items-center gap-1 text-xs opacity-50 hover:opacity-100 transition-opacity"
                >
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {expanded ? "收起合集" : `展开合集 (${mod.collections.length})`}
                </button>
              )}

              {expanded && mod.collections.length > 0 && (
                <div className="mt-3 space-y-2 pl-4 border-l-2 border-white/10">
                  {mod.collections.map((col) => (
                    <div key={col.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        {col.wallpaper && (
                          <img src={col.wallpaper} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{col.name}</p>
                          <p className="text-xs opacity-40">{col.description || "无描述"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditCollection(col, mod.id)}
                          className="p-1.5 rounded-lg opacity-50 hover:opacity-100"
                          title="编辑合集"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => removeCollection(col.id)}
                          className="p-1.5 rounded-lg opacity-50 hover:opacity-100 text-red-500"
                          title="删除合集"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
