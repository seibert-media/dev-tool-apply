"use strict";

const preconditions = require("preconditions").errr();
const runCommand = require("../runCommand");

module.exports = class NpmScriptStrategy {
    constructor(applyStep) {
        preconditions.shouldBeDefined(applyStep["script-name"]).test();
        this.scriptName = applyStep["script-name"];

        preconditions.shouldBeDefined(applyStep["script-command"]).test();
        this.scriptCommand = applyStep["script-command"];
    }
    check() {
        const command = `$DEV_TOOL_APPLY_BIN/json -f package.json scripts.${this.scriptName}`;
        const result = runCommand(command);
        return result.output.trim() === this.scriptCommand.trim();
    }
    apply() {
        const command = `$DEV_TOOL_APPLY_BIN/json -I -f package.json -e 'this.scripts["${this.scriptName}"]="${this.scriptCommand}"'`;
        return runCommand(command, "log").status === 0;
    }
    changedFiles() {
        return "package.json";
    }
};
