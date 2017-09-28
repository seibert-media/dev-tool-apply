"use strict";

const pull = require("lodash").pull;

module.exports = function checkAndRemoveCommandOption(argumentName) {
	const processArguments = process.argv;

	const parameterIsSet = processArguments.indexOf(argumentName) >= 0;

	if (parameterIsSet) {
		pull(processArguments, argumentName);
	}

	return parameterIsSet;
};
