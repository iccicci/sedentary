import { PoolConfig } from "pg";
import { Sedentary, SedentaryOptions } from "sedentary";

import { PGDB, TransactionPG } from "./pgdb";

export { TransactionPG } from "./pgdb";
export { Entry, EntryBase, SedentaryOptions, TxAction, Type } from "sedentary";

export class SedentaryPG extends Sedentary<PGDB, TransactionPG> {
  constructor(connection: PoolConfig, options?: SedentaryOptions) {
    super(options);

    if(! (connection instanceof Object)) throw new Error("SedentaryPG.constructor: 'connection' argument: Wrong type, expected 'Object'");

    this.db = new PGDB(connection, this.log);
  }

  public begin() {
    return this.db.begin();
  }

  public client() {
    return this.db.client();
  }
}
