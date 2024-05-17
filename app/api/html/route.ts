import { createClient } from "@/ai/client";

import { ChatCompletionCreateParamsStreaming } from "openai/resources/index.mjs";
import PartySocket from "partysocket";

export async function POST(req: Request) {
  const body = await req.formData();
  const user = body.get("user")?.toString();

  return new Response(
    new ReadableStream({
      async start(controller) {
        const ws = new PartySocket({
          host: "localhost:1999",
          room: "my-room",
          query: { page: user },
        });

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.type === "update") {
            controller.enqueue(msg.data.chunk);
          } else if (msg.type === "finish") {
            controller.close();
          }
        };
      },
    }).pipeThrough(new TextEncoderStream()),
    {
      headers: {
        "Content-Type": "text/html",
      },
      status: 200,
    }
  );
}
