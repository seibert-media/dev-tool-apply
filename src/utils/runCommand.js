"use strict";

const execSync = require("child_process").execSync;

const stdioTypes = {
    default: [0],
    log: [0, 1, 2]
};

module.exports = function runCommand(command, stdioType = "default") {
    try {
        if (stdioType === "log") {
            console.log(`  execute command: ${command}`);
        }
        const output = execSync(command, {
            encoding: "utf-8",
            stdio: stdioTypes[stdioType]
        });
        return {
            status: 0,
            output: output
        };
    } catch (exception) {
        return {
            status: exception.status,
            output: exception.message
        };
    }
};
