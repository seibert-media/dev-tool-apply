const _ = require("lodash");
const preconditions = require("preconditions").errr();
const runCommand = require("./runCommand");

const strategyClassByType = {
	"command": require("./command-strategies/DefaultCommandStrategy"),
	"npm-install": require("./command-strategies/NpmInstallStrategy"),
	"npm-script": require("./command-strategies/NpmScriptStrategy"),
	"copy-from-modules": require("./command-strategies/CopyFromModuleStrategy")
};

class ApplyStep {
	constructor(applyStep, module) {
		this.module = module;

		preconditions.shouldBeString(applyStep.description).test();
		this.description = applyStep.description;

		const StrategyForType = strategyClassByType[applyStep.type];
		preconditions.shouldBeDefined(StrategyForType, `No strategy found for type '${applyStep.type}'`).test();
		this.commandStrategy = new StrategyForType(applyStep, this.module.name);
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

	save() {
		const changedFiles = this.commandStrategy.changedFiles();
		if (!changedFiles) {
			return;
		}
		if (this.commandStrategy.isUntrackedFile) {
			runCommand(`git add ${changedFiles}`, "log");
		} else {
			runCommand(`git add -p ${changedFiles}`, "log");
		}
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
