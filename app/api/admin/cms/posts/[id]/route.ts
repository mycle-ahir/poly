import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { categories: true, tags: true },
    });

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("[CMS_POST_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { 
      title, 
      content, 
      excerpt, 
      coverImage, 
      status, 
      visibility, 
      publishDate, 
      categories, 
      tags,
      authorName
    } = body;

    // Disconnect existing relations first
    await prisma.blogPost.update({
      where: { id },
      data: {
        categories: { set: [] },
        tags: { set: [] },
      },
    });

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        content,
        excerpt,
        coverImage,
        status,
        visibility,
        publishDate: publishDate ? new Date(publishDate) : undefined,
        authorName,
        categories: {
          connectOrCreate: categories?.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
        tags: {
          connectOrCreate: tags?.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { categories: true, tags: true },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("[CMS_POST_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("[CMS_POST_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
