"use strict";

const preconditions = require("preconditions").errr();
const runCommand = require("../runCommand");

module.exports = class DiffCopyFromModuleStrategy {
	constructor(applyStep, moduleName) {
		this.moduleName = moduleName;

		preconditions.shouldBeDefined(applyStep.srcPath).test();
		this.srcPath = applyStep.srcPath;
		this.destPath = applyStep.destPath || this.srcPath;

		this.absoluteSrcPath = `$DEV_TOOL_APPLY_MODULES/${this.moduleName}/${this.srcPath}`;

		this.isUntrackedFile = runCommand(`git ls-files ${this.destPath}`).output.trim() === "";
	}

	check() {
		return runCommand(`git diff --no-index -- ${this.destPath} ${this.absoluteSrcPath}`).status === 0;
	}
	apply() {
		const command = `cp ${this.absoluteSrcPath} ${this.destPath}`;
		return runCommand(command, 'log').status === 0;
	}
	changedFiles() {
		return this.destPath;
	}
};
