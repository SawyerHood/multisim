import { FromServer } from "@/shared/rpc";
import { atom } from "jotai";
import PartySocket from "partysocket";

type MultiplayerState = {
  players: {
    [key: string]: Player;
  };
  cursors: {
    [key: string]: Cursor;
  };
  currentUrl: string;
  chatMessages: ChatMessage[];
  socket: PartySocket | null;
};

type Player = {
  name: string;
};

type Cursor = {
  x: number;
  y: number;
};

type ChatMessage = {
  playerId: string;
  message: string;
};

const internalMultiplayerStateAtom = atom<MultiplayerState>({
  players: {},
  cursors: {},
  currentUrl: "",
  chatMessages: [],
  socket: null,
});

internalMultiplayerStateAtom.onMount = (set) => {
  const socket = new PartySocket({
    host: "localhost:1999",
    path: "client",
    room: "my-room",
  });
  socket.onmessage = (event) => {
    const parsedMessage: FromServer = JSON.parse(event.data);
    if (parsedMessage.type === "mouse") {
      const { type, x, y, sender } = parsedMessage;
      set((prev) => ({
        ...prev,
        cursors: { ...prev.cursors, [sender]: { x, y } },
      }));
    } else if (parsedMessage.type === "url") {
      set((prev) => ({ ...prev, currentUrl: parsedMessage.url }));
    }
  };

  set((prev) => ({ ...prev, socket }));

  return () => {
    socket.close();
    set((prev) => ({ ...prev, socket: null }));
  };
};

export type MultiplayerAction =
  | {
      type: "moveCursor";
      x: number;
      y: number;
    }
  | {
      type: "changeUrl";
      url: string;
    };

export const multiplayerStateAtom = atom<
  MultiplayerState,
  [MultiplayerAction],
  any
>(
  (get) => get(internalMultiplayerStateAtom),
  (get, _set, action: MultiplayerAction) => {
    const ws = get(multiplayerStateAtom).socket!;
    if (action.type === "moveCursor") {
      ws.send(JSON.stringify({ type: "mouse", x: action.x, y: action.y }));
    } else if (action.type === "changeUrl") {
      ws.send(JSON.stringify({ type: "url", url: action.url }));
    }
  }
);
