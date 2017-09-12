const readlineSync = require('readline-sync');

function confirm(question, action) {

	const inputHint = "[y/n]";
	const allowedValues = "yYnN".split("");
	const confirmingValues = "yY".split("");

	const questionText = `${question} ${inputHint} `;

	function askForConfirmation() {
		const answer = readlineSync.question(questionText);
		if (allowedValues.indexOf(answer) < 0) {
			askForConfirmation();
		} else {
			if (confirmingValues.indexOf(answer) >= 0) {
				action()
			}
		}
	}

	askForConfirmation();
}

module.exports = confirm;
