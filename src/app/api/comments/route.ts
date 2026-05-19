import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");
    const where = articleId ? { articleId: Number(articleId), isApproved: true } : { isApproved: true };
    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        replies: {
          where: { isApproved: true },
          orderBy: { createdAt: "asc" },
        },
        article: { select: { title: true, id: true } },
      },
    });
    return NextResponse.json(comments);
  } catch (e) {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, author, email, articleId, parentId } = await req.json();
    const comment = await prisma.comment.create({
      data: {
        content,
        author: author || "匿名",
        email,
        articleId: articleId || null,
        parentId: parentId || null,
      },
    });
    return NextResponse.json(comment);
  } catch (e) {
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}
