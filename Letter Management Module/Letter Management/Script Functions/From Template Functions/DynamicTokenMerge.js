// DynamicTokenMerge for Letter Management - Does a search and replace on the tokens in the Letter HTML field for values on the LANCE Data tab.
const tokenStr = VV.Form.GetFieldValue('Manual Tokens');
let tokens = tokenStr.match(/{.+?}/g);
let tokenValArr = [];
let emptyTokens = "";

for (let i = 0; i < tokens.length; i++) {
    let tokenVal = $(`#token${i + 1}`).val();
    console.log(tokenVal)
    tokenValArr.push(tokenVal);
}

const MergeTokens = function () {
    console.log('starting merge')
    let newLetterHTML = VV.Form.GetFieldValue('Letter HTML');

    for (let i = 0; i < tokens.length; i++) {
        if (emptyTokens === '' && tokenValArr[i].trim() === '')
            emptyTokens += "<p>The following tokens were not replaced as they have no value:</p>";

        if ('' !== tokenValArr[i].trim())  // If the token is blank, the change is not made.
            newLetterHTML = newLetterHTML.replace(new RegExp(tokens[i], 'gi'), tokenValArr[i]);
        else
            emptyTokens += "<p><b>" + tokens[i] + "</b></p>";

    }
    VV.Form.SetFieldValue('Letter HTML', newLetterHTML, false);

    if (emptyTokens !== '') {
        emptyTokens += "<p>If the tokens were added without value on purpose, you need to remove the token manually in the card field.</p>";
        VV.Form.Global.DisplayMessaging(emptyTokens, "Set Dynamic Values");
    }
}

MergeTokens();
VV.Form.Template.MergeCancelModal();