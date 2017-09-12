const fs = require("fs");
const _ = require("lodash");

const apply = require("./utils/apply");
const confirm = require("./utils/confirm");

const ApplyModule = apply.ApplyModule;

const modulesPath = __dirname + "/modules/";

module.exports = {
	run: function () {
		console.log("dev-tool-apply");

		this.check();
	},
	check: function (moduleName) {
		const modules = this.loadDefinitions();

		if (!moduleName) {
			Object.keys(modules).forEach(this.check.bind(this));
			return;
		}

		const moduleDefinition = modules[moduleName];
		if (moduleName !== moduleDefinition.name) {
			console.error(`Give module name (${moduleName}) and name attribute from apply.json (${moduleDefinition.name}) do not match.`);
			return;
		}

		const module = new ApplyModule(moduleDefinition);

		console.log(`\n  .:: ${moduleName} ::.`);

		confirm(`  Check module ${moduleName}`, () => {
			module.check();
		});

	},
	loadDefinitions: function() {
		const modules = {};

		fs.readdirSync(modulesPath).forEach((moduleName) => {
			modules[moduleName] = require(modulesPath + moduleName + "/apply.json");
		});

		return modules;
	}
};
