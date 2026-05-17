import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { providerRegistry } from "@/lib/ai/registry";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  try {
    const provider = providerRegistry.getProviderForModel("gpt-4o-mini");
    let title = "";

    await provider.streamChat(
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Generate a short, descriptive title (max 6 words) for a chat that starts with this message. Reply with ONLY the title, no quotes, no punctuation at the end:\n\n"${message.slice(0, 200)}"`,
          },
        ],
        temperature: 0.3,
        maxTokens: 20,
      },
      (chunk) => {
        if (chunk.type === "delta" && chunk.delta) {
          title += chunk.delta;
        }
      }
    );

    return NextResponse.json({ title: title.trim().slice(0, 60) });
  } catch {
    return NextResponse.json({ title: "New Chat" });
  }
}
