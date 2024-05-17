import { useAtom } from "jotai";
import { multiplayerStateAtom, User } from "../state/multiplayer";
import { Card, Flex, Heading } from "@radix-ui/themes";

export function Portals() {
  const [multiplayerState] = useAtom(multiplayerStateAtom);
  const { users } = multiplayerState;

  const usersGroupedByPage: { [key: string]: User[] } = {};

  for (const user in users) {
    if (users[user].url === "") continue;
    if (usersGroupedByPage[users[user].url]) {
      usersGroupedByPage[users[user].url].push(users[user]);
    } else {
      usersGroupedByPage[users[user].url] = [users[user]];
    }
  }

  const sortedPages = Object.entries(usersGroupedByPage).sort(
    (a, b) => b[1].length - a[1].length
  );

  return (
    <Card style={{ width: "100%", height: "100%" }}>
      <Flex
        direction="column"
        gap="10px"
        style={{ width: "100%", height: "100%" }}
      >
        <Heading>Portals</Heading>
      </Flex>
    </Card>
  );
}
