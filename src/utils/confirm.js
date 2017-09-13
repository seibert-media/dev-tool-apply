"use strict";

const readlineSync = require('readline-sync');

function confirm(question) {
	if (confirm.silent === true) {
		return true;
	}
	const inputHint = "[y/n]";
	const allowedValues = "yYnN".split("");
	const confirmingValues = "yY".split("");

	const questionText = `${question} ${inputHint} `;

	function askForConfirmation() {
		const answer = readlineSync.question(questionText);
		if (allowedValues.indexOf(answer) < 0) {
			return askForConfirmation();
		}

		return confirmingValues.indexOf(answer) >= 0;
	}

	return askForConfirmation();
}

confirm.silent = false;

module.exports = confirm;
