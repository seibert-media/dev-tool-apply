"use strict";

const preconditions = require("preconditions").errr();
const runCommand = require("../runCommand");

module.exports = class NpmInstallStrategy {
	constructor(applyStep) {
		preconditions.shouldBeDefined(applyStep["npm-module"]).test();
		this.npmModule = applyStep["npm-module"];

		this.options = applyStep.dev === false ? "--save" : "--save-dev";
	}
	check() {
		return runCommand(`npm ls ${this.npmModule}`).status === 0;
	}
	apply() {
		return runCommand(`npm install ${this.options} ${this.npmModule}`, "log").status === 0;
	}
	changedFiles() {
		return "package.json";
	}
};
