const readline = require('readline');

function confirm(question, action) {
	const readlineInterface = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	const inputHint = "[y/n]";
	const allowedValues = "yYnN".split("");
	const confirmingValues = "yY".split("");

	const questionText = `${question} ${inputHint} `;

	function askForConfirmation() {
		readlineInterface.question(questionText, (answer) => {
			if (allowedValues.indexOf(answer) < 0) {
				askForConfirmation();
			} else {
				readlineInterface.close();
				if (confirmingValues.indexOf(answer) >= 0) {
					action()
				}
			}
		});
	}

	askForConfirmation();
}

module.exports = confirm;
