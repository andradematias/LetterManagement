

function GetTokenValByName(tokenName){

    var tokenValue = '';

    try {
        var tokenStr = VV.Form.GetFieldValue('Manual Tokens');
        var tokens = tokenStr.match(/{.+?}/g);
        var tokenValArr = []


        for (i = 0; i < tokens.length; i++) {
            var tokenText = tokens[i].match(/{([^}]+)}/)[1]
            let tokenVal = $(`#token${i + 1}`).val();
            console.log(tokenVal)
            tokenValArr.push(tokenVal);
        }

        var tokenIndex = tokens.indexOf(tokenName);



        if (tokenIndex > -1) {
            tokenValue = tokenValArr[tokenIndex];
        }

    } catch (err) {
        console.log(err);
        return '';
    }

    return tokenValue;
    
}