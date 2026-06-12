import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";
import { rateLimit } from "@/lib/rate-limit";
import { checkAdmin } from "@/lib/admin-auth";

const ALLOWED_TYPES = [
  "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif",
  "video/mp4", "video/webm", "video/mov", "video/quicktime"
];
const MAX_SIZE = 500 * 1024 * 1024; // 500MB

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "mp4", "webm", "mov"];

function isAllowedFile(file: File): boolean {
  // 如果 type 已知且在白名单
  if (file.type && ALLOWED_TYPES.includes(file.type)) return true;
  // 如果 type 为空，用扩展名判断
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ALLOWED_EXTS.includes(ext)) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP: 10 uploads per 10 minutes (skip for logged-in admin)
    const adminAuth = checkAdmin(req);
    if (!adminAuth.ok) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
      const limit = rateLimit(`upload:${ip}`, 10, 10 * 60000);
      if (!limit.allowed) {
        return NextResponse.json({ error: "上传过于频繁，请稍后再试" }, { status: 429 });
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "没有文件" }, { status: 400 });
    }

    if (!isAllowedFile(file)) {
      return NextResponse.json({ error: `不支持的文件类型: ${file.type || "unknown"} (${file.name})` }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "文件大小超过500MB限制" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const type = file.type?.startsWith("image/")
      ? "image"
      : file.type?.startsWith("video/")
      ? "video"
      : "file";

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename: file.name,
      type,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "服务器内部错误，上传失败" }, { status: 500 });
  }
}
