import { atomWithStorage } from "jotai/utils";

export const usernameAtom = atomWithStorage<string | null>("username", null);
