// gets the JSON data from the Data Tokens tab and returns a new object with lowercase keys
const ParseDataTokens = function () {
	const DataTokensText = VV.Form.GetFieldValue('Data Tokens');

	let DataTokensNormalized = {};
	const DataTokensJSON = JSON.parse(DataTokensText);
	for (let ldjKey in DataTokensJSON) {
		let lowerCaseProps = {}
		if (DataTokensJSON.hasOwnProperty(ldjKey)) {
			for (let itemKey in DataTokensJSON[ldjKey]) {
				if (DataTokensJSON[ldjKey].hasOwnProperty(itemKey)) {
					// make all of the keys lowercase to facilitate parsing
					lowerCaseProps[itemKey.toLowerCase()] = DataTokensJSON[ldjKey][itemKey];
				}
			}
		}
		DataTokensNormalized[ldjKey] = lowerCaseProps;
	}
	return DataTokensNormalized;
};

// search and replace tokens on the input string
const SearchAndReplaceTokens = function () {
	const DataTokens = ParseDataTokens(); // gets data from data tab
	if (!DataTokens || DataTokens.length < 1) {
		return
	}

	const tokenRegex = new RegExp('\\[[^\\]]+\\]', 'g');

	let m;
	let tokens = [];
	let tokensNotFound = [];

	while ((m = tokenRegex.exec(inputText)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === tokenRegex.lastIndex) {
			tokenRegex.lastIndex++;
		}

		// The result can be accessed through the `m`-variable.
		m.forEach((match) => {
			let foundToken = false;

			let key = match.substring(1, match.length - 1);
			let tokenName = key.toLowerCase();

			for (let ldk in DataTokens) {
				if (DataTokens[ldk][tokenName] !== undefined) {
					if (DataTokens[ldk][tokenName].length == 0) {
						tokens.push({
							"regex": '\\[' + key + '\\]<br>',
							"value": DataTokens[ldk][tokenName]
						});
					}
					tokens.push({
						"regex": '\\[' + key + '\\]',
						"value": DataTokens[ldk][tokenName]
					});
					foundToken = true;
					break;
				}
			}

			if (!foundToken) {
				tokensNotFound.push(tokenName);
			}
		});
	}

	for (let token of tokens) {
		inputText = inputText.replace(new RegExp(token.regex, 'g'), token.value);
	}
};

SearchAndReplaceTokens();

return inputText;