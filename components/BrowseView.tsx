"use client";

import { FileTextIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Box, Container, Flex, TextField } from "@radix-ui/themes";
import usePartySocket from "partysocket/react";
import { useEffect, useRef, useState } from "react";
import cursor from "./cursor.svg";
import Image from "next/image";
import { useAtom } from "jotai";
import { multiplayerStateAtom } from "@/state/multiplayer";

export function BrowseView() {
  const [multiplayerState, dispatch] = useAtom(multiplayerStateAtom);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cursors = multiplayerState.cursors;
  const url = multiplayerState.currentUrl;

  useEffect(() => {
    if (inputRef.current?.value !== url) {
      inputRef.current!.value = url;
      setTimeout(() => {
        formRef.current?.submit();
      }, 0);
    }
  }, [url]);

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

  return (
    <Flex direction="column" flexGrow="1" p="8" width="1024px" align="stretch">
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
        {Object.entries(cursors).map(([id, { x, y }]) => (
          <Image
            key={id}
            alt="cursor"
            src={cursor}
            width={16}
            height={16}
            style={{
              position: "absolute",
              left: x,
              top: y,
              color: "red",
            }}
          />
        ))}
      </div>
    </Flex>
  );
}
