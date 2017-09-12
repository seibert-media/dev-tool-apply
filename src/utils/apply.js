const _ = require("lodash");
const preconditions = require("preconditions").errr();

const runCommand = require("./runCommand");

class ApplyStep {
	constructor(applyStep, module) {
		preconditions.shouldBeString(applyStep.description);
		preconditions.shouldBeArray(applyStep.commands);
		preconditions.shouldBeObject(applyStep.checks);

		this.description = applyStep.description;
		this.commands = applyStep.commands;
		this.checks = applyStep.checks;
		this.module = module;
	}

	check() {
		let failingChecks = 0;

		_.forEach(this.checks, (checkComand, checkDescription) => {
			const result = runCommand(checkComand);
			const infoString = `${checkDescription} (${this.module.name})`;

			if (result.status === 0) {
				console.log(`✓ check successful - ${infoString}`);
			} else {
				console.log(`✗ check failed - ${infoString}`);
				failingChecks++;
			}
		});

		return failingChecks;
	}

	applyCommands() {
		this.commands.forEach((command) => {
			runCommand(command, 'log');
		});
	}
}

class ApplyModule {
	constructor(moduleDefinition) {
		preconditions.shouldBeString(moduleDefinition.name);
		this.name = moduleDefinition.name;

		preconditions.shouldBeArray(moduleDefinition.applySteps);
		this.applySteps = moduleDefinition.applySteps.map((applyStep) => {
			return new ApplyStep(applyStep, this);
		});

	}

	check() {
		this.applySteps.forEach((applyStep) => {
			applyStep.check();
		});
	}

	checkAndApply(failingCallback) {
		this.applySteps.forEach((applyStep) => {
			const failingChecks = applyStep.check();

			if (failingChecks) {
				failingCallback(applyStep);
			}
		});
	}
}

module.exports.ApplyStep = ApplyStep;
module.exports.ApplyModule = ApplyModule;
