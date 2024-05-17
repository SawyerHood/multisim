"use client";

import { BrowseView } from "@/components/BrowseView";
import { Chat } from "@/components/Chat";
import { Login } from "@/components/Login";
import { Portals } from "@/components/Portals";
import { usernameAtom } from "@/state/username";
import { Grid } from "@radix-ui/themes";
import { useAtomValue } from "jotai";

export default function Home() {
  const username = useAtomValue(usernameAtom);
  if (!username) {
    return <Login />;
  }
  return (
    <Grid
      columns="1fr 1024px 1fr"
      height="100vh"
      width="100%"
      py="8"
      px="4"
      gap="4"
    >
      <Portals />
      <BrowseView />
      <Chat />
    </Grid>
  );
}
