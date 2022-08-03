import { Attribute, EntryBase, ForeignKeyOptions, Natural, Sedentary, SedentaryOptions, Type } from "sedentary";
import { PoolConfig } from "pg";

import { PGDB, TransactionPG } from "./pgdb";

export { Entry, EntryBase, SedentaryOptions, Type } from "sedentary";
export { TransactionPG } from "./pgdb";

export class SedentaryPG extends Sedentary<PGDB, TransactionPG> {
  constructor(connection: PoolConfig, options?: SedentaryOptions) {
    super(options);

    if(! (connection instanceof Object)) throw new Error("SedentaryPG.constructor: 'connection' argument: Wrong type, expected 'Object'");

    this.db = new PGDB(connection, this.log);
  }

  FKEY<N extends Natural, E extends EntryBase>(attribute: Attribute<N, E>, options?: ForeignKeyOptions): Type<N, E> {
    const { attributeName, modelName, unique } = attribute;

    if(! unique) throw new Error(`Sedentary.FKEY: '${modelName}' model: '${attributeName}' attribute: is not unique: can't be used as FKEY target`);

    return super.FKEY(attribute, options);
  }

  public async begin(): Promise<TransactionPG> {
    return (this.db as PGDB).begin();
  }

  public async client() {
    return (this.db as PGDB).client();
  }
}

export const Package = SedentaryPG;
