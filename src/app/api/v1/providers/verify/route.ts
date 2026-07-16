import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyGeminiKey } from "@/lib/providers";

export const runtime = "nodejs";

const requestSchema = z.object({
  provider: z.enum(["google"]),
  key: z.string().trim().min(8).max(200),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = requestSchema.parse(body);

    if (input.provider === "google") {
      const result = await verifyGeminiKey(input.key);
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, provider: "google", error: result.error },
          { status: 400 },
        );
      }
      return NextResponse.json({
        ok: true,
        provider: "google",
        model: result.model,
        latencyMs: result.latencyMs,
        preview: result.preview,
      });
    }

    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid verify request", issues: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
