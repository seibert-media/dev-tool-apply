const execSync = require("child_process").execSync;

module.exports = function runCommand(command) {
	try {
		execSync(command, {
			encoding: 'utf-8',
			stdio: [0]
		});
		return {
			status: 0
		};
	} catch (e) {
		return {
			status: e.status
		};
	}
};
