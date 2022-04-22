//LetterManagementRetrieveUserInfo for Letter Management
const CallServerSide = function () {

    VV.Form.ShowLoadingPanel();
    //This gets all of the form fields.
    let formData = VV.Form.getFormDataCollection();

    let FormInfo = {};
    FormInfo.name = 'REVISIONID';
    FormInfo.value = VV.Form.DataID;
    formData.push(FormInfo);

    let UserInfo = {};
    UserInfo.name = 'USERID';
    UserInfo.value = VV.Form.FormUsID;
    formData.push(UserInfo);

    //Following will prepare the collection and send with call to server side script.
    const data = JSON.stringify(formData);
    const requestObject = $.ajax({
        type: "POST",
        url: VV.BaseAppUrl + 'api/v1/' + VV.CustomerAlias + '/' + VV.CustomerDatabaseAlias + '/scripts?name=LetterManagementRetrieveUserInfo',
        contentType: "application/json; charset=utf-8",
        data: data,
        success: '',
        error: ''
    });

    return requestObject;
};

VV.Form.ShowLoadingPanel();

$.when(
    CallServerSide()
).always(function (resp) {
    //console.log(resp);
    if ('' == VV.Form.GetFieldValue('Letter HTML')) {
        VV.Form.SetFieldValue('Letter HTML', VV.Form.GetFieldValue('Default Template Content'), false)
        VV.Form.SetFieldValue('Subject of Template', 'General Notification');
    }

    VV.Form.HideLoadingPanel();
    let messageData = '';
    if (typeof (resp.status) != 'undefined') {
        messageData = "A status code of " + resp.status + " returned from the server.  There is a communication problem with the  web servers.  If this continues, please contact the administrator and communicate to them this message and where it occurred.";
        VV.Form.Global.DisplayMessaging(messageData);
    }
    else if (typeof (resp.statusCode) != 'undefined') {
        messageData = "A status code of " + resp.statusCode + " with a message of '" + resp.errorMessages[0].message + "' returned from the server.  This may mean that the servers to run the business logic are not available.";
        VV.Form.Global.DisplayMessaging(messageData);
    }
    else if (resp.meta.status == '200') {
        if (resp.data[0] != 'undefined') {
            if (resp.data[0] == 'Success') {
                /*
                Legend:
                resp.data[1] = Array List of "State Staff", "Job Leadership" and "Individual Info" objects
                */

                //The tokens are already set using a template function that runs through the Array of objects that arrives from the Web service
                const tokens = VV.Form.Template.PopulateDataTokens(resp.data[1]);
                VV.Form.SetFieldValue('Formatted Data Tokens', tokens);

                //If the response contains an Email Recipient, set it in the corresponding field
                if (resp.data[1][3].value != "") {
                    VV.Form.SetFieldValue('Recipient Email', resp.data[1][3]["value"]);
                }

                //The tokens are set in this field in string format to be able to merge with the tokens of the letter
                VV.Form.SetFieldValue('Data Tokens', JSON.stringify(resp.data[1]));
            }
            else if (resp.data[0] == 'Error') {
                messageData = 'An error was encountered. ' + resp.data[1];
                VV.Form.HideLoadingPanel();
                //VV.Form.Global.DisplayMessaging(messageData);
                alert(messageData);
            }
            else {
                messageData = 'An unhandled response occurred when calling LetterManagementRetrieveUserInfo. The form will not save at this time.  Please try again or communicate this issue to support.';
                VV.Form.HideLoadingPanel();
                //VV.Form.Global.DisplayMessaging(messageData);
                alert(messageData);
            }
        }
        else {
            messageData = 'The status of the response returned as undefined.';
            VV.Form.HideLoadingPanel();
            //VV.Form.Global.DisplayMessaging(messageData);
            alert(messageData);
        }
    }
    else {
        messageData = "The following unhandled response occurred while attempting to retrieve data on the the server side get data logic." + resp.data.error + '<br>';
        VV.Form.HideLoadingPanel();
        //VV.Form.Global.DisplayMessaging(messageData);
        alert(messageData);
    }
});
