import type { ChatMessage } from "@/state/multiplayer";

export type FromClient =
  | {
      type: "url";
      url: string;
    }
  | {
      type: "mouse";
      x: number;
      y: number;
    }
  | {
      type: "setUsername";
      username: string;
    }
  | {
      type: "sendMessage";
      message: string;
    };

export type FromServer =
  | {
      type: "url";
      url: string;
      sender: string;
    }
  | {
      type: "mouse";
      x: number;
      y: number;
      sender: string;
    }
  | {
      type: "setUsername";
      username: string;
      sender: string;
    }
  | {
      type: "close";
      sender: string;
    }
  | {
      type: "init";
      users: {
        [key: string]: {
          username: string;
          url: string;
          cursor: {
            x: number;
            y: number;
          };
        };
      };
      chatMessages: ChatMessage[];
    }
  | {
      type: "sendMessage";
      message: string;
      sender: string;
    };
