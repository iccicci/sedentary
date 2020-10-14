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

export const expected = {
  sync_create_table:               ["Adding table: test1s", "Setting auto increment: test1s"],
  sync_create_table_exists:        [""],
  sync_create_table_parent:        ["Adding table: test3s"],
  sync_create_table_parent_add:    [""],
  sync_create_table_parent_change: [""],
  sync_create_table_parent_remove: [""],
  sync_create_table_pk:            ["Adding table: test2s"]
};
