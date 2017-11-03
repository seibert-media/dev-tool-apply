"use strict";

const fileExists = require("fs").existsSync;
const dirname = require("path").dirname;

const preconditions = require("preconditions").errr();
const runCommand = require("../runCommand");

module.exports = class DiffCopyFromModuleStrategy {
    constructor(applyStep, module) {
        preconditions.shouldBeDefined(module.name);
        preconditions.shouldBeDefined(module.path);
        this.moduleName = module.name;
        this.modulePath = module.path;

        preconditions.shouldBeDefined(applyStep.srcPath).test();
        this.srcPath = applyStep.srcPath;
        this.destPath = applyStep.destPath || this.srcPath;

        this.absoluteSrcPath = `${this.modulePath}${this.moduleName}/${this.srcPath}`;
    }

    check() {
        return runCommand(`git diff --no-index -- ${this.destPath} ${this.absoluteSrcPath}`).status === 0;
    }
    apply() {
        const destDirectory = dirname(this.destPath);
        if (!fileExists(destDirectory)) {
            runCommand(`mkdir -p ${destDirectory}`);
        }
        const command = `cp ${this.absoluteSrcPath} ${this.destPath}`;
        return runCommand(command, "log").status === 0;
    }
    changedFiles() {
        return this.destPath;
    }
};
