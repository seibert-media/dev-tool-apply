const fs = require("fs");
const _ = require("lodash");

const apply = require("./utils/apply");
const confirm = require("./utils/confirm");

const ApplyModule = apply.ApplyModule;

const modules = (function loadModules() {
	const modulesPath = __dirname + "/modules/";
	const modules = {};

	fs.readdirSync(modulesPath).forEach((moduleName) => {
		modules[moduleName] = require(modulesPath + moduleName + "/apply.json");
	});

	return modules;
}());

const moduleNames = Object.keys(modules);

module.exports = {
	run: function (moduleName) {
		console.log("dev-tool-apply\n");

		this.checkAndApply(moduleName, true);
	},
	module: function (moduleName) {
		const moduleDefinition = modules[moduleName];
		if (!moduleDefinition) {
			console.error(`Given module name '${moduleName}' does not exists. Choose on of the following modules:\n\n• ${moduleNames.join("\n• ")}\n`);
			return;
		}

		if (moduleName !== moduleDefinition.name) {
			console.error(`Give module name (${moduleName}) and name attribute from apply.json (${moduleDefinition.name}) do not match.`);
			return;
		}

		return new ApplyModule(moduleDefinition);
	},
	check: function (moduleName, skipConfirm) {
		if (!moduleName) {
			moduleNames.forEach(this.check.bind(this));
			return;
		}

		const module = this.module(moduleName);

		if (!module) {
			return;
		}

		console.log(`\n  .:: ${moduleName} ::.`);

		if (skipConfirm || confirm(`  Check module ${moduleName}`)) {
			module.check();
		}
	},
	checkAndApply: function (moduleName, skipConfirm) {
		if (!moduleName) {
			moduleNames.forEach(this.checkAndApply.bind(this));
			return;
		}

		const module = this.module(moduleName);

		if (!module) {
			return;
		}

		console.log(`\n  .:: ${moduleName} ::.`);

		if (skipConfirm || confirm(`  Check module ${moduleName}`)) {
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
	}
};
