"use strict";

const _ = require("lodash");
const fs = require("fs");

const apply = require("./utils/apply");
const confirm = require("./utils/confirm");

const ApplyModule = apply.ApplyModule;

const modules = (function loadModules() {
	const modulesPath = __dirname + "/modules/";
	const collectModules = {};

	fs.readdirSync(modulesPath).forEach((moduleName) => {
		collectModules[moduleName] = require(modulesPath + moduleName + "/apply.json");
	});

	return collectModules;
}());

const moduleNames = Object.keys(modules);
const moduleNameList = `• ${moduleNames.join("\n• ")}`;

const usage = `Usage: ${process.argv[1]} apply [moduleName]

${moduleNameList}
`;

const devToolsApplyInternal = {
	module: function (moduleName) {
		const moduleDefinition = modules[moduleName];
		if (!moduleDefinition) {
			console.error(`Given module name '${moduleName}' does not exists. Choose on of the following modules:\n\n${moduleNameList}\n`);
			return;
		}

		if (moduleName !== moduleDefinition.name) {
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

		const processArguments = process.argv;

		if (processArguments.indexOf("--version") >= 0) {
			console.log(require("../package.json").version);
			return;
		}

		if (processArguments.indexOf("--help") >= 0) {
			this.help();
			return;
		}

		if (processArguments.indexOf("--silent") >= 0) {
			confirm.silent = true;
			_.pull(processArguments, "--silent");
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
	}
};
