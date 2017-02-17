"use strict";

function Sedentary() {
	if(! (this instanceof Sedentary))
		return new Sedentary(arguments);
}

module.exports = Sedentary;
