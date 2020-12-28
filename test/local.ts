import { promises } from "fs";

const { unlink } = promises;

export const connection = "test.json";

export const wrongConnection = "test";
export const wrongConnectionError = "EISDIR: illegal operation on a directory, read";

export async function clean(): Promise<void> {
  try {
    await unlink("test.json");
  } catch(e) {}
}

export const expected = {
  sync_create_table:        ["Adding table: 'test1s'", "Setting auto increment: 'test1s'", "'test1s': Adding field: 'id' 'INT' '4'", "'test1s': Adding unique constraint on field: 'id'"],
  sync_create_table_exists: [""],
  sync_create_table_int8id: [
    "Adding table: 'test1s'",
    "Setting auto increment: 'test1s'",
    "'test1s': Adding field: 'id' 'INT8' '8'",
    "'test1s': Adding field: 'a' 'INT' '4'",
    "'test1s': Adding field: 'b' 'INT8' '8'",
    "'test1s': Adding unique constraint on field: 'id'"
  ],
  sync_create_table_parent:        ["Adding table: 'test3s'", "Setting parent: 'test1s' - to table: 'test3s'"],
  sync_create_table_parent_add:    ["Removing table: 'test3s'", "Adding table: 'test3s'", "Setting parent: 'test1s' - to table: 'test3s'"],
  sync_create_table_parent_change: ["Removing table: 'test3s'", "Adding table: 'test3s'", "Setting parent: 'test2s' - to table: 'test3s'"],
  sync_create_table_parent_remove: [
    "Removing table: 'test3s'",
    "Adding table: 'test3s'",
    "Setting auto increment: 'test3s'",
    "'test3s': Adding field: 'id' 'INT' '4'",
    "'test3s': Adding unique constraint on field: 'id'"
  ],
  sync_create_table_parent_same: [""],
  sync_create_table_pk:          [
    "Adding table: 'test2s'",
    "'test2s': Adding field: 'a' 'INT' '4'",
    "'test2s': Adding field: 'b' 'INT' '4'",
    "'test2s': Adding unique constraint on field: 'a'",
    "'test2s': Adding unique constraint on field: 'b'"
  ],
  sync_drop_column:   ["'test2s': Removing unique constraint on field: 'b'", "'test2s': Removing field: 'b'"],
  sync_field_options: [
    "Adding table: 'test1s'",
    "Setting auto increment: 'test1s'",
    "'test1s': Adding field: 'id' 'INT' '4'",
    "'test1s': Adding field: 'a' 'INT' '4'",
    "'test1s': Adding field: 'b' 'INT' '4'",
    "'test1s': Adding field: 'c' 'INT' '4'",
    "'test1s': Setting default value '23' for field: 'c'",
    "'test1s': Adding field: 'd' 'INT8' '8'",
    "'test1s': Setting default value '23' for field: 'd'",
    "'test1s': Adding field: 'f' 'INT' '4'",
    "'test1s': Adding field: 'h' 'INT' '4'",
    "'test1s': Adding unique constraint on field: 'id'",
    "'test1s': Adding unique constraint on field: 'a'"
  ],
  sync_field_options_change: [
    "'test1s': Removing unique constraint on field: 'a'",
    "'test1s': Removing field: 'h'",
    "'test1s': Setting default value '23' for field: 'a'",
    "'test1s': Adding unique constraint on field: 'b'"
  ]
};
