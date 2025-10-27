import { atom } from "jotai";
import type { User } from "../-domain/navigation";

// Base atoms for shared data
export const currentUserAtom = atom<User | null>(null);
