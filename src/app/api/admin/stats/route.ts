import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = checkAdmin(req);
  if (!auth.ok) return auth.response!;

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
