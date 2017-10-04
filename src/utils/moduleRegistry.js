"use strict";

const preconditions = require("preconditions").errr();
const runCommand = require("./runCommand");
const confirm = require("./confirm");

const fs = require("fs");
const path = require("path");
const uniq = require("lodash").uniq;

const modules = {};
const configCache = {};


const PROJECT_DTA_RC = {
	path: process.cwd() + "/.dtarc.json"
};

const USER_DTA_RC = {
	path: require("os").homedir() + "/.dtarc.json"
};

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
			preconditions.shouldBeUndefined(modules[fullModuleName]);
			modules[fullModuleName] = module;
			return module;
		} catch (e) {
			console.log(e);
			console.error(`Error loading module '${fullModuleName}' from ${moduleApplyJson}`);
		}
	},
	config: function () {
		return Object.values(configCache)[0] || {modules:[]};
	},
	loadConfig: function (dtaRc) {
		const dtaRcPath = dtaRc.path;
		if (configCache[dtaRcPath]) {
			return configCache[dtaRcPath];
		}

		dtaRc.exists = fs.existsSync(dtaRcPath);

		if (!dtaRc.exists) {
			return;
		}

		const config = require(dtaRcPath);

		if (!config.modules || config.modules.length === 0) {
			return;
		}

		configCache[dtaRcPath] = config;
		return config;
	},
	initExternalModules: function (skipUserRc = false) {
		this.loadExternalModules(PROJECT_DTA_RC);

		if (!skipUserRc) {
			this.loadExternalModules(USER_DTA_RC);
		}
	},
	loadExternalModules: function (dtaRc) {
		const config = this.loadConfig(dtaRc);
		if (!config) {
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
				console.error(`\nWARN: Module '${moduleName}' configured in ${dtaRc.path} is not installed.\nRun: npm install <options> ${moduleName}\n`);
			}
		});
	},
	installModules: function (npmInstallOptions = "", ...moduleNames) {
		const hasModuleParams = !moduleNames || !moduleNames.length;
		if (!hasModuleParams) {
			moduleNames = this.config().modules;
		}

		moduleNames.forEach((moduleName) => {
			const result = runCommand(`npm install ${npmInstallOptions} ${moduleName}`);
			if (result.status) {
				console.log(result.output);
				console.log(`Error installing the dta module: '${moduleName}'`);
			} else {
				console.log(`Successfully installed '${moduleName}'`);
			}
		});

		if (hasModuleParams) {
			this.addModulesToConfig(moduleNames);
		}
	},
	addModulesToConfig: function (moduleNames) {
		const config = this.config(PROJECT_DTA_RC) || {
			modules: []
		};

		config.modules.push(...moduleNames);

		const dtaRcContent = JSON.stringify(config);

		console.log(`\nWrite file '${PROJECT_DTA_RC.path}':\n\n${dtaRcContent}`);
		fs.writeFileSync(PROJECT_DTA_RC.path, dtaRcContent);
	},
	initModules: function () {
		if (PROJECT_DTA_RC.exists) {
			console.log(`dev-tools-apply configuration already exists: ${PROJECT_DTA_RC.path}`);
			return;
		}
		const result = runCommand("npm search --json dta-modules");

		if (result.status) {
			console.log("Error searching modules");
			return;
		}

		const foundModules = JSON.parse(result.output);
		const moduleNames = uniq(foundModules.map((module) => module.name));

		const selectedModuleNames = [];

		if (moduleNames.length === 0) {
			console.log("No dta modules found in npm registry");
			return;
		}

		moduleNames.forEach(function (moduleName) {
			console.log(moduleName);

			if(confirm(`Found module ${moduleName}. Add to .dtarc.json?`)) {
				selectedModuleNames.push(moduleName);
			}
		});

		this.addModulesToConfig(selectedModuleNames);
	}
};
