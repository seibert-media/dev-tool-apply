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

const usage = `Usage: ${process.argv[1]} [moduleName]

${moduleNameList}
`;

module.exports = {
	run: function () {
		console.log("dev-tool-apply\n");

		const argv = process.argv.slice(2);

		if (process.argv.indexOf("--version") >= 0) {
			console.log(require("../package.json").version);
			return;
		}

		if (process.argv.indexOf("--help") >= 0) {
			console.log(usage);
			return;
		}

		if (process.argv.indexOf("--silent") >= 0) {
			confirm.silent = true;
			_.pull(argv, "--silent");
		}

		if (argv.length > 0) {
			this.checkAndApplyModules(argv, true);
		} else {
			this.checkAndApplyModules(moduleNames, false);
		}
	},
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

					if (confirm(`\n  Add changes to git now?`)) {
						applyStepWithFailedChecks.save();
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
		})
	}
};
