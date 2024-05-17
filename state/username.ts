import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const usernameAtom = atom<string | null>(null);
