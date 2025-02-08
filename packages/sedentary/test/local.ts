import { promises } from "fs";

const { unlink } = promises;

export const connection = "test.json";

export const packageName = "sedentary";

export const wrongConnection = "test";
export const wrongConnectionError = "EISDIR: illegal operation on a directory, read";

export async function clean() {
  try {
    await unlink("test.json");
    // eslint-disable-next-line no-empty
  } catch(e) {}
}

export const coverage = {
  first: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding unique constraint on field: 'id'",
    "Adding table: 'test2'",
    "Setting auto increment: 'test2'",
    "'test2': Adding field: 'id' 'INT' '4'",
    "'test2': Setting not null for field: 'id'",
    "'test2': Adding field: 'a' 'INT' '4'",
    "'test2': Adding unique constraint on field: 'id'",
    "'test2': Adding foreign key 'fkey_a_test1_id' on field: 'a' references 'test1(id)'",
    "Adding table: 'test3'",
    "Setting parent: 'test2' - to table: 'test3'",
    "'test3': Adding field: 'b' 'INT' '4'"
  ]
};

export const dry_run = {
  dry_run: [
    "NOT SYNCING: 'test1': Removing unique constraint from field: 'c'",
    "NOT SYNCING: 'test1': Removing index: 'a'",
    "NOT SYNCING: 'test1': Removing field: 'c'",
    "NOT SYNCING: 'test1': Changing field type: 'a' 'INT8' '8'",
    "NOT SYNCING: 'test1': Setting default value '23' for field: 'a'",
    "NOT SYNCING: 'test1': Setting not null for field: 'a'",
    "NOT SYNCING: 'test1': Adding unique constraint on field: 'a'",
    "NOT SYNCING: 'test1': Adding index: 'b' on ('b') type 'btree'",
    "NOT SYNCING: Removing table: 'test2'",
    "NOT SYNCING: 'test2': Removing foreign key: 'fkey_d_test1_b'",
    "NOT SYNCING: 'test2': Removing field: 'd'",
    "NOT SYNCING: 'test2': Adding field: 'id' 'INT' '4'",
    "NOT SYNCING: 'test2': Changing field type: 'id' 'INT' '4'",
    "NOT SYNCING: 'test2': Setting not null for field: 'id'",
    "NOT SYNCING: 'test2': Dropping default value for field: 'e'",
    "NOT SYNCING: 'test2': Dropping not null for field: 'e'",
    "NOT SYNCING: 'test2': Changing default value to '42' for field: 'f'",
    "NOT SYNCING: 'test2': Adding field: 'g' 'INT' '4'",
    "NOT SYNCING: 'test2': Changing field type: 'g' 'INT' '4'",
    "NOT SYNCING: 'test2': Adding unique constraint on field: 'id'",
    "NOT SYNCING: 'test2': Adding foreign key 'fkey_g_test1_b' on field: 'g' references 'test1(b)'",
    "NOT SYNCING: Adding table: 'test3'",
    "NOT SYNCING: Setting auto increment: 'test3'",
    "NOT SYNCING: 'test3': Adding field: 'id' 'INT' '4'",
    "NOT SYNCING: 'test3': Changing field type: 'id' 'INT' '4'",
    "NOT SYNCING: 'test3': Setting not null for field: 'id'",
    "NOT SYNCING: 'test3': Adding unique constraint on field: 'id'",
    "NOT SYNCING: Adding table: 'test4'",
    "NOT SYNCING: Setting parent: 'test1' - to table: 'test4'"
  ],
  sync: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'INT' '4'",
    "'test1': Adding field: 'b' 'INT' '4'",
    "'test1': Adding field: 'c' 'INT' '4'",
    "'test1': Adding unique constraint on field: 'id'",
    "'test1': Adding unique constraint on field: 'b'",
    "'test1': Adding unique constraint on field: 'c'",
    "'test1': Adding index: 'a' on ('c') type 'btree'",
    "Adding table: 'test2'",
    "Setting parent: 'test1' - to table: 'test2'",
    "'test2': Adding field: 'd' 'INT' '4'",
    "'test2': Adding field: 'e' 'INT' '4'",
    "'test2': Setting default value '23' for field: 'e'",
    "'test2': Setting not null for field: 'e'",
    "'test2': Adding field: 'f' 'INT' '4'",
    "'test2': Setting default value '23' for field: 'f'",
    "'test2': Setting not null for field: 'f'",
    "'test2': Adding foreign key 'fkey_d_test1_b' on field: 'd' references 'test1(b)'"
  ]
};

export const expected = {
  sync_create_table: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding unique constraint on field: 'id'"
  ],
  sync_create_table_exists: [""],
  sync_create_table_int8id: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT8' '8'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'INT' '4'",
    "'test1': Adding field: 'b' 'INT8' '8'",
    "'test1': Adding unique constraint on field: 'id'"
  ],
  sync_create_table_parent:        ["Adding table: 'test3'", "Setting parent: 'test1' - to table: 'test3'"],
  sync_create_table_parent_add:    ["Removing table: 'test3'", "Adding table: 'test3'", "Setting parent: 'test1' - to table: 'test3'"],
  sync_create_table_parent_change: ["Removing table: 'test3'", "Adding table: 'test3'", "Setting parent: 'test2' - to table: 'test3'"],
  sync_create_table_parent_remove: [
    "Removing table: 'test3'",
    "Adding table: 'test3'",
    "Setting auto increment: 'test3'",
    "'test3': Adding field: 'id' 'INT' '4'",
    "'test3': Setting not null for field: 'id'",
    "'test3': Adding unique constraint on field: 'id'"
  ],
  sync_create_table_parent_same: [""],
  sync_create_table_pk:          [
    "Adding table: 'test2'",
    "'test2': Adding field: 'a' 'INT' '4'",
    "'test2': Setting not null for field: 'a'",
    "'test2': Adding field: 'b' 'INT' '4'",
    "'test2': Adding unique constraint on field: 'a'",
    "'test2': Adding unique constraint on field: 'b'"
  ],
  sync_drop_column:   ["'test2': Removing unique constraint from field: 'b'", "'test2': Removing field: 'b'"],
  sync_field_options: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'INT' '4'",
    "'test1': Adding field: 'b' 'INT' '4'",
    "'test1': Setting not null for field: 'b'",
    "'test1': Adding field: 'c' 'INT' '2'",
    "'test1': Setting default value '23' for field: 'c'",
    "'test1': Setting not null for field: 'c'",
    "'test1': Adding field: 'd' 'VARCHAR' ''",
    "'test1': Setting default value '23' for field: 'd'",
    "'test1': Setting not null for field: 'd'",
    "'test1': Adding field: 'f' 'INT' '4'",
    "'test1': Adding field: 'h' 'INT' '4'",
    "'test1': Adding field: 'i' 'INT' '4'",
    "'test1': Adding unique constraint on field: 'id'",
    "'test1': Adding unique constraint on field: 'a'"
  ],
  sync_field_options_change: [
    "'test1': Removing unique constraint from field: 'a'",
    "'test1': Removing field: 'h'",
    "'test1': Setting default value '23' for field: 'a'",
    "'test1': Setting not null for field: 'a'",
    "'test1': Dropping not null for field: 'b'",
    "'test1': Dropping default value for field: 'c'",
    "'test1': Changing field type: 'd' 'INT8' '8'",
    "'test1': Changing default value to '42' for field: 'd'",
    "'test1': Changing field type: 'f' 'INT8' '8'",
    "'test1': Setting not null for field: 'f'",
    "'test1': Setting default value '23' for field: 'i'",
    "'test1': Setting not null for field: 'i'",
    "'test1': Adding unique constraint on field: 'b'"
  ],
  sync_foreign_keys_1: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'INT' '4'",
    "'test1': Adding field: 'b' 'INT8' '8'",
    "'test1': Adding field: 'd' 'VARCHAR' ''",
    "'test1': Adding unique constraint on field: 'id'",
    "'test1': Adding unique constraint on field: 'a'",
    "'test1': Adding unique constraint on field: 'b'",
    "'test1': Adding unique constraint on field: 'd'",
    "Adding table: 'test2'",
    "Setting auto increment: 'test2'",
    "'test2': Adding field: 'id' 'INT' '4'",
    "'test2': Setting not null for field: 'id'",
    "'test2': Adding field: 'a' 'INT' '4'",
    "'test2': Adding field: 'b' 'INT' '4'",
    "'test2': Adding field: 'c' 'INT8' '8'",
    "'test2': Adding field: 'd' 'VARCHAR' ''",
    "'test2': Adding unique constraint on field: 'id'",
    "'test2': Adding foreign key 'fkey_a_test1_id' on field: 'a' references 'test1(id)'",
    "'test2': Adding foreign key 'fkey_b_test1_a' on field: 'b' references 'test1(a)'",
    "'test2': Adding foreign key 'fkey_c_test1_b' on field: 'c' references 'test1(b)'",
    "'test2': Adding foreign key 'fkey_d_test1_d' on field: 'd' references 'test1(d)'"
  ],
  sync_foreign_keys_2: [
    "'test1': Removing unique constraint from field: 'b'",
    "'test1': Removing unique constraint from field: 'd'",
    "Adding table: 'test3'",
    "Setting auto increment: 'test3'",
    "'test3': Adding field: 'id' 'INT' '4'",
    "'test3': Setting not null for field: 'id'",
    "'test3': Adding field: 'b' 'INT8' '8'",
    "'test3': Adding unique constraint on field: 'id'",
    "'test3': Adding unique constraint on field: 'b'",
    "'test2': Removing foreign key: 'fkey_a_test1_id'",
    "'test2': Removing foreign key: 'fkey_c_test1_b'",
    "'test2': Removing foreign key: 'fkey_d_test1_d'",
    "'test2': Removing field: 'd'",
    "'test2': Adding foreign key 'fkey_a_test1_a' on field: 'a' references 'test1(a)'",
    "'test2': Adding foreign key 'fkey_c_test3_b' on field: 'c' references 'test3(b)'"
  ],
  sync_foreign_keys_3: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding unique constraint on field: 'id'",
    "Adding table: 'test2'",
    "Setting auto increment: 'test2'",
    "'test2': Adding field: 'id' 'INT' '4'",
    "'test2': Setting not null for field: 'id'",
    "'test2': Adding field: 'a' 'INT' '4'",
    "'test2': Adding field: 'b' 'INT' '4'",
    "'test2': Adding field: 'c' 'INT' '4'",
    "'test2': Adding field: 'd' 'INT' '4'",
    "'test2': Adding field: 'e' 'INT' '4'",
    "'test2': Adding field: 'f' 'INT' '4'",
    "'test2': Adding field: 'g' 'INT' '4'",
    "'test2': Adding field: 'h' 'INT' '4'",
    "'test2': Adding unique constraint on field: 'id'",
    "'test2': Adding foreign key 'fkey_a_test1_id' on field: 'a' references 'test1(id)'",
    "'test2': Adding foreign key 'fkey_b_test1_id' on field: 'b' references 'test1(id)'",
    "'test2': Adding foreign key 'fkey_c_test1_id' on field: 'c' references 'test1(id)'",
    "'test2': Adding foreign key 'fkey_d_test1_id' on field: 'd' references 'test1(id)' on delete cascade",
    "'test2': Adding foreign key 'fkey_e_test1_id' on field: 'e' references 'test1(id)' on update restrict",
    "'test2': Adding foreign key 'fkey_f_test1_id' on field: 'f' references 'test1(id)' on delete set default on update set null",
    "'test2': Adding foreign key 'fkey_g_test1_id' on field: 'g' references 'test1(id)'",
    "'test2': Adding foreign key 'fkey_h_test1_id' on field: 'h' references 'test1(id)' on delete cascade on update set null"
  ],
  sync_foreign_keys_4: [
    "'test2': Removing foreign key: 'fkey_a_test1_id'",
    "'test2': Removing foreign key: 'fkey_b_test1_id'",
    "'test2': Removing foreign key: 'fkey_c_test1_id'",
    "'test2': Removing foreign key: 'fkey_d_test1_id'",
    "'test2': Removing foreign key: 'fkey_e_test1_id'",
    "'test2': Removing foreign key: 'fkey_f_test1_id'",
    "'test2': Adding foreign key 'fkey_a_test1_id' on field: 'a' references 'test1(id)' on delete cascade",
    "'test2': Adding foreign key 'fkey_b_test1_id' on field: 'b' references 'test1(id)' on update restrict",
    "'test2': Adding foreign key 'fkey_c_test1_id' on field: 'c' references 'test1(id)' on delete set default on update set null",
    "'test2': Adding foreign key 'fkey_d_test1_id' on field: 'd' references 'test1(id)'",
    "'test2': Adding foreign key 'fkey_e_test1_id' on field: 'e' references 'test1(id)'",
    "'test2': Adding foreign key 'fkey_f_test1_id' on field: 'f' references 'test1(id)'"
  ],
  sync_index_1: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'INT' '4'",
    "'test1': Adding field: 'b' 'INT8' '8'",
    "'test1': Adding unique constraint on field: 'id'",
    "'test1': Adding index: 'ia' on ('a') type 'btree'"
  ],
  sync_index_2: ["'test1': Adding index: 'ib' on ('a', 'b') type 'btree'"],
  sync_index_3: ["'test1': Removing index: 'ia'", "'test1': Removing index: 'ib'", "'test1': Adding index: 'ia' on ('a') type 'hash'", "'test1': Adding index: 'ib' on ('a', 'b') type 'btree' unique"],
  sync_index_4: [
    "'test1': Removing index: 'ia'",
    "'test1': Removing index: 'ib'",
    "'test1': Adding index: 'ia' on ('a', 'b') type 'btree'",
    "'test1': Adding index: 'ib' on ('b', 'a') type 'btree' unique"
  ],
  types_boolean: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'BOOLEAN' ''",
    "'test1': Adding field: 'b' 'BOOLEAN' ''",
    "'test1': Adding field: 'c' 'VARCHAR' ''",
    "'test1': Adding unique constraint on field: 'id'"
  ],
  types_boolean_changes: ["'test1': Changing field type: 'b' 'VARCHAR' ''", "'test1': Changing field type: 'c' 'BOOLEAN' ''"],
  types_date_time:       [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'DATETIME' ''",
    "'test1': Adding field: 'b' 'DATETIME' ''",
    "'test1': Adding field: 'c' 'VARCHAR' ''",
    "'test1': Adding field: 'd' 'DATETIME' ''",
    "'test1': Adding field: 'e' 'INT' '4'",
    "'test1': Adding field: 'f' 'DATETIME' ''",
    "'test1': Setting default value '1976-01-23T14:00:00.000Z' for field: 'f'",
    "'test1': Setting not null for field: 'f'",
    "'test1': Adding unique constraint on field: 'id'"
  ],
  types_date_time_changes: [
    "'test1': Changing field type: 'b' 'VARCHAR' ''",
    "'test1': Changing field type: 'c' 'DATETIME' ''",
    "'test1': Changing field type: 'd' 'INT8' '8'",
    "'test1': Changing field type: 'e' 'DATETIME' ''"
  ],
  types_float: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'FLOAT' '4'",
    "'test1': Adding field: 'b' 'FLOAT' '8'",
    "'test1': Adding field: 'c' 'INT' '4'",
    "'test1': Adding field: 'd' 'INT8' '8'",
    "'test1': Adding unique constraint on field: 'id'"
  ],
  types_float_change: [
    "'test1': Changing field type: 'a' 'INT' '4'",
    "'test1': Changing field type: 'b' 'INT8' '8'",
    "'test1': Changing field type: 'c' 'FLOAT' '4'",
    "'test1': Changing field type: 'd' 'FLOAT' '8'"
  ],
  types_int: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'VARCHAR' '23'",
    "'test1': Adding field: 'b' 'VARCHAR' '23'",
    "'test1': Adding field: 'c' 'VARCHAR' ''",
    "'test1': Adding field: 'd' 'VARCHAR' '23'",
    "'test1': Adding field: 'e' 'VARCHAR' ''",
    "'test1': Setting default value '23' for field: 'e'",
    "'test1': Setting not null for field: 'e'",
    "'test1': Adding field: 'f' 'VARCHAR' ''",
    "'test1': Setting default value '23' for field: 'f'",
    "'test1': Setting not null for field: 'f'",
    "'test1': Adding unique constraint on field: 'id'"
  ],
  types_int_change: [
    "'test1': Changing field type: 'a' 'INT' '4'",
    "'test1': Changing field type: 'b' 'VARCHAR' ''",
    "'test1': Changing field type: 'c' 'VARCHAR' '23'",
    "'test1': Changing field type: 'd' 'VARCHAR' '42'",
    "'test1': Changing default value to '42' for field: 'e'"
  ],
  types_json: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'JSON' ''",
    "'test1': Adding field: 'b' 'JSON' ''",
    "'test1': Adding field: 'c' 'VARCHAR' ''",
    "'test1': Adding field: 'd' 'JSON' ''",
    "'test1': Adding field: 'e' 'INT' '4'",
    "'test1': Adding unique constraint on field: 'id'"
  ],
  types_json_changes: [
    "'test1': Changing field type: 'b' 'VARCHAR' ''",
    "'test1': Changing field type: 'c' 'JSON' ''",
    "'test1': Changing field type: 'd' 'INT' '4'",
    "'test1': Changing field type: 'e' 'JSON' ''"
  ],
  types_none: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'c' 'VARCHAR' ''",
    "'test1': Adding unique constraint on field: 'id'"
  ],
  types_none_changes: ["'test1': Removing field: 'c'", "'test1': Adding field: 'b' 'VARCHAR' ''"],
  types_number:       [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'NUMBER' ''",
    "'test1': Adding field: 'b' 'NUMBER' ''",
    "'test1': Adding field: 'c' 'VARCHAR' ''",
    "'test1': Adding unique constraint on field: 'id'"
  ],
  types_number_changes: ["'test1': Changing field type: 'b' 'VARCHAR' ''", "'test1': Changing field type: 'c' 'NUMBER' ''"]
};

export const models = {
  base: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'INT' '4'",
    "'test1': Adding field: 'b' 'VARCHAR' ''",
    "'test1': Setting default value 'test' for field: 'b'",
    "'test1': Setting not null for field: 'b'",
    "'test1': Adding unique constraint on field: 'id'",
    'Save to test1 {"a":23,"b":"ok","c":42}',
    "Save to test1 {}",
    "Load from test1 where: \"b = 'ok'\"",
    'Load from test1 where: "a IS NULL"',
    'Load from test1 where: "id < 23" order by: id',
    'Load from test1 where: "" order by: -id',
    "Load from test1 where: \"b = 'ok'\"",
    'Save to test1 {"a":23,"b":"test","id":1,"c":42}',
    'Save to test1 {"a":23,"b":"test","id":1,"c":42}',
    "Load from test1 where: \"b IN ('a', 'b', 'test')\" order by: id",
    "Delete from test1 1",
    "Delete from test1 1"
  ],
  inheritance: [""],
  json:        [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'INT' '4'",
    "'test1': Adding field: 'b' 'JSON' ''",
    "'test1': Adding unique constraint on field: 'id'",
    'Save to test1 {"a":23,"b":{"a":[1],"v":"test"}}',
    'Load from test1 where: "a >= 23"',
    'Save to test1 {"a":23,"b":{"a":[1,2],"v":"test"},"id":1}'
  ],
  types: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'INT' '4'",
    "'test1': Adding field: 'b' 'VARCHAR' ''",
    "'test1': Adding field: 'c' 'DATETIME' ''",
    "'test1': Adding field: 'd' 'INT8' '8'",
    "'test1': Adding field: 'e' 'NUMBER' ''",
    "'test1': Adding field: 'f' 'BOOLEAN' ''",
    "'test1': Adding field: 'g' 'JSON' ''",
    "'test1': Adding unique constraint on field: 'id'",
    'Save to test1 {"a":23,"b":"ok","c":"1976-01-23T00:00:00.000Z","d":"23n","e":2.3,"f":true,"g":{"a":"b"}}',
    "Load from test1 where: \"d = '23'\""
  ]
};

export const wheres = {
  empty: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding unique constraint on field: 'id'",
    'Load from test1 where: ""'
  ],
  order: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'INT' '4'",
    "'test1': Adding field: 'b' 'VARCHAR' ''",
    "'test1': Adding unique constraint on field: 'id'",
    'Load from test1 where: "" order by: a, -b'
  ],
  where: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'INT' '4'",
    "'test1': Adding field: 'b' 'VARCHAR' ''",
    "'test1': Adding field: 'c' 'INT' '4'",
    "'test1': Adding field: 'd' 'INT' '4'",
    "'test1': Adding field: 'e' 'INT' '4'",
    "'test1': Adding unique constraint on field: 'id'",
    'Load from test1 where: "(fixed) AND NOT (a = 23 AND b IS NULL AND NOT c AND d > 23 AND e IN (23, 42)) OR (fixed)"'
  ]
};

export const transactions = {
  cancel: [
    "Adding table: 'test1'",
    "Setting auto increment: 'test1'",
    "'test1': Adding field: 'id' 'INT' '4'",
    "'test1': Setting not null for field: 'id'",
    "'test1': Adding field: 'a' 'INT' '4'",
    "'test1': Adding field: 'b' 'VARCHAR' ''",
    "'test1': Adding unique constraint on field: 'id'",
    'Save to test1 {"a":1,"b":"1"}',
    'Save to test1 {"a":2,"b":"2"}',
    'Save to test1 {"a":3,"b":"3"}',
    'Cancel from test1 where: ""',
    "Cancel from test1 where: \"b = '1'\"",
    'Load from test1 where: "a <= 10"'
  ],
  commit: [
    "Adding table: 'test2'",
    "Setting auto increment: 'test2'",
    "'test2': Adding field: 'id' 'INT' '4'",
    "'test2': Setting not null for field: 'id'",
    "'test2': Adding field: 'a' 'INT' '4'",
    "'test2': Adding field: 'b' 'VARCHAR' ''",
    "'test2': Adding unique constraint on field: 'id'",
    'Save to test2 {"a":1,"b":"1"}',
    'Save to test2 {"a":2,"b":"2"}',
    'Load from test2 where: ""',
    'Save to test2 {"a":11,"b":"11","id":1}',
    "Delete from test2 2",
    'Save to test2 {"a":3,"b":"3"}',
    'Load from test2 where: "id > 0" order by: id'
  ],
  locks:    [],
  rollback: [
    "Adding table: 'test3'",
    "Setting auto increment: 'test3'",
    "'test3': Adding field: 'id' 'INT' '4'",
    "'test3': Setting not null for field: 'id'",
    "'test3': Adding field: 'a' 'INT' '4'",
    "'test3': Adding field: 'b' 'VARCHAR' ''",
    "'test3': Adding unique constraint on field: 'id'",
    'Save to test3 {"a":1,"b":"1"}',
    'Save to test3 {"a":2,"b":"2"}',
    'Load from test3 where: ""',
    'Save to test3 {"a":11,"b":"11","id":1}',
    "Delete from test3 2",
    'Save to test3 {"a":3,"b":"3"}',
    'Load from test3 where: "" order by: id'
  ]
};
