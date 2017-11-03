"use strict";

const runCommand = require("../runCommand");

const DiffCopyFromModuleStrategy = require("./DiffCopyFromModuleStrategy");

module.exports = class InitialCopyFromModuleStrategy extends DiffCopyFromModuleStrategy {
    constructor(applyStep, module) {
        super(applyStep, module);
    }
    check() {
        return runCommand(`ls ${this.destPath}`).status === 0;
    }
};
