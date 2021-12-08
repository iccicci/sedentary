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

export const dryrun = {
  dryrun: [
    "NOT SYNCING: 'test1': Removing unique constraint from field: 'c'\n",
    "NOT SYNCING: 'test1': Removing index: 'a'\n",
    "NOT SYNCING: 'test1': Removing field: 'c'\n",
    "NOT SYNCING: 'test1': Changing field type: 'a' 'INT8' '8'\n",
    "NOT SYNCING: 'test1': Setting default value '23' for field: 'a'\n",
    "NOT SYNCING: 'test1': Setting not null for field: 'a'\n",
    "NOT SYNCING: 'test1': Adding unique constraint on field: 'a'\n",
    "NOT SYNCING: 'test1': Adding index: 'b' on ('b') type 'btree'\n",
    "NOT SYNCING: Removing table: 'test2'\n",
    "NOT SYNCING: 'test2': Removing foreign key: 'fkey_d_test1_b'\n",
    "NOT SYNCING: 'test2': Removing field: 'd'\n",
    "NOT SYNCING: 'test2': Adding field: 'id' 'INT' '4'\n",
    "NOT SYNCING: 'test2': Changing field type: 'id' 'INT' '4'\n",
    "NOT SYNCING: 'test2': Setting not null for field: 'id'\n",
    "NOT SYNCING: 'test2': Dropping default value for field: 'e'\n",
    "NOT SYNCING: 'test2': Dropping not null for field: 'e'\n",
    "NOT SYNCING: 'test2': Changing default value to '42' for field: 'f'\n",
    "NOT SYNCING: 'test2': Adding field: 'g' 'INT' '4'\n",
    "NOT SYNCING: 'test2': Changing field type: 'g' 'INT' '4'\n",
    "NOT SYNCING: 'test2': Adding unique constraint on field: 'id'\n",
    "NOT SYNCING: 'test2': Adding foreign key 'fkey_g_test1_b' on field: 'g' references 'test1(b)'\n",
    "NOT SYNCING: Adding table: 'test3'\n",
    "NOT SYNCING: Setting auto increment: 'test3'\n",
    "NOT SYNCING: 'test3': Adding field: 'id' 'INT' '4'\n",
    "NOT SYNCING: 'test3': Changing field type: 'id' 'INT' '4'\n",
    "NOT SYNCING: 'test3': Setting not null for field: 'id'\n",
    "NOT SYNCING: 'test3': Adding unique constraint on field: 'id'\n",
    "NOT SYNCING: Adding table: 'test4'\n",
    "NOT SYNCING: Setting parent: 'test1' - to table: 'test4'\n"
  ],
  sync: [
    "Adding table: 'test1'\n",
    "Setting auto increment: 'test1'\n",
    "'test1': Adding field: 'id' 'INT' '4'\n",
    "'test1': Setting not null for field: 'id'\n",
    "'test1': Adding field: 'a' 'INT' '4'\n",
    "'test1': Adding field: 'b' 'INT' '4'\n",
    "'test1': Adding field: 'c' 'INT' '4'\n",
    "'test1': Adding unique constraint on field: 'id'\n",
    "'test1': Adding unique constraint on field: 'b'\n",
    "'test1': Adding unique constraint on field: 'c'\n",
    "'test1': Adding index: 'a' on ('c') type 'btree'\n",
    "Adding table: 'test2'\n",
    "Setting parent: 'test1' - to table: 'test2'\n",
    "'test2': Adding field: 'd' 'INT' '4'\n",
    "'test2': Adding field: 'e' 'INT' '4'\n",
    "'test2': Setting default value '23' for field: 'e'\n",
    "'test2': Setting not null for field: 'e'\n",
    "'test2': Adding field: 'f' 'INT' '4'\n",
    "'test2': Setting default value '23' for field: 'f'\n",
    "'test2': Setting not null for field: 'f'\n",
    "'test2': Adding foreign key 'fkey_d_test1_b' on field: 'd' references 'test1(b)'\n"
  ]
};

export const expected = {
  sync_create_table: [
    "Adding table: 'test1'\n",
    "Setting auto increment: 'test1'\n",
    "'test1': Adding field: 'id' 'INT' '4'\n",
    "'test1': Setting not null for field: 'id'\n",
    "'test1': Adding unique constraint on field: 'id'\n"
  ],
  sync_create_table_exists: [""],
  sync_create_table_int8id: [
    "Adding table: 'test1'\n",
    "Setting auto increment: 'test1'\n",
    "'test1': Adding field: 'id' 'INT8' '8'\n",
    "'test1': Setting not null for field: 'id'\n",
    "'test1': Adding field: 'a' 'INT' '4'\n",
    "'test1': Adding field: 'b' 'INT8' '8'\n",
    "'test1': Adding unique constraint on field: 'id'\n"
  ],
  sync_create_table_parent:        ["Adding table: 'test3'\n", "Setting parent: 'test1' - to table: 'test3'\n"],
  sync_create_table_parent_add:    ["Removing table: 'test3'\n", "Adding table: 'test3'\n", "Setting parent: 'test1' - to table: 'test3'\n"],
  sync_create_table_parent_change: ["Removing table: 'test3'\n", "Adding table: 'test3'\n", "Setting parent: 'test2' - to table: 'test3'\n"],
  sync_create_table_parent_remove: [
    "Removing table: 'test3'\n",
    "Adding table: 'test3'\n",
    "Setting auto increment: 'test3'\n",
    "'test3': Adding field: 'id' 'INT' '4'\n",
    "'test3': Setting not null for field: 'id'\n",
    "'test3': Adding unique constraint on field: 'id'\n"
  ],
  sync_create_table_parent_same: [""],
  sync_create_table_pk:          [
    "Adding table: 'test2'\n",
    "'test2': Adding field: 'a' 'INT' '4'\n",
    "'test2': Setting not null for field: 'a'\n",
    "'test2': Adding field: 'b' 'INT' '4'\n",
    "'test2': Adding unique constraint on field: 'a'\n",
    "'test2': Adding unique constraint on field: 'b'\n"
  ],
  sync_drop_column:   ["'test2': Removing unique constraint from field: 'b'\n", "'test2': Removing field: 'b'\n"],
  sync_field_options: [
    "Adding table: 'test1'\n",
    "Setting auto increment: 'test1'\n",
    "'test1': Adding field: 'id' 'INT' '4'\n",
    "'test1': Setting not null for field: 'id'\n",
    "'test1': Adding field: 'a' 'INT' '4'\n",
    "'test1': Adding field: 'b' 'INT' '4'\n",
    "'test1': Setting not null for field: 'b'\n",
    "'test1': Adding field: 'c' 'INT' '2'\n",
    "'test1': Setting default value '23' for field: 'c'\n",
    "'test1': Setting not null for field: 'c'\n",
    "'test1': Adding field: 'd' 'VARCHAR' ''\n",
    "'test1': Setting default value '23' for field: 'd'\n",
    "'test1': Setting not null for field: 'd'\n",
    "'test1': Adding field: 'f' 'INT' '4'\n",
    "'test1': Adding field: 'h' 'INT' '4'\n",
    "'test1': Adding unique constraint on field: 'id'\n",
    "'test1': Adding unique constraint on field: 'a'\n"
  ],
  sync_field_options_change: [
    "'test1': Removing unique constraint from field: 'a'\n",
    "'test1': Removing field: 'h'\n",
    "'test1': Setting default value '23' for field: 'a'\n",
    "'test1': Setting not null for field: 'a'\n",
    "'test1': Dropping not null for field: 'b'\n",
    "'test1': Dropping default value for field: 'c'\n",
    "'test1': Changing field type: 'd' 'INT8' '8'\n",
    "'test1': Changing default value to '42' for field: 'd'\n",
    "'test1': Changing field type: 'f' 'INT8' '8'\n",
    "'test1': Setting not null for field: 'f'\n",
    "'test1': Adding unique constraint on field: 'b'\n"
  ],
  sync_foreign_keys_1: [
    "Adding table: 'test1'\n",
    "Setting auto increment: 'test1'\n",
    "'test1': Adding field: 'id' 'INT' '4'\n",
    "'test1': Setting not null for field: 'id'\n",
    "'test1': Adding field: 'a' 'INT' '4'\n",
    "'test1': Adding field: 'b' 'INT8' '8'\n",
    "'test1': Adding field: 'd' 'VARCHAR' ''\n",
    "'test1': Adding unique constraint on field: 'id'\n",
    "'test1': Adding unique constraint on field: 'a'\n",
    "'test1': Adding unique constraint on field: 'b'\n",
    "'test1': Adding unique constraint on field: 'd'\n",
    "Adding table: 'test2'\n",
    "Setting auto increment: 'test2'\n",
    "'test2': Adding field: 'id' 'INT' '4'\n",
    "'test2': Setting not null for field: 'id'\n",
    "'test2': Adding field: 'a' 'INT' '4'\n",
    "'test2': Adding field: 'b' 'INT' '4'\n",
    "'test2': Adding field: 'c' 'INT8' '8'\n",
    "'test2': Adding field: 'd' 'VARCHAR' ''\n",
    "'test2': Adding unique constraint on field: 'id'\n",
    "'test2': Adding foreign key 'fkey_a_test1_id' on field: 'a' references 'test1(id)'\n",
    "'test2': Adding foreign key 'fkey_b_test1_a' on field: 'b' references 'test1(a)'\n",
    "'test2': Adding foreign key 'fkey_c_test1_b' on field: 'c' references 'test1(b)'\n",
    "'test2': Adding foreign key 'fkey_d_test1_d' on field: 'd' references 'test1(d)'\n"
  ],
  sync_foreign_keys_2: [
    "'test1': Removing unique constraint from field: 'b'\n",
    "'test1': Removing unique constraint from field: 'd'\n",
    "Adding table: 'test3'\n",
    "Setting auto increment: 'test3'\n",
    "'test3': Adding field: 'id' 'INT' '4'\n",
    "'test3': Setting not null for field: 'id'\n",
    "'test3': Adding field: 'b' 'INT8' '8'\n",
    "'test3': Adding unique constraint on field: 'id'\n",
    "'test3': Adding unique constraint on field: 'b'\n",
    "'test2': Removing foreign key: 'fkey_a_test1_id'\n",
    "'test2': Removing foreign key: 'fkey_c_test1_b'\n",
    "'test2': Removing foreign key: 'fkey_d_test1_d'\n",
    "'test2': Removing field: 'd'\n",
    "'test2': Adding foreign key 'fkey_a_test1_a' on field: 'a' references 'test1(a)'\n",
    "'test2': Adding foreign key 'fkey_c_test3_b' on field: 'c' references 'test3(b)'\n"
  ],
  sync_foreign_keys_3: [
    "Adding table: 'test1'\n",
    "Setting auto increment: 'test1'\n",
    "'test1': Adding field: 'id' 'INT' '4'\n",
    "'test1': Setting not null for field: 'id'\n",
    "'test1': Adding unique constraint on field: 'id'\n",
    "Adding table: 'test2'\n",
    "Setting auto increment: 'test2'\n",
    "'test2': Adding field: 'id' 'INT' '4'\n",
    "'test2': Setting not null for field: 'id'\n",
    "'test2': Adding field: 'a' 'INT' '4'\n",
    "'test2': Adding field: 'b' 'INT' '4'\n",
    "'test2': Adding field: 'c' 'INT' '4'\n",
    "'test2': Adding field: 'd' 'INT' '4'\n",
    "'test2': Adding field: 'e' 'INT' '4'\n",
    "'test2': Adding field: 'f' 'INT' '4'\n",
    "'test2': Adding field: 'g' 'INT' '4'\n",
    "'test2': Adding field: 'h' 'INT' '4'\n",
    "'test2': Adding unique constraint on field: 'id'\n",
    "'test2': Adding foreign key 'fkey_a_test1_id' on field: 'a' references 'test1(id)'\n",
    "'test2': Adding foreign key 'fkey_b_test1_id' on field: 'b' references 'test1(id)'\n",
    "'test2': Adding foreign key 'fkey_c_test1_id' on field: 'c' references 'test1(id)'\n",
    "'test2': Adding foreign key 'fkey_d_test1_id' on field: 'd' references 'test1(id)' on delete cascade\n",
    "'test2': Adding foreign key 'fkey_e_test1_id' on field: 'e' references 'test1(id)' on update restrict\n",
    "'test2': Adding foreign key 'fkey_f_test1_id' on field: 'f' references 'test1(id)' on delete set default on update set null\n",
    "'test2': Adding foreign key 'fkey_g_test1_id' on field: 'g' references 'test1(id)'\n",
    "'test2': Adding foreign key 'fkey_h_test1_id' on field: 'h' references 'test1(id)' on delete cascade on update set null\n"
  ],
  sync_foreign_keys_4: [
    "'test2': Removing foreign key: 'fkey_a_test1_id'\n",
    "'test2': Removing foreign key: 'fkey_b_test1_id'\n",
    "'test2': Removing foreign key: 'fkey_c_test1_id'\n",
    "'test2': Removing foreign key: 'fkey_d_test1_id'\n",
    "'test2': Removing foreign key: 'fkey_e_test1_id'\n",
    "'test2': Removing foreign key: 'fkey_f_test1_id'\n",
    "'test2': Adding foreign key 'fkey_a_test1_id' on field: 'a' references 'test1(id)' on delete cascade\n",
    "'test2': Adding foreign key 'fkey_b_test1_id' on field: 'b' references 'test1(id)' on update restrict\n",
    "'test2': Adding foreign key 'fkey_c_test1_id' on field: 'c' references 'test1(id)' on delete set default on update set null\n",
    "'test2': Adding foreign key 'fkey_d_test1_id' on field: 'd' references 'test1(id)'\n",
    "'test2': Adding foreign key 'fkey_e_test1_id' on field: 'e' references 'test1(id)'\n",
    "'test2': Adding foreign key 'fkey_f_test1_id' on field: 'f' references 'test1(id)'\n"
  ],
  sync_index_1: [
    "Adding table: 'test1'\n",
    "Setting auto increment: 'test1'\n",
    "'test1': Adding field: 'id' 'INT' '4'\n",
    "'test1': Setting not null for field: 'id'\n",
    "'test1': Adding field: 'a' 'INT' '4'\n",
    "'test1': Adding field: 'b' 'INT8' '8'\n",
    "'test1': Adding unique constraint on field: 'id'\n",
    "'test1': Adding index: 'ia' on ('a') type 'btree'\n"
  ],
  sync_index_2: ["'test1': Adding index: 'ib' on ('a', 'b') type 'btree'\n"],
  sync_index_3: [
    "'test1': Removing index: 'ia'\n",
    "'test1': Removing index: 'ib'\n",
    "'test1': Adding index: 'ia' on ('a') type 'hash'\n",
    "'test1': Adding index: 'ib' on ('a', 'b') type 'btree' unique\n"
  ],
  sync_index_4: [
    "'test1': Removing index: 'ia'\n",
    "'test1': Removing index: 'ib'\n",
    "'test1': Adding index: 'ia' on ('a', 'b') type 'btree'\n",
    "'test1': Adding index: 'ib' on ('b', 'a') type 'btree' unique\n"
  ],
  types_datetime: [
    "Adding table: 'test1'\n",
    "Setting auto increment: 'test1'\n",
    "'test1': Adding field: 'id' 'INT' '4'\n",
    "'test1': Setting not null for field: 'id'\n",
    "'test1': Adding field: 'a' 'DATETIME' ''\n",
    "'test1': Adding field: 'b' 'DATETIME' ''\n",
    "'test1': Adding field: 'c' 'VARCHAR' ''\n",
    "'test1': Adding field: 'd' 'DATETIME' ''\n",
    "'test1': Adding field: 'e' 'INT' '4'\n",
    "'test1': Adding field: 'f' 'DATETIME' ''\n",
    "'test1': Setting default value '1976-01-23T14:00:00.000Z' for field: 'f'\n",
    "'test1': Setting not null for field: 'f'\n",
    "'test1': Adding unique constraint on field: 'id'\n"
  ],
  types_datetime_changes: [
    "'test1': Removing field: 'f'\n",
    "'test1': Changing field type: 'b' 'VARCHAR' ''\n",
    "'test1': Changing field type: 'c' 'DATETIME' ''\n",
    "'test1': Changing field type: 'd' 'INT8' '8'\n",
    "'test1': Changing field type: 'e' 'DATETIME' ''\n"
  ],
  types_int: [
    "Adding table: 'test1'\n",
    "Setting auto increment: 'test1'\n",
    "'test1': Adding field: 'id' 'INT' '4'\n",
    "'test1': Setting not null for field: 'id'\n",
    "'test1': Adding field: 'a' 'VARCHAR' '23'\n",
    "'test1': Adding field: 'b' 'VARCHAR' '23'\n",
    "'test1': Adding field: 'c' 'VARCHAR' ''\n",
    "'test1': Adding field: 'd' 'VARCHAR' '23'\n",
    "'test1': Adding field: 'e' 'VARCHAR' ''\n",
    "'test1': Setting default value '23' for field: 'e'\n",
    "'test1': Setting not null for field: 'e'\n",
    "'test1': Adding field: 'f' 'VARCHAR' ''\n",
    "'test1': Setting default value '23' for field: 'f'\n",
    "'test1': Setting not null for field: 'f'\n",
    "'test1': Adding unique constraint on field: 'id'\n"
  ],
  types_int_change: [
    "'test1': Changing field type: 'a' 'INT' '4'\n",
    "'test1': Changing field type: 'b' 'VARCHAR' ''\n",
    "'test1': Changing field type: 'c' 'VARCHAR' '23'\n",
    "'test1': Changing field type: 'd' 'VARCHAR' '42'\n",
    "'test1': Changing default value to '42' for field: 'e'\n"
  ]
};
