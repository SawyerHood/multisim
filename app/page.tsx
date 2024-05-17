"use client";

import { BrowseView } from "@/components/BrowseView";
import { Login } from "@/components/Login";
import { usernameAtom } from "@/state/username";
import { useAtomValue } from "jotai";

export default function Home() {
  const username = useAtomValue(usernameAtom);
  if (!username) {
    return <Login />;
  }
  return <BrowseView />;
}
