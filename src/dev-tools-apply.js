"use strict";

const apply = require("./utils/apply");
const moduleRegistry = require("./utils/moduleRegistry").moduleRegistry;
const confirm = require("./utils/confirm");
const checkAndRemoveCommandOption = require("./utils/checkAndRemoveCommandOption");

const ApplyModule = apply.ApplyModule;

moduleRegistry.initExternalModules();

const moduleNames = moduleRegistry.moduleNames();
const moduleNameList = `• ${moduleNames.join("\n• ")}`;

const usage = `Usage: ${process.argv[1]} apply [moduleName]

${moduleNameList}
`;

const devToolsApplyInternal = {
	module: function (moduleName) {
		const modules = moduleRegistry.modules();
		const moduleDefinition = modules[moduleName];
		if (!moduleDefinition) {
			console.error(`Given module name '${moduleName}' does not exists. Choose on of the following modules:\n\n${moduleNameList}\n`);
			return;
		}

		if (moduleName !== moduleDefinition.fullModuleName) {
			console.error(`Give module name (${moduleName}) and name attribute from apply.json (${moduleDefinition.name}) do not match.`);
			return;
		}

		return new ApplyModule(moduleDefinition);
	},
	checkModule: function (moduleName, skipConfirm) {
		const module = this.module(moduleName);

		if (!module) {
			return;
		}

		console.log(`\n  .:: ${moduleName} ::.`);

		if (skipConfirm === true || confirm(`  Check module ${moduleName}`)) {
			module.check();
		}
	},
	checkAndApplyModule: function (moduleName, skipConfirm) {
		const module = this.module(moduleName);

		if (!module) {
			return;
		}

		console.log(`\n  .:: ${moduleName} ::.`);

		if (skipConfirm === true || confirm(`  Check module ${moduleName}`)) {
			module.checkAndApply((applyStepWithFailedChecks) => {
				if (confirm(`\n  Checks for '${applyStepWithFailedChecks.description}' failed - Apply this step now?`)) {
					applyStepWithFailedChecks.apply();

					if (confirm("\n  Add changes to git now?")) {
						applyStepWithFailedChecks.save(confirm.silent);
					}

					console.log(`\n  rerun checks for step - ${applyStepWithFailedChecks.description}`);
					applyStepWithFailedChecks.check();
				}
			});
		}
	},
	checkAndApplyModules: function (modules, skipConfirm) {
		modules.forEach((module) => {
			this.checkAndApplyModule(module, skipConfirm);
		});
	}
};

module.exports = {
	help: function () {
		console.log(usage);
	},
	run: function (command) {
		console.log("dev-tool-apply\n");

		if(checkAndRemoveCommandOption("--version")) {
			console.log(require("../package.json").version);
			return;
		}

		if(checkAndRemoveCommandOption("--help")) {
			this.help();
			return;
		}

		if(checkAndRemoveCommandOption("--silent")) {
			confirm.silent = true;
		}

		const commandFn = this[command];
		if (!commandFn) {
			this.help();
			return;
		}
		const commandArguments = process.argv.slice(3);
		commandFn.apply(this, commandArguments);
	},
	apply: function (...parameterModuleNames) {
		if (parameterModuleNames.length > 0) {
			devToolsApplyInternal.checkAndApplyModules(parameterModuleNames, true);
		} else {
			devToolsApplyInternal.checkAndApplyModules(moduleNames, false);
		}
	},
	init: function () {
		moduleRegistry.initModules();
	},
	install: function (npmInstallOption) {
		moduleRegistry.installModules(npmInstallOption);
	}
};
