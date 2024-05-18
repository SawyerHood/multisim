"use client";

import { BrowseView } from "@/components/BrowseView";
import { Chat } from "@/components/Chat";
import { Login } from "@/components/Login";
import { Portals } from "@/components/Portals";
import { usernameAtom } from "@/state/username";
import { Box, Grid } from "@radix-ui/themes";
import { useAtomValue } from "jotai";

export default function Home() {
  const username = useAtomValue(usernameAtom);
  if (!username) {
    return <Login />;
  }
  return (
    <Grid
      justify="center"
      columns={{
        // xl: "1fr 1024px 226px",
        initial: "1024px minmax(226px, 400px)",
      }}
      rows={{
        // xl: "1fr",
        initial: "1fr 100px",
      }}
      height="100vh"
      width="100%"
      py="2"
      px="2"
      gap="4"
    >
      <BrowseView />
      <Box gridRow="span 2">
        <Chat />
      </Box>
      <Portals />
    </Grid>
  );
}
