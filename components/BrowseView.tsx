"use client";

import { FileTextIcon } from "@radix-ui/react-icons";
import { Box, Flex, TextField, Text } from "@radix-ui/themes";
import { useEffect, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { multiplayerStateAtom } from "@/state/multiplayer";
import { usernameAtom } from "@/state/username";
import { Cursor } from "./Cursor";

export function BrowseView() {
  const [multiplayerState, dispatch] = useAtom(multiplayerStateAtom);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const username = useAtomValue(usernameAtom);

  const users = multiplayerState.users;
  const myID = multiplayerState.socket?.id;

  useEffect(() => {
    const messageListener = (event: MessageEvent) => {
      if (event.data.type === "mousemove") {
        dispatch({
          type: "moveCursor",
          x: event.data.x,
          y: event.data.y,
        });
      }
    };

    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch({
      type: "setUsername",
      username: username || "anon",
    });
  }, [dispatch, username]);

  return (
    <Flex direction="column" flexGrow="1" width="1024px" align="stretch">
      <Box width="100%">
        <form
          ref={formRef}
          onSubmit={(e) => {
            dispatch({
              type: "changeUrl",
              url: inputRef.current!.value,
            });
          }}
          style={{ display: "contents" }}
          target={`output`}
          action="/api/html"
          method="post"
        >
          <TextField.Root ref={inputRef} placeholder="Url" name="user">
            <TextField.Slot>
              <FileTextIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </form>
      </Box>
      <div
        style={{ flex: 1, width: "100%", height: "100%", position: "relative" }}
      >
        <iframe
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
          name="output"
          id="output"
        />
        {Object.entries(users).map(([id, { username, cursor, url }]) => {
          if (!cursor) return null;
          if (id === myID) return null;
          if (users[myID!]?.url !== url) return null;
          return (
            <Flex
              style={{ position: "absolute", left: cursor.x, top: cursor.y }}
              key={id}
              direction="column"
              align="start"
            >
              <Cursor color={CURSOR_COLORS[hashUserNameForColor(id)]} />
              <Box
                style={{
                  background: CURSOR_COLORS[hashUserNameForColor(id)],
                }}
                ml="4"
                py="0"
                px="1"
              >
                <Text>{username}</Text>
              </Box>
            </Flex>
          );
        })}
      </div>
    </Flex>
  );
}

const CURSOR_COLORS = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "black",
];

function hashUserNameForColor(id: string) {
  return (
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    CURSOR_COLORS.length
  );
}
