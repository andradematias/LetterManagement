//LetterManagementRetrieveUserInfo for Letter Management
var CallServerSide = function () {

    VV.Form.ShowLoadingPanel();
    //This gets all of the form fields.
    var formData = VV.Form.getFormDataCollection();

    var FormInfo = {};
    FormInfo.name = 'REVISIONID';
    FormInfo.value = VV.Form.DataID;
    formData.push(FormInfo);

    var FormInfo = {};
    FormInfo.name = 'USERID';
    FormInfo.value = VV.Form.FormUsID;
    formData.push(FormInfo);

    var URLInfo = {};
    URLInfo.name = 'baseURL';
    URLInfo.value = VV.BaseURL;
    formData.push(URLInfo);

    //Following will prepare the collection and send with call to server side script.
    var data = JSON.stringify(formData);
    var requestObject = $.ajax({
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
        VV.Form.SetFieldValue('Subject of Template', 'General Notification from Nebraska Licensure');
    }

    VV.Form.HideLoadingPanel();
    var messageData = '';
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
                resp.data[2] = Formatted token list for display to use
                resp.data[3] = Recipient Email
                resp.data[4] - resp.data[n] = Lookup data based on context of letter management call
                */

                let lanceDataTokens = {} //Repository for related form JSON Data
                VV.Form.SetFieldValue('Formatted Lance Data Tokens', resp.data[2]);
                VV.Form.SetFieldValue('Recipient Email', resp.data[3]);

                //iterating through data records to add if they are populated
                //Formatting dates for human readable format
                let regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?/i;
                for (var i = 4, j = 0; i < resp.data.length; i++) {
                    if (resp.data[i]) {
                        lanceDataTokens[j] = {};
                        Object.keys(resp.data[i]).forEach(
                            key => lanceDataTokens[j][key] = 
                            regex.test(resp.data[i][key]) ? 
                                `${resp.data[i][key].substring(5,7)}/${resp.data[i][key].substring(8,10)}/${resp.data[i][key].substring(0,4)}`
                                : resp.data[i][key] );
                        j++;
                    }
                }

                if (!VV.Form.IsFormSaved || VV.Form.GetFieldValue('Template List') == '' || VV.Form.GetFieldValue('Template List') == 'Select Item') {
                    VV.Form.SetFieldValue('Lance Data Tokens', JSON.stringify(lanceDataTokens));
                }
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
