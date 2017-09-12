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

module.exports = {
	run: function () {
		console.log("dev-tool-apply");

		this.checkAndApply();
	},
	module: function (moduleName) {
		const moduleDefinition = modules[moduleName];
		if (moduleName !== moduleDefinition.name) {
			console.error(`Give module name (${moduleName}) and name attribute from apply.json (${moduleDefinition.name}) do not match.`);
			return;
		}

		return new ApplyModule(moduleDefinition);
	},
	check: function (moduleName) {
		if (!moduleName) {
			Object.keys(modules).forEach(this.check.bind(this));
			return;
		}

		const module = this.module(moduleName);

		console.log(`\n  .:: ${moduleName} ::.`);

		confirm(`  Check module ${moduleName}`, () => {
			module.check();
		});
	},
	checkAndApply: function (moduleName) {
		if (!moduleName) {
			Object.keys(modules).forEach(this.checkAndApply.bind(this));
			return;
		}

		const module = this.module(moduleName);

		console.log(`\n  .:: ${moduleName} ::.`);

		confirm(`  Check module ${moduleName}`, () => {
			module.checkAndApply((applyStepWithFailedChecks) => {
				confirm(`\n  Checks for '${applyStepWithFailedChecks.description}' failed - Apply this step now?`, () => {
					applyStepWithFailedChecks.applyCommands();
					console.log(`\n  rerun checks for step - ${applyStepWithFailedChecks.description}`);
					applyStepWithFailedChecks.check();
				});
			});
		});
	}
};
