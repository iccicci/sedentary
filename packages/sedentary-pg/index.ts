import { PoolConfig } from "pg";
import { Attribute, EntryBase, ForeignKeyOptions, Sedentary, SedentaryOptions } from "sedentary";

import { PGDB, TransactionPG } from "./pgdb";

export { TransactionPG } from "./pgdb";
export { Action, Entry, EntryBase, SedentaryOptions, Type } from "sedentary";

export class SedentaryPG extends Sedentary<PGDB, TransactionPG> {
  constructor(connection: PoolConfig, options?: SedentaryOptions) {
    super(options);

    if(! (connection instanceof Object)) throw new Error("SedentaryPG.constructor: 'connection' argument: Wrong type, expected 'Object'");

    this.db = new PGDB(connection, this.log);
  }

  FKey<T, E extends EntryBase>(attribute: Attribute<T, boolean, E>, options?: ForeignKeyOptions) {
    const { attributeName, modelName, unique } = attribute;

    if(! unique) throw new Error(`SedentaryPG.FKey: '${modelName}' model: '${attributeName}' attribute: is not unique: can't be used as FKey target`);

    return super.FKey(attribute, options);
  }

  public begin() {
    return this.db.begin();
  }

  public client() {
    return this.db.client();
  }
}
