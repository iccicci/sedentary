"use strict";

var assert    = require("assert");
var Sedentary = require("..");

describe("sedentary", function() {
	describe("with new", function() {
		before(function() {
			this.db = new Sedentary();
		});

		it("constructor", function() {
			assert.equal(this.db instanceof Sedentary, true);
		});
	});

	describe("without new", function() {
		before(function() {
			this.db = Sedentary();
		});

		it("constructor", function() {
			assert.equal(this.db instanceof Sedentary, true);
		});
	});
});
