"use client";

import { FileTextIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Box, Container, Flex, TextField } from "@radix-ui/themes";

export default function Home() {
  return (
    <Flex direction="column" flexGrow="1" p="8" width="1024px" align="stretch">
      <Box width="100%">
        <form
          style={{ display: "contents" }}
          target={`output`}
          action="/api/html"
          method="post"
        >
          <TextField.Root placeholder="Url" name="user">
            <TextField.Slot>
              <FileTextIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </form>
      </Box>
      <iframe style={{ flex: 1, width: "100%" }} name="output" id="output" />
    </Flex>
  );
}
