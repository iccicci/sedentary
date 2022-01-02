import { Sedentary as SedentaryBase, SedentaryOptions } from "..";
import { TestDB } from "./testdb";

export class Sedentary extends SedentaryBase {
  constructor(filename: string, options?: SedentaryOptions) {
    super(options);

    this.db = new TestDB(filename, this.log);
  }
}

export const Package = Sedentary;
