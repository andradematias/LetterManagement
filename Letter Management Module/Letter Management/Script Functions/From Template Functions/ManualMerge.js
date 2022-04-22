//VV.Form.Template.ManualMerge()
//Functionality:  Take the values of the "Manual Tokens" field, create the input fields and display the modal.
//Parameters:

const tokenStr = VV.Form.GetFieldValue('Manual Tokens');
const tokens = tokenStr.match(/{.+?}/g);
let mergeMessageArea = '<p class="mergeUserMessage">For each item in the list below, enter the value that should be present in the generated letter. An empty entry will replace the token with an empty value leaving it blank.</p > ';

// Populate modal
$(mergeMessageArea).appendTo('#mergeMessageArea');

//For each token, it will insert an input text. The value of the ID will be the name of the token.
for (let i = 0; i < tokens.length; i++) {
    let tokenText = tokens[i].match(/{([^}]+)}/)[1];

    $(`<p id="${tokenText}" style="margin-bottom: 18px;"><label for="fname">${tokenText}: </label>
                    <input type="text" id="token${i + 1}" name="fname" style="float:right;clear:both"></p>`
    ).appendTo('#mergeButtonArea');
}

// Display modal. The modal itself has buttons to submit or cancel.
$('#mergeModal').modal({ backdrop: 'static', keyboard: false });