import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const comment = await prisma.comment.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(comment);
  } catch (e) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.comment.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
