"use strict";

const runCommand = require("../runCommand");

const DiffCopyFromModuleStrategy = require("./DiffCopyFromModuleStrategy");

module.exports = class InitialCopyFromModuleStrategy extends DiffCopyFromModuleStrategy {
	constructor(applyStep, moduleName) {
		super(applyStep, moduleName);
	}
	check() {
		return runCommand(`ls ${this.destPath}`).status === 0;
	}
};
