import type { StreamChunk } from "@/types/ai";

export function encodeSSE(chunk: StreamChunk): string {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

export function createSSEStream(
  handler: (
    controller: ReadableStreamDefaultController,
    signal: AbortSignal
  ) => Promise<void>
): ReadableStream {
  let controller: ReadableStreamDefaultController;
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(ctrl) {
      controller = ctrl;
    },
    async pull() {
      const abortController = new AbortController();

      try {
        await handler(controller, abortController.signal);
      } catch (error) {
        const errChunk: StreamChunk = {
          type: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        };
        controller.enqueue(encoder.encode(encodeSSE(errChunk)));
      } finally {
        controller.close();
      }
    },
    cancel() {
      // Stream cancelled by client
    },
  });
}

export function streamChunkToSSE(
  chunk: StreamChunk,
  encoder: TextEncoder
): Uint8Array {
  return encoder.encode(encodeSSE(chunk));
}
