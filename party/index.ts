import type * as Party from "partykit/server";
import { createClient } from "@/ai/client";
import { ChatCompletionCreateParamsStreaming } from "openai/resources/index.mjs";
import { system } from "@/ai/prompt";
import { FromClient } from "@/shared/rpc";

export default class Server implements Party.Server {
  private pageCache: Map<
    string,
    {
      cachedPage: string;
      connections: Party.Connection[];
      status: "downloading" | "done";
    }
  > = new Map();

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const path = new URL(ctx.request.url).pathname;
    if (path === "/client") {
      return;
    }
    const searchParams = new URL(ctx.request.url).searchParams;
    const pageId = decodeURIComponent(searchParams.get("page") ?? "");
    let cachedPage = this.pageCache.get(pageId);

    if (!cachedPage) {
      cachedPage = {
        cachedPage: "",
        connections: [],
        status: "downloading",
      };
      this.pageCache.set(pageId, cachedPage);
      spawnLLMResponse(this, pageId);
    }

    if (cachedPage.status === "done") {
      conn.send(
        JSON.stringify({
          type: "update",
          data: { pageId, chunk: cachedPage.cachedPage },
        })
      );
      conn.send(JSON.stringify({ type: "finish", data: { pageId } }));
    }

    if (cachedPage.status === "downloading") {
      cachedPage.connections.push(conn);
      conn.send(
        JSON.stringify({
          type: "update",
          data: { pageId, chunk: cachedPage.cachedPage },
        })
      );
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    const parsedMessage: FromClient = JSON.parse(message);
    if (parsedMessage.type === "mouse") {
      const { x, y } = parsedMessage;
      this.room.broadcast(
        JSON.stringify({ type: "mouse", x, y, sender: sender.id }),
        [sender.id]
      );
    } else if (parsedMessage.type === "url") {
      const { url } = parsedMessage;
      this.room.broadcast(JSON.stringify({ type: "url", url }), [sender.id]);
    }
  }

  updatePage(page: string, chunk: string) {
    const cachedPage = this.pageCache.get(page);
    if (!cachedPage) return;
    cachedPage.cachedPage += chunk;
    for (const conn of cachedPage.connections) {
      conn.send(
        JSON.stringify({ type: "update", data: { pageId: page, chunk } })
      );
    }
  }

  finishPage(page: string) {
    const cachedPage = this.pageCache.get(page);
    if (!cachedPage) return;
    cachedPage.status = "done";
    for (const conn of cachedPage.connections) {
      conn.send(JSON.stringify({ type: "finish", data: { pageId: page } }));
    }
    cachedPage.connections = [];
  }
}

Server satisfies Party.Worker;

export async function spawnLLMResponse(server: Server, page: string) {
  const programStream = await createProgramStream({
    system,
    user: page,
    model: "gpt-4o",
  });

  let programResult = "";

  let startedSending = false;
  let sentIndex = 0;

  for await (const chunk of programStream) {
    const value = chunk.choices[0]?.delta?.content || "";

    programResult += value;

    if (startedSending) {
      const match = programResult.match(/<\/html>/);
      if (match) {
        server.updatePage(
          page,
          programResult.slice(sentIndex, match.index! + match[0].length)
        );
        break;
      } else {
        server.updatePage(page, value);
        sentIndex = programResult.length;
      }
    } else {
      const match = programResult.match(/<head>/);
      if (match) {
        programResult =
          '<!DOCTYPE html><html><head><script src="/bootstrap.js"></script>\n' +
          programResult.slice(match.index! + match[0].length);
        server.updatePage(page, programResult);
        sentIndex = programResult.length;
        startedSending = true;
      }
    }
  }
  server.finishPage(page);
}

async function createProgramStream({
  system,
  user,
  model,
}: {
  system: string;
  user: string;
  model: string;
}) {
  const params: ChatCompletionCreateParamsStreaming = {
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: user,
      },
    ],
    model: model,
    temperature: 1,
    max_tokens: 4000,
    stream: true,
  };

  console.log(params);

  const stream = await createClient(
    process.env.OPENAI_API_KEY!
  ).chat.completions.create(params);

  return stream;
}
