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
  sync_create_table_parent:        ["Adding table: test3s", "Setting parent: test1s - to table: test3s"],
  sync_create_table_parent_add:    ["Removing table: test3s", "Adding table: test3s", "Setting parent: test1s - to table: test3s"],
  sync_create_table_parent_change: ["Removing table: test3s", "Adding table: test3s", "Setting parent: test2s - to table: test3s"],
  sync_create_table_parent_remove: ["Removing table: test3s", "Adding table: test3s", "Setting auto increment: test3s"],
  sync_create_table_parent_same:   [""],
  sync_create_table_pk:            ["Adding table: test2s"]
};
