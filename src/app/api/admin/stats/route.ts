import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [moduleCount, articleCount, commentCount, mediaCount] = await Promise.all([
      prisma.module.count(),
      prisma.article.count(),
      prisma.comment.count(),
      prisma.media.count(),
    ]);
    return NextResponse.json({ moduleCount, articleCount, commentCount, mediaCount });
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
