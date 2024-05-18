import { multiplayerStateAtom } from "@/state/multiplayer";
import { ChatBubbleIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import {
  Box,
  Card,
  Flex,
  Heading,
  HoverCard,
  IconButton,
  Popover,
  ScrollArea,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

export function Chat() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [multiplayerState, dispatch] = useAtom(multiplayerStateAtom);
  const messages = multiplayerState.chatMessages.map((message, index) => {
    const username = multiplayerState.users[message.id]?.username ?? "anon";
    return (
      <Message key={index} username={username} message={message.message} />
    );
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scrollRef, multiplayerState.chatMessages.length]);
  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton radius="full">
          <ChatBubbleIcon width="16" height="16" />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content side="top">
        {/* <Card style={{ width: "100%", height: "100%" }}> */}
        <Flex
          direction="column"
          gap="10px"
          style={{ width: "100%", height: "100%" }}
        >
          <Heading>Chat</Heading>
          <ScrollArea style={{ width: "100%", height: "100%" }} ref={scrollRef}>
            <Flex direction="column" gap="2">
              {messages}
            </Flex>
          </ScrollArea>
          <Box width="100%">
            <form
              style={{ display: "contents" }}
              onSubmit={(e) => {
                e.preventDefault();
                if (draftMessage.trim().length > 0) {
                  dispatch({ type: "sendMessage", message: draftMessage });
                  setDraftMessage("");
                }
              }}
            >
              <TextField.Root
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
                placeholder="Send a message"
              >
                <TextField.Slot></TextField.Slot>
                <TextField.Slot>
                  <IconButton type="submit" variant="ghost">
                    <PaperPlaneIcon width="16" height="16" />
                  </IconButton>
                </TextField.Slot>
              </TextField.Root>
            </form>
          </Box>
        </Flex>
        {/* </Card> */}
      </Popover.Content>
    </Popover.Root>
  );
}

function Message({ username, message }: { username: string; message: string }) {
  return (
    <Box width="100%">
      <Card>
        <Text as="div" size="1" weight="bold">
          {username}
        </Text>
        <Text as="div" color="gray" size="1">
          {message}
        </Text>
      </Card>
    </Box>
  );
}
