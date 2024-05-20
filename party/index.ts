import type * as Party from "partykit/server";
import { createClient } from "@/ai/client";
import { ChatCompletionCreateParamsStreaming } from "openai/resources/index.mjs";
import { system } from "@/ai/prompt";
import { FromClient } from "@/shared/rpc";
import type { ChatMessage, User } from "@/state/multiplayer";

export default class Server implements Party.Server {
  private pageCache: Map<
    string,
    {
      cachedPage: string;
      status: "downloading" | "done";
      emitter: EventEmitter<
        | {
            type: "update";
            chunk: string;
          }
        | { type: "finish" }
      >;
    }
  > = new Map();

  private userMap: Map<string, User> = new Map();

  private chatMessages: ChatMessage[] = [];

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const path = new URL(ctx.request.url).pathname;
    if (path.endsWith("client")) {
      const users: Record<string, User> = {};

      for (const [id, user] of Array.from(this.userMap.entries())) {
        users[id] = {
          username: user.username,
          cursor: user.cursor,
          url: user.url,
        };
      }
      conn.send(
        JSON.stringify({
          type: "init",
          users,
          chatMessages: this.chatMessages,
        })
      );
      this.userMap.set(conn.id, {
        username: "anon",
        cursor: { x: 0, y: 0 },
        url: "",
      });
      return;
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    const parsedMessage: FromClient = JSON.parse(message);
    const user = this.userMap.get(sender.id) ?? {
      username: "anon",
      cursor: { x: 0, y: 0 },
      url: "",
    };
    if (parsedMessage.type === "mouse") {
      const { x, y } = parsedMessage;
      user.cursor = { x, y };
      this.room.broadcast(
        JSON.stringify({ type: "mouse", x, y, sender: sender.id })
      );
    } else if (parsedMessage.type === "url") {
      const { url } = parsedMessage;
      user.url = url;
      this.room.broadcast(
        JSON.stringify({ type: "url", url, sender: sender.id })
      );
    } else if (parsedMessage.type === "setUsername") {
      console.log("setting username", parsedMessage.username);
      const { username } = parsedMessage;
      user.username = username;
      this.room.broadcast(
        JSON.stringify({ type: "setUsername", username, sender: sender.id })
      );
    } else if (parsedMessage.type === "sendMessage") {
      const { message } = parsedMessage;
      this.chatMessages.push({ id: sender.id, message });
      this.room.broadcast(
        JSON.stringify({ type: "sendMessage", message, sender: sender.id })
      );
    }

    this.userMap.set(sender.id, user);
  }

  onClose(connection: Party.Connection<unknown>): void | Promise<void> {
    this.userMap.delete(connection.id);
    this.room.broadcast(
      JSON.stringify({ type: "close", sender: connection.id })
    );
  }

  updatePage(page: string, chunk: string) {
    const cachedPage = this.pageCache.get(page);
    if (!cachedPage) return;
    cachedPage.cachedPage += chunk;
    cachedPage.emitter.emit({ type: "update", chunk });
  }

  finishPage(page: string) {
    const cachedPage = this.pageCache.get(page);
    if (!cachedPage) return;
    cachedPage.status = "done";
    cachedPage.emitter.emit({ type: "finish" });
  }

  onRequest(req: Party.Request): Response | Promise<Response> {
    if (!new URL(req.url).pathname.endsWith("portal")) {
      return new Response("", { status: 404 });
    }

    const searchParams = new URL(req.url).searchParams;
    const pageId = decodeURIComponent(searchParams.get("page") ?? "");
    let cachedPage = this.pageCache.get(pageId);

    if (!cachedPage) {
      cachedPage = {
        cachedPage: "",
        status: "downloading",
        emitter: new EventEmitter(),
      };
      this.pageCache.set(pageId, cachedPage);
      spawnLLMResponse(this, pageId);
    }

    if (cachedPage.status === "done") {
      return new Response(cachedPage.cachedPage, {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response(
      new ReadableStream({
        async start(controller) {
          const page = cachedPage!;
          controller.enqueue(page.cachedPage);
          const unsub = page.emitter.sub((event) => {
            if (event.type === "update") {
              controller.enqueue(event.chunk);
            } else if (event.type === "finish") {
              unsub();
              controller.close();
            }
          });
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
          `<!DOCTYPE html><html><head><script src="${process.env.WEBAPP_URL}/bootstrap.js"></script>\n` +
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

  const stream = await createClient(
    process.env.OPENAI_API_KEY!
  ).chat.completions.create(params);

  return stream;
}

class EventEmitter<TEvent> {
  private listeners = new Set<(event: TEvent) => void>();

  sub(listener: (event: TEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: TEvent) {
    for (const listener of Array.from(this.listeners)) {
      listener(event);
    }
  }
}
