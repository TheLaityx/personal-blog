import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "没有文件" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop() || "";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : "file";

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename: file.name,
      type,
    });
  } catch (e) {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
