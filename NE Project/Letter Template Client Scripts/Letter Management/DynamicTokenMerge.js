// DynamicTokenMerge for Letter Management - Does a search and replace on the tokens in the Letter HTML field for values on the LANCE Data tab.
var tokenStr = VV.Form.GetFieldValue('Manual Tokens');
var tokens = tokenStr.match(/{.+?}/g);
var tokenValArr = []
// tokens.forEach(function(elem) {
//     var tokenText = elem.match(/{([^}]+)}/)[1]
//     let tokenVal = $('#' + tokenText).val();
//     console.log(tokenVal)
//     tokenValArr.push(tokenVal);
// })

for (i=0;i < tokens.length;i++) {
    var tokenText = tokens[i].match(/{([^}]+)}/)[1]
    let tokenVal = $(`#token${i+1}`).val();
    console.log(tokenVal)
    tokenValArr.push(tokenVal);
}

var MergeTokens = function() {
    console.log('starting merge')
    //console.log(tokens)
    //console.log(tokenValArr)
    var letterHTML = VV.Form.GetFieldValue('Letter HTML');
    var newLetterHTML = letterHTML;
    for(var i = 0; i < tokens.length; i++) {
        if( '' == tokenValArr[i]){ // If token is  blank and is followed by a new line, replace the newline to remove blank line.
          newLetterHTML = newLetterHTML.replace(new RegExp(tokens[i]+ '<br>', 'gi'), tokenValArr[i]);    
        } 
        newLetterHTML = newLetterHTML.replace(new RegExp(tokens[i], 'gi'), tokenValArr[i]);
        //console.log(newLetterHTML);
    }
    VV.Form.SetFieldValue('Letter HTML', newLetterHTML, false);
}

MergeTokens();
VV.Form.Template.MergeCancelModal();