"use strict";

const preconditions = require("preconditions").errr();
const runCommand = require("./runCommand");
const confirm = require("./confirm");

const fs = require("fs");
const path = require("path");

const modules = {};

module.exports.moduleRegistry = {
	modules: function () {
		return modules;
	},
	moduleNames: function () {
		return Object.keys(modules);
	},
	loadModule: function (modulePath, moduleName, namespace = "") {
		const moduleApplyJson = modulePath + moduleName + "/apply.json";
		const fullModuleName = namespace + moduleName;
		try {
			const module = require(modulePath + moduleName + "/apply.json");
			module.fullModuleName = fullModuleName;
			module.path = modulePath;
			modules[fullModuleName] = module;
			return module;
		} catch (e) {
			console.log(e);
			console.error(`Error loading module '${fullModuleName}' from ${moduleApplyJson}`);
		}
	},
	loadInternalModules: function (modulesPath) {
		fs.readdirSync(modulesPath).forEach((moduleName) => {
			this.loadModule(modulesPath, moduleName);
		});
	},
	loadExternalModules: function (dtaRcConfigPath) {
		if (!fs.existsSync(dtaRcConfigPath)) {
			return;
		}

		const config = require(dtaRcConfigPath);

		if (!config.modules || config.modules.length === 0) {
			return;
		}

		config.modules.forEach((moduleName) => {
			try {
				const modulePath = path.dirname(require.resolve(moduleName)) + "/";
				const moduleContent = require(moduleName);
				preconditions.shouldBeString(moduleContent.name);
				preconditions.shouldBeArray(moduleContent.modules);

				const moduleNamespace = moduleContent.name + "/";
				moduleContent.modules.forEach((moduleName) => {
					this.loadModule(modulePath, moduleName, moduleNamespace);
				});

			} catch(e) {
				console.error(`\nModule '${moduleName}' configured in ${dtaRcConfigPath} is not installed.\nRun: npm install <options> ${moduleName}`);
				process.exit(e.code);
			}
		});
	}
};
