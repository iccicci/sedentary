import { Sedentary as SedentaryBase, SedentaryOptions, Transaction } from "..";
import { TestDB } from "./testDb";

export class Sedentary extends SedentaryBase<TestDB, Transaction> {
  constructor(filename: string, options?: SedentaryOptions) {
    super(options);

    this.db = new TestDB(filename, this.log);
  }
}

export const Package = Sedentary;
