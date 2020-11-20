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
  sync_create_table:               ["Adding table: 'test1s'", "Setting auto increment: 'test1s'", "'test1s': Adding field: 'id' 'INT' '8'", "'test1s': Adding unique constraint on field: 'id'"],
  sync_create_table_exists:        [""],
  sync_create_table_parent:        ["Adding table: 'test3s'", "Setting parent: 'test1s' - to table: 'test3s'"],
  sync_create_table_parent_add:    ["Removing table: 'test3s'", "Adding table: 'test3s'", "Setting parent: 'test1s' - to table: 'test3s'"],
  sync_create_table_parent_change: ["Removing table: 'test3s'", "Adding table: 'test3s'", "Setting parent: 'test2s' - to table: 'test3s'"],
  sync_create_table_parent_remove: [
    "Removing table: 'test3s'",
    "Adding table: 'test3s'",
    "Setting auto increment: 'test3s'",
    "'test3s': Adding field: 'id' 'INT' '8'",
    "'test3s': Adding unique constraint on field: 'id'"
  ],
  sync_create_table_parent_same: [""],
  sync_create_table_pk:          [
    "Adding table: 'test2s'",
    "'test2s': Adding field: 'a' 'INT' '8'",
    "'test2s': Adding field: 'b' 'INT' '8'",
    "'test2s': Adding unique constraint on field: 'a'",
    "'test2s': Adding unique constraint on field: 'b'"
  ],
  sync_drop_column: ["'test2s': Removing unique constraint on field: 'b'", "'test2s': Removing field: 'b'"]
};
