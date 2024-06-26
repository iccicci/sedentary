import { DatabaseError, Pool, PoolClient, PoolConfig, QueryResult, types as PGtypes } from "pg";
import format from "pg-format";
import { Attribute, base, DB, deepCopy, deepDiff, EntryBase, ForeignKeyActions, Index, loaded, size, Table, Transaction, transaction } from "sedentary";

const needDrop = [
  ["DATETIME", "float4"],
  ["DATETIME", "float8"],
  ["DATETIME", "int2"],
  ["DATETIME", "int4"],
  ["DATETIME", "int8"],
  ["DATETIME", "numeric"],
  ["FLOAT", "json"],
  ["FLOAT", "timestamptz"],
  ["INT", "json"],
  ["INT", "timestamptz"],
  ["INT8", "json"],
  ["INT8", "timestamptz"],
  ["JSON", "int2"],
  ["JSON", "int4"],
  ["JSON", "int8"],
  ["JSON", "numeric"],
  ["NUMBER", "json"],
  ["NUMBER", "timestamptz"]
];
const needUsing = [
  ["BOOLEAN", "varchar"],
  ["DATETIME", "varchar"],
  ["INT", "varchar"],
  ["INT8", "varchar"],
  ["JSON", "varchar"],
  ["NUMBER", "varchar"]
];
const types = { bool: "BOOL", float4: "FLOAT4", float8: "FLOAT8", int2: "SMALLINT", int4: "INTEGER", int8: "BIGINT", json: "JSON", numeric: "NUMERIC", timestamptz: "DATETIME", varchar: "VARCHAR" };

const actions: { [k in ForeignKeyActions]: string } = { cascade: "c", "no action": "a", restrict: "r", "set default": "d", "set null": "n" };

function parseInt8(value: string) {
  return BigInt(value);
}

function parseNumber(value: string) {
  return parseFloat(value);
}

PGtypes.setTypeParser(20, parseInt8);
PGtypes.setTypeParser(1700, parseNumber);

export class PGDB extends DB<TransactionPG> {
  private _client: PoolClient = {} as PoolClient;
  private indexes: string[] = [];
  private oidLoad: Record<number, (ids: unknown[]) => Promise<EntryBase[]>> = {};
  private pool: Pool;
  private released = false;
  private version = 0;

  constructor(connection: PoolConfig, log: (message: string) => void) {
    super(log);

    this.pool = new Pool(connection);
  }

  async connect(): Promise<void> {
    this._client = await this.pool.connect();

    const res = await this._client.query("SELECT version()");

    this.version = parseInt(res.rows[0].version.split(" ")[1].split(".")[0], 10);
  }

  async end(): Promise<void> {
    if(! this.released) this._client.release();
    await this.pool.end();
  }

  defaultNeq(src: string, value: unknown): boolean {
    if(src === value) return false;

    return src.split("::")[0] !== value;
  }

  async begin() {
    const ret = new TransactionPG(this.log, await this.pool.connect());

    this.log("BEGIN");
    await (ret as unknown as { _client: PoolClient })._client.query("BEGIN");

    return ret;
  }

  cancel(tableName: string) {
    return async (where: string, tx?: Transaction) => {
      const client = tx ? (tx as unknown as { _client: PoolClient })._client : await this.pool.connect();
      let rowCount = 0;

      try {
        const query = `DELETE FROM ${tableName}${where ? ` WHERE ${where}` : ""}`;

        this.log(query);
        ({ rowCount } = (await client.query(query)) as { rowCount: number });
      } finally {
        if(! tx) client.release();
      }

      return rowCount;
    };
  }

  async client() {
    return await this.pool.connect();
  }

  escape(value: unknown): string {
    if(value === null || value === undefined) throw new Error("SedentaryPG: Can't escape null nor undefined values; use the 'IS NULL' operator instead");

    if(typeof value === "boolean" || typeof value === "number") return value.toString();
    if(value instanceof Date) return format("%L", value).replace(/\.\d\d\d\+/, "+");
    return format("%L", value);
  }

  fill(attr2field: Record<string, string>, row: Record<string, unknown>, entry: Record<string, unknown>) {
    const value: Record<string, unknown> = {};

    for(const attribute in attr2field) value[attribute] = deepCopy((entry[attribute] = row[attr2field[attribute]]));
    Object.defineProperty(entry, loaded, { configurable: true, value });
  }

  load(
    tableName: string,
    attributes: Record<string, string>,
    pk: Attribute<unknown, unknown>,
    model: new (from: "load") => EntryBase,
    table: Table
  ): (where: string, order?: string | string[], limit?: number, tx?: Transaction) => Promise<EntryBase[]> {
    const pkFldName = pk.fieldName;

    return async (where: string, order?: string | string[], limit?: number, tx?: Transaction, lock?: boolean) => {
      const { oid } = table;
      const ret: EntryBase[] = [];
      const client = tx ? (tx as unknown as { _client: PoolClient })._client : await this.pool.connect();
      const oidPK: Record<number, [number, unknown][]> = {};

      try {
        const forUpdate = lock ? " FOR UPDATE" : "";
        const orderBy =
          order && order.length
            ? ` ORDER BY ${(typeof order === "string" ? [order] : order)
              .map(_ => (_.startsWith("-") ? `${table.findAttribute(_.substring(1)).fieldName} DESC` : table.findAttribute(_).fieldName))
              .join(",")}`
            : "";
        const limitTo = typeof limit === "number" ? ` LIMIT ${limit}` : "";
        const query = `SELECT *, tableoid FROM ${tableName}${where ? ` WHERE ${where}` : ""}${orderBy}${limitTo}${forUpdate}`;

        this.log(query);
        const res = await client.query(query);

        for(const row of res.rows) {
          if(row.tableoid === oid) {
            const entry = new model("load") as EntryBase & Record<string, unknown>;

            this.fill(attributes, row, entry);

            if(tx) tx.addEntry(entry);
            ret.push(entry);
            entry.postLoad();
          } else {
            if(! oidPK[row.tableoid]) oidPK[row.tableoid] = [];
            oidPK[row.tableoid].push([ret.length, row[pkFldName]]);
            ret.push(null as unknown as EntryBase);
          }
        }

        for(const oid in oidPK) {
          const res = await this.oidLoad[oid](oidPK[oid].map(_ => _[1]));

          for(const entry of res) for(const [id, pk] of oidPK[oid]) if(pk === (entry as unknown as Record<string, unknown>)[pkFldName]) ret[id] = entry;
        }
      } finally {
        if(! tx) client.release();
      }

      return ret;
    };
  }

  remove(tableName: string, pk: Attribute<unknown, unknown>): (this: Record<string, unknown> & { [transaction]?: TransactionPG }) => Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const pkAttrName = pk.attributeName;
    const pkFldName = pk.fieldName;

    return async function() {
      const client = this[transaction] ? (this[transaction] as unknown as { _client: PoolClient })._client : await self.pool.connect();
      let removed: number;

      try {
        const query = `DELETE FROM ${tableName} WHERE ${pkFldName} = ${self.escape(this[pkAttrName])}`;

        self.log(query);
        removed = ((await client.query(query)) as { rowCount: number }).rowCount;
      } finally {
        if(! this[transaction]) client.release();
      }

      return removed;
    };
  }

  save(
    tableName: string,
    attr2field: Record<string, string>,
    pk: Attribute<unknown, unknown>
  ): (this: Record<string, unknown> & { [loaded]?: Record<string, unknown>; [transaction]?: TransactionPG }) => Promise<number | false> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const pkAttrName = pk.attributeName;
    const pkFldName = pk.fieldName;

    return async function() {
      const client = this[transaction] ? (this[transaction] as unknown as { _client: PoolClient })._client : await self.pool.connect();
      let changed = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: QueryResult<any> | null = null;

      const save = async (query: string) => {
        self.log(query);

        changed = true;
        result = await client.query(query + " RETURNING *");
        self.fill(attr2field, result.rows[0], this);
      };

      try {
        const loadedRecord = this[loaded];

        if(loadedRecord) {
          const actions: string[] = [];

          for(const attribute in attr2field) {
            const value = this[attribute];

            if(deepDiff(value, loadedRecord[attribute])) actions.push(`${attr2field[attribute]} = ${self.escape(value)}`);
          }

          if(actions.length) await save(`UPDATE ${tableName} SET ${actions.join(", ")} WHERE ${pkFldName} = ${self.escape(this[pkAttrName])}`);
        } else {
          const fields: string[] = [];
          const values: string[] = [];

          for(const attribute in attr2field) {
            const value = this[attribute];

            if(value !== null && value !== undefined) {
              fields.push(attr2field[attribute]);
              values.push(self.escape(value));
            }
          }

          await save(fields.length ? `INSERT INTO ${tableName} (${fields.join(", ")}) VALUES (${values.join(", ")})` : `INSERT INTO ${tableName} DEFAULT VALUES`);
        }
      } finally {
        if(! this[transaction]) client.release();
      }

      return changed && result!.rowCount;
    };
  }

  async dropConstraints(table: Table): Promise<number[]> {
    const indexes: number[] = [];
    const res = await this._client.query("SELECT confdeltype, confupdtype, conindid, conname, contype FROM pg_constraint WHERE conrelid = $1 ORDER BY conname", [table.oid!]);

    for(const row of res.rows) {
      const arr = table.constraints.filter(_ => _.constraintName === row.conname && _.type === row.contype);
      let drop = false;

      if(arr.length === 0) drop = true;
      else if(row.contype === "u") indexes.push(row.conindid);
      else {
        const { options } = arr[0].attribute.foreignKey as { attributeName: string; fieldName: string; options: { onDelete: ForeignKeyActions; onUpdate: ForeignKeyActions }; tableName: string };

        if(actions[options.onDelete] !== row.confdeltype || actions[options.onUpdate] !== row.confupdtype) drop = true;
      }

      if(drop) {
        const statement = `ALTER TABLE ${table.tableName} DROP CONSTRAINT ${row.conname} CASCADE`;

        this.syncLog(statement);
        if(this.sync) await this._client.query(statement);
      }
    }

    return indexes;
  }

  async dropField(tableName: string, fieldName: string): Promise<void> {
    const statement = `ALTER TABLE ${tableName} DROP COLUMN ${fieldName}`;

    this.syncLog(statement);
    if(this.sync) await this._client.query(statement);
  }

  async dropFields(table: Table): Promise<void> {
    const res = await this._client.query("SELECT attname FROM pg_attribute WHERE attrelid = $1 AND attnum > 0 AND attisdropped = false AND attinhcount = 0", [table.oid!]);

    for(const i in res.rows) {
      const field = table.findField(res.rows[i].attname);

      if(! field || ! field[base]) await this.dropField(table.tableName, res.rows[i].attname);
    }
  }

  async dropIndexes(table: Table, constraintIndexes: number[]): Promise<void> {
    const { indexes, oid } = table;
    const iObject: { [key: string]: Index } = {};
    const res = await this._client.query(
      "SELECT amname, attname, indexrelid, indisunique, relname FROM pg_class, pg_index, pg_attribute, pg_am WHERE indrelid = $1 AND indexrelid = pg_class.oid AND attrelid = pg_class.oid AND relam = pg_am.oid ORDER BY attnum",
      [oid!]
    );

    for(const row of res.rows) {
      const { amname, attname, indexrelid, indisunique, relname } = row;

      if(! constraintIndexes.includes(indexrelid)) {
        if(iObject[relname]) iObject[relname].fields.push(attname);
        else iObject[relname] = { fields: [attname], indexName: relname, type: amname, unique: indisunique };
      }
    }

    this.indexes = [];
    for(const index of indexes) {
      const { indexName } = index;

      if(iObject[indexName] && this.indexesEq(index, iObject[indexName])) {
        this.indexes.push(indexName);
        delete iObject[indexName];
      }
    }

    for(const index of Object.keys(iObject).sort()) {
      const statement = `DROP INDEX ${index}`;

      this.syncLog(statement);
      if(this.sync) await this._client.query(statement);
    }
  }

  async syncConstraints(table: Table): Promise<void> {
    for(const constraint of table.constraints) {
      const { attribute, constraintName, type } = constraint;
      const res = await this._client.query("SELECT attname FROM pg_attribute, pg_constraint WHERE attrelid = $1 AND conrelid = $1 AND attnum = conkey[1] AND attname = $2", [
        table.oid!,
        attribute.fieldName as unknown as number
      ]);

      if(! res.rowCount) {
        let query: string;

        if(type === "f") {
          const { fieldName, options, tableName } = attribute.foreignKey as {
            attributeName: string;
            fieldName: string;
            options: { onDelete: ForeignKeyActions; onUpdate: ForeignKeyActions };
            tableName: string;
          };
          const onDelete = options.onDelete !== "no action" ? ` ON DELETE ${options.onDelete.toUpperCase()}` : "";
          const onUpdate = options.onUpdate !== "no action" ? ` ON UPDATE ${options.onUpdate.toUpperCase()}` : "";

          query = `FOREIGN KEY (${attribute.fieldName}) REFERENCES ${tableName}(${fieldName})${onDelete}${onUpdate}`;
        } else query = `UNIQUE(${attribute.fieldName})`;

        const statement = `ALTER TABLE ${table.tableName} ADD CONSTRAINT ${constraintName} ${query}`;

        this.syncLog(statement);
        if(this.sync) await this._client.query(statement);
      }
    }
  }

  async syncDataBase(): Promise<void> {
    try {
      await super.syncDataBase();

      for(const table of this.tables) this.oidLoad[table.oid || 0] = (ids: unknown[]) => table.model.load({ [table.pk.attributeName]: ["IN", ids] });
    } catch(e) {
      throw e;
    } finally {
      this.released = true;
      this._client.release();
    }
  }

  fieldType(attribute: Attribute<unknown, unknown>): string[] {
    const { [size]: _size, type } = attribute;
    let ret;

    switch(type) {
    case "BOOLEAN":
      return ["BOOL", "BOOL"];
    case "DATETIME":
      return ["DATETIME", "TIMESTAMP (3) WITH TIME ZONE"];
    case "FLOAT":
      ret = _size === 4 ? "FLOAT4" : "FLOAT8";
      return [ret, ret];
    case "INT":
      ret = _size === 2 ? "SMALLINT" : "INTEGER";
      return [ret, ret];
    case "INT8":
      return ["BIGINT", "BIGINT"];
    case "JSON":
      return ["JSON", "JSON"];
    case "NONE":
      return ["NONE", "NONE"];
    case "NUMBER":
      return ["NUMERIC", "NUMERIC"];
    case "VARCHAR":
      return ["VARCHAR", "VARCHAR" + (_size ? `(${_size})` : "")];
    }

    throw new Error(`Unknown type: '${type}', '${_size}'`);
  }

  async syncFields(table: Table): Promise<void> {
    const { attributes, autoIncrement, oid, tableName } = table;

    for(const attribute of attributes) {
      const { fieldName, notNull, [size]: _size } = attribute;
      const defaultValue = attribute.defaultValue === undefined ? (autoIncrement && fieldName === "id" ? `nextval('${tableName}_id_seq'::regclass)` : undefined) : this.escape(attribute.defaultValue);
      const [base, type] = this.fieldType(attribute);
      const where = "attrelid = $1 AND attnum > 0 AND atttypid = pg_type.oid AND attislocal = 't' AND attname = $2";

      const res = await this._client.query(
        `SELECT attnotnull, atttypmod, typname, pg_get_expr(pg_attrdef.adbin, pg_attrdef.adrelid) AS adsrc FROM pg_type, pg_attribute LEFT JOIN pg_attrdef ON adrelid = attrelid AND adnum = attnum WHERE ${where}`,
        [oid!, fieldName as unknown as number]
      );

      const addField = async () => {
        const statement = `ALTER TABLE ${tableName} ADD COLUMN ${fieldName} ${type}`;

        this.syncLog(statement);
        if(this.sync) await this._client.query(statement);
      };

      const dropDefault = async () => {
        const statement = `ALTER TABLE ${tableName} ALTER COLUMN ${fieldName} DROP DEFAULT`;

        this.syncLog(statement);
        if(this.sync) await this._client.query(statement);
      };

      const setNotNull = async (isNotNull: boolean) => {
        if(isNotNull === notNull) return;

        const statement = `ALTER TABLE ${tableName} ALTER COLUMN ${fieldName} ${notNull ? "SET" : "DROP"} NOT NULL`;

        this.syncLog(statement);
        if(this.sync) await this._client.query(statement);
      };

      const setDefault = async (isNotNull: boolean) => {
        if(defaultValue !== undefined) {
          let statement = `ALTER TABLE ${tableName} ALTER COLUMN ${fieldName} SET DEFAULT ${defaultValue}`;

          this.syncLog(statement);
          if(this.sync) await this._client.query(statement);

          if(notNull && ! isNotNull) {
            statement = `UPDATE ${tableName} SET ${fieldName} = ${defaultValue} WHERE ${fieldName} IS NULL`;

            this.syncLog(statement);
            if(this.sync) this._client.query(statement);
          }
        }

        await setNotNull(isNotNull);
      };

      if(! res.rowCount) {
        if(type !== "NONE") {
          await addField();
          await setDefault(false);
        }
      } else {
        const { adsrc, attnotnull, atttypmod, typname } = res.rows[0];

        if(types[typname as keyof typeof types] !== base || (base === "VARCHAR" && (_size ? _size + 4 !== atttypmod : atttypmod !== -1))) {
          if(needDrop.some(([type, name]) => attribute.type === type && typname === name)) {
            await this.dropField(tableName, fieldName);
            await addField();
            await setDefault(false);
          } else {
            if(adsrc) dropDefault();

            const using = needUsing.some(([type, name]) => attribute.type === type && typname === name) ? " USING " + fieldName + "::" + type : "";
            const statement = `ALTER TABLE ${tableName} ALTER COLUMN ${fieldName} TYPE ${type}${using}`;

            this.syncLog(statement);
            if(this.sync) await this._client.query(statement);
            await setDefault(attnotnull);
          }
        } else if(defaultValue === undefined) {
          if(adsrc) dropDefault();
          await setNotNull(attnotnull);
        } else if(! adsrc || this.defaultNeq(adsrc, defaultValue)) await setDefault(attnotnull);
      }
    }
  }

  async syncIndexes(table: Table): Promise<void> {
    const { indexes, tableName } = table;

    for(const index of indexes) {
      const { fields, indexName, type, unique } = index;

      if(! this.indexes.includes(indexName)) {
        const statement = `CREATE${unique ? " UNIQUE" : ""} INDEX ${indexName} ON ${tableName} USING ${type} (${fields.join(", ")})`;

        this.syncLog(statement);
        if(this.sync) await this._client.query(statement);
      }
    }
  }

  async syncSequence(table: Table): Promise<void> {
    if(! table.autoIncrementOwn) return;

    const statement = `ALTER SEQUENCE ${table.tableName}_id_seq OWNED BY ${table.tableName}.id`;

    this.syncLog(statement);
    if(this.sync) await this._client.query(statement);
  }

  async syncTable(table: Table): Promise<void> {
    if(table.autoIncrement) {
      await (async () => {
        try {
          await this._client.query(`SELECT currval('${table.tableName}_id_seq')`);
        } catch(e) {
          if(e instanceof DatabaseError && e.code === "55000") return;
          if(e instanceof DatabaseError && e.code === "42P01") {
            const statement = `CREATE SEQUENCE ${table.tableName}_id_seq`;

            this.syncLog(statement);
            if(this.sync) await this._client.query(statement);
            table.autoIncrementOwn = true;

            return;
          }

          throw e;
        }
      })();
    }

    let create = false;
    const resTable = await this._client.query("SELECT oid FROM pg_class WHERE relname = $1", [table.tableName]);

    if(resTable.rowCount) {
      table.oid = resTable.rows[0].oid;

      let drop = false;
      const resParent = await this._client.query("SELECT inhparent FROM pg_inherits WHERE inhrelid = $1", [table.oid!]);

      if(resParent.rowCount) {
        if(! table.parent) drop = true;
        else if(this.findTable(table.parent.tableName).oid === resParent.rows[0].inhparent) return;

        drop = true;
      } else if(table.parent) drop = true;

      if(drop) {
        const statement = `DROP TABLE ${table.tableName} CASCADE`;

        create = true;
        this.syncLog(statement);
        if(this.sync) await this._client.query(statement);
      }
    } else create = true;

    if(create) {
      const parent = table.parent ? ` INHERITS (${table.parent.tableName})` : "";
      const statement = `CREATE TABLE ${table.tableName} ()${parent}`;

      this.syncLog(statement);
      if(this.sync) await this._client.query(statement);

      const resTable = await this._client.query("SELECT oid FROM pg_class WHERE relname = $1", [table.tableName]);

      table.oid = resTable.rows[0]?.oid;
    }
  }
}

export class TransactionPG extends Transaction {
  private _client: PoolClient;
  private released = false;

  constructor(log: (message: string) => void, client: PoolClient) {
    super(log);
    this._client = client;
  }

  public async client() {
    return this._client;
  }

  private release() {
    this.released = true;
    this._client.release();
  }

  public async commit() {
    if(! this.released) {
      this.preCommit();
      this.log("COMMIT");
      await this._client.query("COMMIT");
      this.release();
      super.commit();
    }
  }

  public async rollback() {
    try {
      if(! this.released) {
        super.rollback();
        this.log("ROLLBACK");
        await this._client.query("ROLLBACK");
      }
    } finally {
      if(! this.released) this.release();
    }
  }
}
