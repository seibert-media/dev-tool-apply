const fs = require("fs");
const _ = require("lodash");

const confirm = require("./utils/confirm");
const runCommand = require("./utils/runCommand");

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

		console.log(`\n  .:: ${moduleName} ::.`);

		confirm(`  Check module ${moduleName}`, () => {
			const moduleVersions = moduleDefinition.versions;

			moduleVersions.forEach(function (moduleVersion) {
				console.log(`\n  check version ${moduleVersion.version} - ${moduleVersion.description}`);
				_.forEach(moduleVersion.check, (command, checkDescription) => {
					const result = runCommand(command);

					if (result.status === 0) {
						console.log(`✓ check successful - ${checkDescription} (${moduleName})`);
					} else {
						console.log(`✗ check failed - ${checkDescription} (${moduleName})`);
					}
				});
			});
		});

	},
	loadDefinitions: function() {
		const modules = {};

		fs.readdirSync(modulesPath).forEach((moduleName) => {
			const applyJson = require(modulesPath + moduleName + "/apply.json");
			modules[moduleName] = applyJson;
		});


		return modules;
	}
};
