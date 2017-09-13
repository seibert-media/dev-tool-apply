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
        return runCommand(`npm run ${this.scriptName}`).status === 0;
    }
    apply() {
        const command = `$DEV_TOOL_APPLY_BIN/json -I -f package.json -e 'this.scripts[\"${this.scriptName}\"]=\"${this.scriptCommand}\"'`;
        return runCommand(command, 'log').status === 0;
    }
    changedFiles() {
        return "package.json";
    }
};
