"use strict";

const preconditions = require("preconditions").errr();
const runCommand = require("../runCommand");

module.exports = class DefaultCommandStrategy {
	constructor(applyStep) {
		preconditions.shouldBeDefined(applyStep.check).test();
		this.checkCommmand = applyStep.check;

		preconditions.shouldBeArray(applyStep.commands).test();
		this.commands = applyStep.commands;

		this.changedFilesByCommand = applyStep.changedFiles || "";

		this.expectedOutput = applyStep.expectedOutput;
	}
	check() {
		const commandResult = runCommand(this.checkCommmand);

		if (this.expectedOutput !== undefined) {
			return commandResult.output.trim() === this.expectedOutput.trim();
		}

		return commandResult.status === 0;
	}
	apply() {
		this.commands.forEach((command) => {
			runCommand(command, "log");
		});
	}
	changedFiles() {
		return this.changedFilesByCommand;
	}
};
