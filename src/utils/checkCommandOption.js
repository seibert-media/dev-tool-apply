"use strict";

const pull = require("lodash").pull;

module.exports = function checkCommandOption(argumentName, keepCommand = false) {
	const processArguments = process.argv;

	const parameterIsSet = processArguments.indexOf(argumentName) >= 0;

	if (parameterIsSet && !keepCommand) {
		pull(processArguments, argumentName);
	}

	return parameterIsSet;
};
