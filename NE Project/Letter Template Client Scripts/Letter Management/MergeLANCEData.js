// MergeLANCEData for Letter Management - Does a search and replace on the tokens in the Letter HTML field for values on the LANCE Data tab.
var SignatureTokens = ['cmo signature', 'deputy director signature'];
var SignatureWidth = '200px';

// gets the JSON data from the LANCE Data tab and returns a new object with lowercase keys
var ParseLANCEData = function() {
	var LANCEDataText = VV.Form.GetFieldValue('Lance Data Tokens');
    
    var LANCEDataNormalized = {};
    var LANCEDataJSON = JSON.parse(LANCEDataText);
    for( var ldjKey in LANCEDataJSON ){
      if( LANCEDataJSON.hasOwnProperty(ldjKey)){
        var lowerCaseProps = {}
        for( var itemKey in LANCEDataJSON[ldjKey]) {
          if(LANCEDataJSON[ldjKey].hasOwnProperty(itemKey)){
            // make all of the keys lowercase to facilitate parsing
            lowerCaseProps[itemKey.toLowerCase()] = LANCEDataJSON[ldjKey][itemKey];
          }
        }
      }
      LANCEDataNormalized[ldjKey] = lowerCaseProps;
    }
    return LANCEDataNormalized;
};

var ShowTokenNotFoundModal = function() {
	var modalTitle = 'Tokens not found';
	var modalBody = 'Unable to replace all tokens on the letter\'s body because the corresponding information was not found in this context. Please make sure the wording of your token matches what is found in the LANCE Data tab.';
	var showCloseButton = true;
	var closeButtonText = 'Ok';
	var showOkButton = false;
	var okButtonText;
	var okButtonCallback = null;
	VV.Form.Global.MessageModal(false, modalTitle, modalBody, showCloseButton, showOkButton, okButtonText, okButtonCallback, closeButtonText);
};

// search and replace tokens on the Letter HTML
var SearchAndReplaceTokens = function() {
	var LANCEData = ParseLANCEData(); // gets data from data tab
	if (!LANCEData || LANCEData.length < 1) {
		return
	}

	const tokenRegex = new RegExp('\\[[^\\]]+\\]', 'g');
	//const tokenRegexBr = new RegExp('\\[[^\\]]+\\]<br>', 'g');
	var newLetterHTML = VV.Form.GetFieldValue('Letter HTML');

	let m;
	var tokens = [];
	var tokensNotFound = [];

	while ((m = tokenRegex.exec(newLetterHTML)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === tokenRegex.lastIndex) {
			tokenRegex.lastIndex++;
		}

		// The result can be accessed through the `m`-variable.
		m.forEach((match) => {
			let foundToken = false;

			var key = match.substring(1, match.length - 1);
			var tokenName = key.toLowerCase();

			for( var ldk in LANCEData ){
			  if(LANCEData[ldk][tokenName] !== undefined ){
			    if (LANCEData[ldk][tokenName].length == 0) {
                    tokens.push({
                        "regex": '\\[' + key + '\\]<br>',
                        "value": LANCEData[ldk][tokenName]
                    });
                }
                tokens.push({
                    "regex": '\\[' + key + '\\]',
                    "value": LANCEData[ldk][tokenName]
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
		newLetterHTML = newLetterHTML.replace(new RegExp(token.regex, 'g'), token.value);
	}

	VV.Form.SetFieldValue('Letter HTML', newLetterHTML, false);

	if (tokensNotFound.length > 0) {
		var messageModal = $('#ModalOuterDiv');
		// if message modal is not hidden, it is in the process of hiding; show after hidden
		if (messageModal.css('display') == 'none') {
			ShowTokenNotFoundModal();
		} else {
			messageModal.one('hidden.bs.modal', function() {
				ShowTokenNotFoundModal();
			});
		}
	}
};

// build and show confirmation modal
var modalTitle = 'Merge LANCE Data';
var modalBody = 'Do you want to replace the merge targets on the letter\'s body (items surrounded by square brackets) with LANCE Data?';
var showCloseButton = true;
var closeButtonText = 'Cancel';
var showOkButton = true;
var okButtonText = 'Ok';
var okButtonCallback = SearchAndReplaceTokens;
VV.Form.Global.MessageModal(false, modalTitle, modalBody, showCloseButton, showOkButton, okButtonText, okButtonCallback, closeButtonText);