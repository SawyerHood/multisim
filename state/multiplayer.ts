import { FromServer } from "@/shared/rpc";
import { atom } from "jotai";
import PartySocket from "partysocket";

type MultiplayerState = {
  users: {
    [key: string]: User;
  };

  chatMessages: ChatMessage[];
  socket: PartySocket | null;
};

export type User = {
  username: string;
  cursor: Cursor;
  url: string;
};

type Cursor = {
  x: number;
  y: number;
};

export type ChatMessage = {
  id: string;
  message: string;
};

const internalMultiplayerStateAtom = atom<MultiplayerState>({
  users: {},
  chatMessages: [],
  socket: null,
});

internalMultiplayerStateAtom.onMount = (set) => {
  const socket = new PartySocket({
    host: process.env.NEXT_PUBLIC_PARTY_KIT_HOST!,
    path: "client",
    room: "my-room",
  });

  socket.onmessage = (event) => {
    const parsedMessage: FromServer = JSON.parse(event.data);
    const getUser = (state: MultiplayerState, id: string) => {
      return (
        state.users[id] ?? {
          username: "anon",
          cursor: { x: 0, y: 0 },
          url: "",
        }
      );
    };
    if (parsedMessage.type === "mouse") {
      const { type, x, y, sender } = parsedMessage;
      set((prev) => {
        const user = getUser(prev, sender);
        return {
          ...prev,
          users: {
            ...prev.users,
            [sender]: { ...user, cursor: { x, y } },
          },
        };
      });
    } else if (parsedMessage.type === "url") {
      const { type, url, sender } = parsedMessage;
      set((prev) => {
        const user = getUser(prev, sender);
        return {
          ...prev,
          users: {
            ...prev.users,
            [sender]: { ...user, url: parsedMessage.url },
          },
        };
      });
    } else if (parsedMessage.type === "close") {
      set((prev) => {
        const newState = { ...prev, users: { ...prev.users } };
        delete newState.users[parsedMessage.sender];
        return newState;
      });
    } else if (parsedMessage.type === "setUsername") {
      console.log("setting username", parsedMessage.username);
      set((prev) => {
        const user = getUser(prev, parsedMessage.sender);
        return {
          ...prev,
          users: {
            ...prev.users,
            [parsedMessage.sender]: {
              ...user,
              username: parsedMessage.username,
            },
          },
        };
      });
    } else if (parsedMessage.type === "init") {
      set((prev) => ({ ...prev, users: parsedMessage.users }));
    } else if (parsedMessage.type === "sendMessage") {
      set((prev) => ({
        ...prev,
        chatMessages: [
          ...prev.chatMessages,
          { id: parsedMessage.sender, message: parsedMessage.message },
        ],
      }));
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
    }
  | {
      type: "setUsername";
      username: string;
    }
  | {
      type: "sendMessage";
      message: string;
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
    } else if (action.type === "setUsername") {
      ws.send(
        JSON.stringify({ type: "setUsername", username: action.username })
      );
    } else if (action.type === "sendMessage") {
      ws.send(JSON.stringify({ type: "sendMessage", message: action.message }));
    }
  }
);
