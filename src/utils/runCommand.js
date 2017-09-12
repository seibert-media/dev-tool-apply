const execSync = require("child_process").execSync;

const stdioTypes = {
	default: [0],
	log: [0,1,2]
};

module.exports = function runCommand(command, stdioType = "default") {
	try {
		execSync(command, {
			encoding: 'utf-8',
			stdio: stdioTypes[stdioType]
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
