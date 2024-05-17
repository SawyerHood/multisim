import { usernameAtom } from "@/state/username";
import { PersonIcon } from "@radix-ui/react-icons";
import { Button, Flex, TextField, Container, Box } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { useState } from "react";

export function Login() {
  const [username, setUsername] = useAtom(usernameAtom);
  const [localUsername, setLocalUsername] = useState<string | null>(
    username ?? ""
  );
  return (
    <Flex
      direction="row"
      flexGrow="1"
      p="8"
      width="512px"
      align="center"
      justify="center"
    >
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
