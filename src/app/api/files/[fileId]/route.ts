import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = await db.file.findFirst({
    where: { id: fileId, userId: session.user.id, deletedAt: null },
  });
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  await db.file.update({
    where: { id: fileId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
