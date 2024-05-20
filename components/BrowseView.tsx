"use client";

import { FileTextIcon } from "@radix-ui/react-icons";
import { Box, Flex, TextField, Text } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { multiplayerStateAtom } from "@/state/multiplayer";
import { usernameAtom } from "@/state/username";
import { Cursor } from "./Cursor";
import { cssVarFromId } from "@/shared/colors";
import { urlAtom } from "@/state/url";
import { Chat } from "./Chat";

export function BrowseView() {
  const [multiplayerState, dispatch] = useAtom(multiplayerStateAtom);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const username = useAtomValue(usernameAtom);
  const [url, setUrl] = useAtom(urlAtom);

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

      if (event.data.type === "linkClick") {
        setUrl(event.data.href);
      }
    };

    window.addEventListener("message", messageListener);
    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, [dispatch, setUrl]);

  useEffect(() => {
    dispatch({
      type: "setUsername",
      username: username || "anon",
    });
  }, [dispatch, username]);

  useEffect(() => {
    if (url) {
      dispatch({
        type: "changeUrl",
        url,
      });
      inputRef.current!.value = url;
    }
  }, [url, dispatch]);

  return (
    <Flex direction="column" flexGrow="1" width="1024px" align="stretch">
      <Flex width="100%">
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            setUrl(inputRef.current!.value);
          }}
          style={{ display: "contents" }}
        >
          <Box flexGrow="1">
            <TextField.Root ref={inputRef} placeholder="Url" name="user">
              <TextField.Slot>
                <FileTextIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
          </Box>
        </form>
      </Flex>
      <div
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <iframe
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
          src={
            url
              ? `${
                  process.env.NEXT_PUBLIC_PARTY_KIT_URL
                }/party/my-room/portal?page=${encodeURIComponent(url)}`
              : undefined
          }
          name="output"
          id="output"
        />
        {Object.entries(users).map(
          ([id, { username, cursor, url: theirUrl }]) => {
            if (!cursor) return null;
            if (id === myID) return null;
            if (theirUrl !== url) return null;
            return (
              <Flex
                style={{
                  position: "absolute",
                  left: cursor.x,
                  top: cursor.y,
                  pointerEvents: "none",
                }}
                key={id}
                direction="column"
                align="start"
              >
                <Cursor color={cssVarFromId(id)} />
                <Box
                  style={{
                    background: cssVarFromId(id),
                  }}
                  ml="4"
                  py="0"
                  px="1"
                >
                  <Text>{username}</Text>
                </Box>
              </Flex>
            );
          }
        )}
        {/* <Box position="absolute" right="4" bottom="4">
          <Chat />
        </Box> */}
      </div>
    </Flex>
  );
}
