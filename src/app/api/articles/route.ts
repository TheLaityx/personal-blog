import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeString, isValidId } from "@/lib/validate";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const collectionId = searchParams.get("collectionId");
    const where: Record<string, unknown> = { isPublished: true };
    if (moduleId) {
      const id = isValidId(moduleId);
      if (id) where.moduleId = id;
    }
    if (collectionId) {
      const id = isValidId(collectionId);
      if (id) where.collectionId = id;
    }
    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { medias: true, comments: true, module: true, collection: true },
    });
    return NextResponse.json(articles);
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const moduleId = isValidId(data.moduleId);
    if (!moduleId) {
      return NextResponse.json({ error: "模块ID无效" }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: {
        title: sanitizeString(data.title, 200) || null,
        content: sanitizeString(data.content, 50000) || null,
        coverImage: sanitizeString(data.coverImage, 500) || null,
        moduleId,
        collectionId: isValidId(data.collectionId),
        isPublished: Boolean(data.isPublished),
        sortOrder: Number(data.sortOrder) || 0,
      },
      include: { medias: true },
    });
    if (Array.isArray(data.medias) && data.medias.length) {
      await prisma.media.createMany({
        data: data.medias.map((m: { url: string; type: string; filename: string }) => ({
          url: sanitizeString(m.url, 500) || "",
          type: sanitizeString(m.type, 50) || "file",
          filename: sanitizeString(m.filename, 200) || "",
          articleId: article.id,
        })),
      });
    }
    return NextResponse.json(article);
  } catch (e) {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
