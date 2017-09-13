const _ = require("lodash");
const preconditions = require("preconditions").errr();

const runCommand = require("./runCommand");

class DefaultCommandStrategy {
	constructor(applyStep) {
		preconditions.shouldBeObject(applyStep).test();

		preconditions.shouldBeDefined(applyStep.check).test();
		this.checkCommmand = applyStep.check;

		preconditions.shouldBeArray(applyStep.commands).test();
		this.commands = applyStep.commands;
	}
	check() {
		const result = runCommand(this.checkCommmand);
		return result.status === 0;
	}

	apply() {
		this.commands.forEach((command) => {
			runCommand(command, 'log');
		});
	}
}

const strategyClassByType = {
	command: DefaultCommandStrategy
};

class ApplyStep {
	constructor(applyStep, module) {
		preconditions.shouldBeString(applyStep.description).test();
		this.description = applyStep.description;

		preconditions.shouldBeString(applyStep.type).test();
		this.type = applyStep.type;
		const StrategyForType = strategyClassByType[this.type];
		preconditions.shouldBeDefined(StrategyForType).test();

		this.commandStrategy = new StrategyForType(applyStep);

		this.module = module;
	}

	check() {
		const infoString = `${this.description} (${this.module.name})`;
		const checkResult = this.commandStrategy.check();

		if (checkResult) {
			console.log(`✓ check successful - ${infoString}`);
		} else {
			console.log(`✗ check failed - ${infoString}`);
		}

		return checkResult;
	}

	apply() {
		this.commandStrategy.apply();
	}
}

class ApplyModule {
	constructor(moduleDefinition) {
		preconditions.shouldBeString(moduleDefinition.name).test();
		this.name = moduleDefinition.name;

		preconditions.shouldBeArray(moduleDefinition.applySteps).test();
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
			const success = applyStep.check();

			if (!success) {
				failingCallback(applyStep);
			}
		});
	}
}

module.exports.ApplyStep = ApplyStep;
module.exports.ApplyModule = ApplyModule;
