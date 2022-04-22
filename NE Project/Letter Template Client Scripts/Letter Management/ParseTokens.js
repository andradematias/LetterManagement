
var inputText = ''; //parameter name

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

// search and replace tokens on the input string
var SearchAndReplaceTokens = function() {
	var LANCEData = ParseLANCEData(); // gets data from data tab
	if (!LANCEData || LANCEData.length < 1) {
		return
	}

	const tokenRegex = new RegExp('\\[[^\\]]+\\]', 'g');
		
	let m;
	var tokens = [];
	var tokensNotFound = [];

	while ((m = tokenRegex.exec(inputText)) !== null) {
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
		inputText = inputText.replace(new RegExp(token.regex, 'g'), token.value);
	}	

};

SearchAndReplaceTokens();

return inputText;

