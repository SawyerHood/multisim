import { useAtom, useSetAtom } from "jotai";
import { multiplayerStateAtom, User } from "../state/multiplayer";
import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { radixColorFromId } from "@/shared/colors";
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
        <Flex direction="column" align="center" gap="1" p="0">
          <div
            style={{
              width: 1024 * 0.2,
              height: 768 * 0.2,
              overflow: "hidden",
            }}
          >
            <iframe
              src={`http://localhost:1999/party/my-room/portal?page=${encodeURIComponent(
                url
              )}`}
              width={1024}
              height={768}
              style={{
                border: "none",
                transform: "scale(0.2)",
                transformOrigin: "0 0",
                pointerEvents: "none",
              }}
            />
          </div>
          <Flex direction="column" align="center" p="1">
            <Text truncate>
              {users.map((user, i) => (
                <React.Fragment key={user.id}>
                  <Text color={radixColorFromId(user.id)}>{user.username}</Text>
                  {i < users.length - 1 && ", "}
                </React.Fragment>
              ))}
            </Text>
            {/* <Text>is viewing this url</Text> */}
          </Flex>
        </Flex>
      </Card>
    </button>
  );
}
