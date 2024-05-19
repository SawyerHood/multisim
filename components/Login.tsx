import { usernameAtom } from "@/state/username";
import { PersonIcon } from "@radix-ui/react-icons";
import { Button, Flex, TextField, Container, Box, Text } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { useState } from "react";

export function Login() {
  const [username, setUsername] = useAtom(usernameAtom);
  const [localUsername, setLocalUsername] = useState<string | null>(
    username ?? ""
  );
  return (
    <Flex
      direction="column"
      flexGrow="1"
      p="8"
      width="512px"
      align="center"
      justify="center"
    >
      <Text as="h1" size="9" css={{ mb: "$6" }}>
        Welcome to Multisim
      </Text>
      <Box css={{ mb: "$6" }}>
        <Text as="p" size="4" css={{ mb: "$2" }}>
          Public Beta Notice: This is a network test to evaluate the multiplayer capabilities of Multisim and assess its fun factor.
        </Text>
        <Text as="p" size="4" css={{ mb: "$2" }}>
          Currently missing features include:
        </Text>
        <ul>
          <li>History and bookmarking</li>
          <li>Site generation quality</li>
          <li>Refreshing pages</li>
          <li>Sharing permanent links to pages</li>
        </ul>
        <Text as="p" size="4" css={{ mt: "$4" }}>
          Is this fun? If so, please reach out to us at <a href="https://x.com/sawyerhood">https://x.com/sawyerhood</a>.
        </Text>
      </Box>
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
  );
}
