import { usernameAtom } from "@/state/username";
import { PersonIcon } from "@radix-ui/react-icons";
import {
  Button,
  Flex,
  TextField,
  Container,
  Box,
  Heading,
  Text,
  Card,
} from "@radix-ui/themes";
import { useAtom } from "jotai";
import { useState } from "react";

export function Login() {
  const [username, setUsername] = useAtom(usernameAtom);
  const [localUsername, setLocalUsername] = useState<string | null>(
    username ?? ""
  );
  return (
    <Flex direction="column" flexGrow="1" p="8" align="center" justify="start">
      <Flex direction="row" p="8" width="512px" align="center" justify="center">
        <form
          style={{ display: "contents" }}
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (localUsername) {
              setUsername(localUsername);
            }
          }}
        >
          <Box flexGrow="1">
            <TextField.Root
              placeholder="Name"
              name="username"
              onChange={(e) => setLocalUsername(e.target.value)}
              value={localUsername ?? ""}
            >
              <TextField.Slot>
                <PersonIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
          </Box>
          <Button type="submit">Submit</Button>
        </form>
      </Flex>
      <Container size="2">
        <Card>
          <Flex direction="column" gap="4">
            <Card>
              <Flex direction="column" gap="2">
                <Heading as="h2" size="8">
                  Multisim Network Test
                </Heading>

                <Text>
                  This is a network test of our multiplayer capabilities.
                  We&apos;re testing to see if it&apos;s fun to interact with
                  the app in a multiplayer setting. Please note this isn&apos;t
                  fully fleshed out yet. Here are some caveats:
                </Text>
                <ul>
                  <li>
                    History and sharing permalinks is not implemented yet.
                  </li>
                  <li>
                    Site generation is subpar at the moment. I have not spent
                    anytime iterating the prompting
                  </li>
                  <li>Refreshing pages doesn&apos;t work.</li>
                  <li>No user profiles</li>
                </ul>
                <Text>
                  Is this fun? Are you running into issues? Do you think it is a
                  good idea for the imagined web to be multiplayer or is this a
                  garbage idea? Reach out to{" "}
                  <a
                    href="https://x.com/sawyerhood"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sawyer
                  </a>
                </Text>
              </Flex>
            </Card>
            <Card>
              <Flex direction="column" gap="2">
                <Heading as="h3" size="6">
                  What are your plans for this?
                </Heading>
                <Text>
                  Not sure! I thought this would just be fun to build. If there
                  is interest I might continue to develop this and potentially
                  opensource it. It is also a success if Websim copies this.
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Card>
      </Container>
    </Flex>
  );
}
