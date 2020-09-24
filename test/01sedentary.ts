"use strict";

import { Sedentary } from "..";
import { ok } from "assert";

describe("sedentary", () => {
	describe("new Sedentary()", () => {
		let db: Sedentary;

		before(() => (db = new Sedentary("test")));
		it("constructor", () => ok(db instanceof Sedentary));
	});
});
