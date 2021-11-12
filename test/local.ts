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
  types_datetime: [
    "Adding table: 'test1s'\n",
    "Setting auto increment: 'test1s'\n",
    "'test1s': Adding field: 'id' 'INT' '4'\n",
    "'test1s': Setting not null for field: 'id'\n",
    "'test1s': Adding field: 'a' 'DATETIME' ''\n",
    "'test1s': Adding field: 'b' 'DATETIME' ''\n",
    "'test1s': Adding field: 'c' 'VARCHAR' ''\n",
    "'test1s': Adding field: 'd' 'DATETIME' ''\n",
    "'test1s': Adding field: 'e' 'INT' '4'\n",
    "'test1s': Adding field: 'f' 'DATETIME' ''\n",
    "'test1s': Setting default value '1976-01-23T14:00:00.000Z' for field: 'f'\n",
    "'test1s': Setting not null for field: 'f'\n",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique\n"
  ],
  types_datetime_changes: [
    "'test1s': Removing field: 'f'\n",
    "'test1s': Changing field type: 'b' 'VARCHAR' ''\n",
    "'test1s': Changing field type: 'c' 'DATETIME' ''\n",
    "'test1s': Changing field type: 'd' 'INT8' '8'\n",
    "'test1s': Changing field type: 'e' 'DATETIME' ''\n"
  ],
  types_int: [
    "Adding table: 'test1s'\n",
    "Setting auto increment: 'test1s'\n",
    "'test1s': Adding field: 'id' 'INT' '4'\n",
    "'test1s': Setting not null for field: 'id'\n",
    "'test1s': Adding field: 'a' 'VARCHAR' '23'\n",
    "'test1s': Adding field: 'b' 'VARCHAR' '23'\n",
    "'test1s': Adding field: 'c' 'VARCHAR' ''\n",
    "'test1s': Adding field: 'd' 'VARCHAR' '23'\n",
    "'test1s': Adding field: 'e' 'VARCHAR' ''\n",
    "'test1s': Setting default value '23' for field: 'e'\n",
    "'test1s': Setting not null for field: 'e'\n",
    "'test1s': Adding field: 'f' 'VARCHAR' ''\n",
    "'test1s': Setting default value '23' for field: 'f'\n",
    "'test1s': Setting not null for field: 'f'\n",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique\n"
  ],
  types_int_change: [
    "'test1s': Changing field type: 'a' 'INT' '4'\n",
    "'test1s': Changing field type: 'b' 'VARCHAR' ''\n",
    "'test1s': Changing field type: 'c' 'VARCHAR' '23'\n",
    "'test1s': Changing field type: 'd' 'VARCHAR' '42'\n",
    "'test1s': Changing default value to '42' for field: 'e'\n"
  ],
  sync_create_table: [
    "Adding table: 'test1s'\n",
    "Setting auto increment: 'test1s'\n",
    "'test1s': Adding field: 'id' 'INT' '4'\n",
    "'test1s': Setting not null for field: 'id'\n",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique\n"
  ],
  sync_create_table_exists: [""],
  sync_create_table_int8id: [
    "Adding table: 'test1s'\n",
    "Setting auto increment: 'test1s'\n",
    "'test1s': Adding field: 'id' 'INT8' '8'\n",
    "'test1s': Setting not null for field: 'id'\n",
    "'test1s': Adding field: 'a' 'INT' '4'\n",
    "'test1s': Adding field: 'b' 'INT8' '8'\n",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique\n"
  ],
  sync_create_table_parent:        ["Adding table: 'test3s'\n", "Setting parent: 'test1s' - to table: 'test3s'\n"],
  sync_create_table_parent_add:    ["Removing table: 'test3s'\n", "Adding table: 'test3s'\n", "Setting parent: 'test1s' - to table: 'test3s'\n"],
  sync_create_table_parent_change: ["Removing table: 'test3s'\n", "Adding table: 'test3s'\n", "Setting parent: 'test2s' - to table: 'test3s'\n"],
  sync_create_table_parent_remove: [
    "Removing table: 'test3s'\n",
    "Adding table: 'test3s'\n",
    "Setting auto increment: 'test3s'\n",
    "'test3s': Adding field: 'id' 'INT' '4'\n",
    "'test3s': Setting not null for field: 'id'\n",
    "'test3s': Adding index: 'test3s_id_unique' on ('id') type 'btree' unique\n"
  ],
  sync_create_table_parent_same: [""],
  sync_create_table_pk:          [
    "Adding table: 'test2s'\n",
    "'test2s': Adding field: 'a' 'INT' '4'\n",
    "'test2s': Setting not null for field: 'a'\n",
    "'test2s': Adding field: 'b' 'INT' '4'\n",
    "'test2s': Adding index: 'test2s_a_unique' on ('a') type 'btree' unique\n",
    "'test2s': Adding index: 'test2s_b_unique' on ('b') type 'btree' unique\n"
  ],
  sync_drop_column:   ["'test2s': Removing index: 'test2s_b_unique'\n", "'test2s': Removing field: 'b'\n"],
  sync_field_options: [
    "Adding table: 'test1s'\n",
    "Setting auto increment: 'test1s'\n",
    "'test1s': Adding field: 'id' 'INT' '4'\n",
    "'test1s': Setting not null for field: 'id'\n",
    "'test1s': Adding field: 'a' 'INT' '4'\n",
    "'test1s': Adding field: 'b' 'INT' '4'\n",
    "'test1s': Setting not null for field: 'b'\n",
    "'test1s': Adding field: 'c' 'INT' '2'\n",
    "'test1s': Setting default value '23' for field: 'c'\n",
    "'test1s': Setting not null for field: 'c'\n",
    "'test1s': Adding field: 'd' 'VARCHAR' ''\n",
    "'test1s': Setting default value '23' for field: 'd'\n",
    "'test1s': Setting not null for field: 'd'\n",
    "'test1s': Adding field: 'f' 'INT' '4'\n",
    "'test1s': Adding field: 'h' 'INT' '4'\n",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique\n",
    "'test1s': Adding index: 'test1s_a_unique' on ('a') type 'btree' unique\n"
  ],
  sync_field_options_change: [
    "'test1s': Removing index: 'test1s_a_unique'\n",
    "'test1s': Removing field: 'h'\n",
    "'test1s': Setting default value '23' for field: 'a'\n",
    "'test1s': Setting not null for field: 'a'\n",
    "'test1s': Dropping not null for field: 'b'\n",
    "'test1s': Dropping default value for field: 'c'\n",
    "'test1s': Changing field type: 'd' 'INT8' '8'\n",
    "'test1s': Changing default value to '42' for field: 'd'\n",
    "'test1s': Changing field type: 'f' 'INT8' '8'\n",
    "'test1s': Setting not null for field: 'f'\n",
    "'test1s': Adding index: 'test1s_b_unique' on ('b') type 'btree' unique\n"
  ],
  sync_foreign_keys: [
    "Adding table: 'test1s'\n",
    "Setting auto increment: 'test1s'\n",
    "'test1s': Adding field: 'id' 'INT' '4'\n",
    "'test1s': Adding field: 'a' 'INT' '4'\n",
    "'test1s': Adding field: 'b' 'INT8' '8'\n",
    "'test1s': Adding field: 'c' 'VARCHAR' ''\n",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique\n",
    "Adding table: 'test2s'\n",
    "Setting auto increment: 'test2s'\n",
    "'test2s': Adding field: 'id' 'INT' '4'\n"
  ],
  sync_index_1: [
    "Adding table: 'test1s'\n",
    "Setting auto increment: 'test1s'\n",
    "'test1s': Adding field: 'id' 'INT' '4'\n",
    "'test1s': Setting not null for field: 'id'\n",
    "'test1s': Adding field: 'a' 'INT' '4'\n",
    "'test1s': Adding field: 'b' 'INT8' '8'\n",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique\n",
    "'test1s': Adding index: 'ia' on ('a') type 'btree'\n"
  ],
  sync_index_2: ["'test1s': Adding index: 'ib' on ('a', 'b') type 'btree'\n"],
  sync_index_3: [
    "'test1s': Removing index: 'ia'\n",
    "'test1s': Removing index: 'ib'\n",
    "'test1s': Adding index: 'ia' on ('a') type 'hash'\n",
    "'test1s': Adding index: 'ib' on ('a', 'b') type 'btree' unique\n"
  ],
  sync_index_4: [
    "'test1s': Removing index: 'ia'\n",
    "'test1s': Removing index: 'ib'\n",
    "'test1s': Adding index: 'ia' on ('a', 'b') type 'btree'\n",
    "'test1s': Adding index: 'ib' on ('b', 'a') type 'btree' unique\n"
  ]
};
