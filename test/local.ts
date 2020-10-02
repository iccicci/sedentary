import { promises } from "fs";

const { unlink } = promises;

export const connection = "test.db";

export const wrongConnection = "test";
export const wrongConnectionError = "EISDIR: illegal operation on a directory, read";

export async function clean(): Promise<void> {
  try {
    await unlink("test.db");
  } catch(e) {}
}
