import { useAtom, useSetAtom } from "jotai";
import { multiplayerStateAtom, User } from "../state/multiplayer";
import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { cssVarFromId, radixColorFromId } from "@/shared/colors";
import React from "react";
import { urlAtom } from "@/state/url";

export function Portals() {
  const [multiplayerState] = useAtom(multiplayerStateAtom);
  const { users } = multiplayerState;

  const usersGroupedByPage: { [key: string]: (User & { id: string })[] } = {};

  for (const user in users) {
    if (users[user].url === "") continue;
    if (usersGroupedByPage[users[user].url]) {
      usersGroupedByPage[users[user].url].push({ ...users[user], id: user });
    } else {
      usersGroupedByPage[users[user].url] = [{ ...users[user], id: user }];
    }
  }

  const sortedPages = Object.entries(usersGroupedByPage).sort(
    (a, b) => b[1].length - a[1].length
  );

  return (
    <Box gridColumn={{ initial: "span 1", xl: "span 1" }}>
      <Card style={{ height: "100%" }}>
        <Flex
          direction={{
            initial: "row",
            // xl: "column",
          }}
          gap="2"
          style={{ width: "100%", height: "100%" }}
        >
          {/* <Heading>Portals</Heading> */}
          {sortedPages.map(([url, users]) => (
            <Portal key={url} url={url} users={users} />
          ))}
        </Flex>
      </Card>
    </Box>
  );
}

const SCALE = 0.1;

function Portal({
  url,
  users,
}: {
  url: string;
  users: (User & { id: string })[];
}) {
  const setUrl = useSetAtom(urlAtom);
  return (
    <button
      style={{ padding: 0, border: "none", background: "none", margin: 0 }}
      onClick={() => setUrl(url)}
    >
      <Card asChild>
        <Flex
          direction="column"
          align="center"
          gap="1"
          p="0"
          position="relative"
        >
          <div
            style={{
              width: 1024 * SCALE,
              height: 768 * SCALE,
              overflow: "hidden",
            }}
          >
            <iframe
              src={`${
                process.env.NEXT_PUBLIC_PARTY_KIT_URL
              }/party/my-room/portal?page=${encodeURIComponent(url)}`}
              width={1024}
              height={768}
              style={{
                border: "none",
                transform: `scale(${SCALE})`,
                transformOrigin: "0 0",
                pointerEvents: "none",
              }}
            />
          </div>
          <Flex
            direction="row"
            align="end"
            p="1"
            gap="1"
            position="absolute"
            bottom="1"
            right="1"
          >
            <Text truncate>
              {users.map((user, i) => (
                <Avatar user={user} key={user.id} />
              ))}
            </Text>
          </Flex>
        </Flex>
      </Card>
    </button>
  );
}

function Avatar({ user }: { user: User & { id: string } }) {
  const size = 20;
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: cssVarFromId(user.id),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "12px",
        color: "#fff",
      }}
    >
      {user.username.charAt(0).toUpperCase()}
    </div>
  );
}
