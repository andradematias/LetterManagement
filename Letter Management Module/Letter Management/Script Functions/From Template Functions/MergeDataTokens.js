
// MergeDataTokens for Letter Management - Does a search and replace on the tokens in the Letter HTML field for values on the Data Tokens tab.
const SignatureTokens = ['cmo signature', 'deputy director signature'];
const SignatureWidth = '200px';
let tokensNotFound = { notExist: [], noValue: [] };

// gets the JSON data from the Data Tokens tab and returns a new object with lowercase keys
const ParseDataTokens = function () {
	const DataTokensText = VV.Form.GetFieldValue('Data Tokens');
	const DataTokensJSON = JSON.parse(DataTokensText);
	let DataTokens = {};

	for (let i = 0; i < DataTokensJSON.length; i++) {
		DataTokens[i] = DataTokensJSON[i].value;
	}

	let DataTokensNormalized = {};
	for (let ldjKey in DataTokens) {
		let lowerCaseProps = {};
		if (DataTokens.hasOwnProperty(ldjKey)) {
			for (let itemKey in DataTokens[ldjKey]) {
				if (DataTokens[ldjKey].hasOwnProperty(itemKey)) {
					// make all of the keys lowercase to facilitate parsing
					lowerCaseProps[itemKey.toLowerCase()] = DataTokens[ldjKey][itemKey];
				}
			}
		}
		DataTokensNormalized[ldjKey] = lowerCaseProps;
	}
	return DataTokensNormalized;
};

const ShowTokenNotFoundModal = function () {
	let modalTitle = 'Tokens could not be replaced';
	let modalBody = '<p>Unable to replace all tokens in the body of the letter because the corresponding information was not found in this context. Please make sure the name of the token matches an item from the list of tokens found in the Data Tokens tab.</p>';
	if (tokensNotFound.notExist.length > 0) {
		modalBody += '<p>The following Tokens were not found:</p>'
		for (let line in tokensNotFound.notExist) {
			modalBody += '<ul style="margin-bottom: 2px;"><strong>[' + tokensNotFound.notExist[line] + ']</strong></ul>\n';
			modalBody += '\n';
		}
		modalBody += '<br>';
	}
	if (tokensNotFound.noValue.length > 0) {
		modalBody += '<p>The following tokens do not have a value that can replace an existing token:</p>'
		for (let line in tokensNotFound.noValue) {
			modalBody += '<ul style="margin-bottom: 2px;"><strong>[' + tokensNotFound.noValue[line] + ']</strong></ul>\n';
		}
	}
	const showCloseButton = true;
	const closeButtonText = 'Ok';
	const showOkButton = false;
	const okButtonText = null;
	const okButtonCallback = null;
	VV.Form.Global.MessageModal(false, modalTitle, modalBody, showCloseButton, showOkButton, okButtonText, okButtonCallback, closeButtonText);
};

// search and replace tokens on the Letter HTML
const SearchAndReplaceTokens = function () {
	const DataTokens = ParseDataTokens(); // gets data from data tab
	if (!DataTokens || DataTokens.length < 1) {
		return
	}

	const tokenRegex = new RegExp('\\[[^\\]]+\\]', 'g');
	//const tokenRegexBr = new RegExp('\\[[^\\]]+\\]<br>', 'g');
	let newLetterHTML = VV.Form.GetFieldValue('Letter HTML');

	let m;
	let tokens = [];

	while ((m = tokenRegex.exec(newLetterHTML)) !== null) {
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
					tokens.push({
						"regex": '\\[' + key + '\\]',
						"value": DataTokens[ldk][tokenName]
					});
					foundToken = true;
					break;
				}
			}
			if (!foundToken) {
				tokensNotFound.notExist.push(tokenName);
			}
		});
	}

	for (let token of tokens) {
		if (token.value != "") {
			newLetterHTML = newLetterHTML.replace(new RegExp(token.regex, 'g'), token.value);
		} else {
			if (typeof token === 'object') {
				tokensNotFound.noValue.push(token.regex.substring(2, token.regex.length - 2));
			} else {
				tokensNotFound.noValue.push(token);
			}

		}
	}

	VV.Form.SetFieldValue('Letter HTML', newLetterHTML, false);

	if (tokensNotFound.noValue.length > 0 || tokensNotFound.notExist.length > 0) {
		let messageModal = $('#ModalOuterDiv');
		// if message modal is not hidden, it is in the process of hiding; show after hidden
		if (messageModal.css('display') == 'none') {
			ShowTokenNotFoundModal();
		} else {
			messageModal.one('hidden.bs.modal', function () {
				ShowTokenNotFoundModal();
			});
		}
	}
};

// build and show confirmation modal
const modalTitle = 'Merge Data Tokens';
const modalBody = 'Do you want to replace  the tokens (items surrounded by square brackets) in the body of the letter?';
const showCloseButton = true;
const closeButtonText = 'Cancel';
const showOkButton = true;
const okButtonText = 'Ok';
const okButtonCallback = SearchAndReplaceTokens;
VV.Form.Global.MessageModal(false, modalTitle, modalBody, showCloseButton, showOkButton, okButtonText, okButtonCallback, closeButtonText);