const preconditions = require("preconditions").errr();
const runCommand = require("../runCommand");

module.exports = class DefaultCommandStrategy {
	constructor(applyStep) {
		preconditions.shouldBeDefined(applyStep.check).test();
		this.checkCommmand = applyStep.check;

		preconditions.shouldBeArray(applyStep.commands).test();
		this.commands = applyStep.commands;

		this.changedFilesByCommand = applyStep.changedFiles || "";
	}
	check() {
		return runCommand(this.checkCommmand).status === 0;
	}
	apply() {
		this.commands.forEach((command) => {
			runCommand(command, 'log');
		});
	}
	changedFiles() {
		return this.changedFilesByCommand;
	}
};
