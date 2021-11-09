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
    "Adding table: 'test1s'",
    "Setting auto increment: 'test1s'",
    "'test1s': Adding field: 'id' 'INT' '4'",
    "'test1s': Setting not null for field: 'id'",
    "'test1s': Adding field: 'a' 'DATETIME' ''",
    "'test1s': Adding field: 'b' 'DATETIME' ''",
    "'test1s': Adding field: 'c' 'VARCHAR' ''",
    "'test1s': Adding field: 'd' 'DATETIME' ''",
    "'test1s': Adding field: 'e' 'INT' '4'",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique"
  ],
  types_datetime_changes: [
    "'test1s': Changing field type: 'b' 'VARCHAR' ''",
    "'test1s': Changing field type: 'c' 'DATETIME' ''",
    "'test1s': Changing field type: 'd' 'INT8' '8'",
    "'test1s': Changing field type: 'e' 'DATETIME' ''"
  ],
  types_int: [
    "Adding table: 'test1s'",
    "Setting auto increment: 'test1s'",
    "'test1s': Adding field: 'id' 'INT' '4'",
    "'test1s': Setting not null for field: 'id'",
    "'test1s': Adding field: 'a' 'VARCHAR' '23'",
    "'test1s': Adding field: 'b' 'VARCHAR' '23'",
    "'test1s': Adding field: 'c' 'VARCHAR' ''",
    "'test1s': Adding field: 'd' 'VARCHAR' '23'",
    "'test1s': Adding field: 'e' 'VARCHAR' ''",
    "'test1s': Setting default value '23' for field: 'e'",
    "'test1s': Setting not null for field: 'e'",
    "'test1s': Adding field: 'f' 'VARCHAR' ''",
    "'test1s': Setting default value '23' for field: 'f'",
    "'test1s': Setting not null for field: 'f'",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique"
  ],
  types_int_change: [
    "'test1s': Changing field type: 'a' 'INT' '4'",
    "'test1s': Changing field type: 'b' 'VARCHAR' ''",
    "'test1s': Changing field type: 'c' 'VARCHAR' '23'",
    "'test1s': Changing field type: 'd' 'VARCHAR' '42'",
    "'test1s': Changing default value to '42' for field: 'e'"
  ],
  sync_create_table: [
    "Adding table: 'test1s'",
    "Setting auto increment: 'test1s'",
    "'test1s': Adding field: 'id' 'INT' '4'",
    "'test1s': Setting not null for field: 'id'",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique"
  ],
  sync_create_table_exists: [""],
  sync_create_table_int8id: [
    "Adding table: 'test1s'",
    "Setting auto increment: 'test1s'",
    "'test1s': Adding field: 'id' 'INT8' '8'",
    "'test1s': Setting not null for field: 'id'",
    "'test1s': Adding field: 'a' 'INT' '4'",
    "'test1s': Adding field: 'b' 'INT8' '8'",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique"
  ],
  sync_create_table_parent:        ["Adding table: 'test3s'", "Setting parent: 'test1s' - to table: 'test3s'"],
  sync_create_table_parent_add:    ["Removing table: 'test3s'", "Adding table: 'test3s'", "Setting parent: 'test1s' - to table: 'test3s'"],
  sync_create_table_parent_change: ["Removing table: 'test3s'", "Adding table: 'test3s'", "Setting parent: 'test2s' - to table: 'test3s'"],
  sync_create_table_parent_remove: [
    "Removing table: 'test3s'",
    "Adding table: 'test3s'",
    "Setting auto increment: 'test3s'",
    "'test3s': Adding field: 'id' 'INT' '4'",
    "'test3s': Setting not null for field: 'id'",
    "'test3s': Adding index: 'test3s_id_unique' on ('id') type 'btree' unique"
  ],
  sync_create_table_parent_same: [""],
  sync_create_table_pk:          [
    "Adding table: 'test2s'",
    "'test2s': Adding field: 'a' 'INT' '4'",
    "'test2s': Setting not null for field: 'a'",
    "'test2s': Adding field: 'b' 'INT' '4'",
    "'test2s': Adding index: 'test2s_a_unique' on ('a') type 'btree' unique",
    "'test2s': Adding index: 'test2s_b_unique' on ('b') type 'btree' unique"
  ],
  sync_drop_column:   ["'test2s': Removing index: 'test2s_b_unique'", "'test2s': Removing field: 'b'"],
  sync_field_options: [
    "Adding table: 'test1s'",
    "Setting auto increment: 'test1s'",
    "'test1s': Adding field: 'id' 'INT' '4'",
    "'test1s': Setting not null for field: 'id'",
    "'test1s': Adding field: 'a' 'INT' '4'",
    "'test1s': Adding field: 'b' 'INT' '4'",
    "'test1s': Setting not null for field: 'b'",
    "'test1s': Adding field: 'c' 'INT' '2'",
    "'test1s': Setting default value '23' for field: 'c'",
    "'test1s': Setting not null for field: 'c'",
    "'test1s': Adding field: 'd' 'VARCHAR' ''",
    "'test1s': Setting default value '23' for field: 'd'",
    "'test1s': Setting not null for field: 'd'",
    "'test1s': Adding field: 'f' 'INT' '4'",
    "'test1s': Adding field: 'h' 'INT' '4'",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique",
    "'test1s': Adding index: 'test1s_a_unique' on ('a') type 'btree' unique"
  ],
  sync_field_options_change: [
    "'test1s': Removing index: 'test1s_a_unique'",
    "'test1s': Removing field: 'h'",
    "'test1s': Setting default value '23' for field: 'a'",
    "'test1s': Setting not null for field: 'a'",
    "'test1s': Dropping not null for field: 'b'",
    "'test1s': Dropping default value for field: 'c'",
    "'test1s': Changing field type: 'd' 'INT8' '8'",
    "'test1s': Changing default value to '42' for field: 'd'",
    "'test1s': Changing field type: 'f' 'INT8' '8'",
    "'test1s': Setting not null for field: 'f'",
    "'test1s': Adding index: 'test1s_b_unique' on ('b') type 'btree' unique"
  ],
  sync_foreign_keys: [
    "Adding table: 'test1s'",
    "Setting auto increment: 'test1s'",
    "'test1s': Adding field: 'id' 'INT' '4'",
    "'test1s': Adding field: 'a' 'INT' '4'",
    "'test1s': Adding field: 'b' 'INT8' '8'",
    "'test1s': Adding field: 'c' 'VARCHAR' ''",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique",
    "Adding table: 'test2s'",
    "Setting auto increment: 'test2s'",
    "'test2s': Adding field: 'id' 'INT' '4'"
  ],
  sync_index_1: [
    "Adding table: 'test1s'",
    "Setting auto increment: 'test1s'",
    "'test1s': Adding field: 'id' 'INT' '4'",
    "'test1s': Setting not null for field: 'id'",
    "'test1s': Adding field: 'a' 'INT' '4'",
    "'test1s': Adding field: 'b' 'INT8' '8'",
    "'test1s': Adding index: 'test1s_id_unique' on ('id') type 'btree' unique",
    "'test1s': Adding index: 'ia' on ('a') type 'btree'"
  ],
  sync_index_2: ["'test1s': Adding index: 'ib' on ('a', 'b') type 'btree'"],
  sync_index_3: [
    "'test1s': Removing index: 'ia'",
    "'test1s': Removing index: 'ib'",
    "'test1s': Adding index: 'ia' on ('a') type 'hash'",
    "'test1s': Adding index: 'ib' on ('a', 'b') type 'btree' unique"
  ],
  sync_index_4: [
    "'test1s': Removing index: 'ia'",
    "'test1s': Removing index: 'ib'",
    "'test1s': Adding index: 'ia' on ('a', 'b') type 'btree'",
    "'test1s': Adding index: 'ib' on ('b', 'a') type 'btree' unique"
  ]
};
