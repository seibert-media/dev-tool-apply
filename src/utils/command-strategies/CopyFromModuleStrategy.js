const preconditions = require("preconditions").errr();
const runCommand = require("../runCommand");

module.exports = class NpmScriptStrategy {
	constructor(applyStep, moduleName) {
		this.isUntrackedFile = true;

		this.moduleName = moduleName;

		preconditions.shouldBeDefined(applyStep.srcPath).test();
		this.srcPath = applyStep.srcPath;
		this.destPath = applyStep.destPath || this.srcPath;
	}

	check() {
		return runCommand(`ls ${this.destPath}`).status === 0;
	}
	apply() {
		const command = `cp $DEV_TOOL_APPLY_MODULES/${this.moduleName}/${this.srcPath} ${this.destPath}`;
		return runCommand(command, 'log').status === 0;
	}
	changedFiles() {
		return this.destPath;
	}
};
