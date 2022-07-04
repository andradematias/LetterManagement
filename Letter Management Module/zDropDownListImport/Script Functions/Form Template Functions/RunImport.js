console.log('OK1');

var ProcessServiceRequest = function () {
    var formFields = VV.Form.getFormDataCollection();

    var revisionID = {};
    revisionID.name = 'REVISIONID';
    revisionID.value = VV.Form.DataID;
    formFields.push(revisionID);

    var data = JSON.stringify(formFields);
    var requestObject = $.ajax({
        type: "POST",
        url: VV.BaseAppUrl + 'api/v1/' + VV.CustomerAlias + '/' + VV.CustomerDatabaseAlias + '/scripts?name=zDropDownBulkImport',
        contentType: "application/json; charset=utf-8",
        data: data,
        success: '',
        error: ''
    });

    return requestObject;
};

VV.Form.ShowLoadingPanel();

var wizardVal = parseInt(VV.Form.GetFieldValue('Wizard State'), 10);
var formValidationResults = true;
if (formValidationResults === true) {
    $.when(
        ProcessServiceRequest()
    ).always(function (resp) {
        console.log('OK2');
        console.log(JSON.stringify(resp));
        VV.Form.HideLoadingPanel();
        var confirmationMsg = '';
        if (typeof (resp.status) != 'undefined') {
            confirmationMsg = "A status code of " + resp.status + " returned from the server.  There is a communication problem with the  web servers.  If this continues, please contact the administrator and communicate to them this message and where it occured.";
            VV.Form.Global.DisplayMessaging(confirmationMsg);
            return false;
        }
        else if (typeof (resp.statusCode) != 'undefined') {
            confirmationMsg = "A status code of " + resp.statusCode + " with a message of '" + resp.errorMessages[0].message + "' returned from the server.  This may mean that the servers to run the business logic are not available.";
            VV.Form.Global.DisplayMessaging(confirmationMsg);
            return false;
        }
        else if (resp.meta.status == '200') {
            if (resp.data[0] != 'undefined') {
                if (resp.data[0] == 'Success') {
                    VV.Form.SetFieldValue('Wizard State', (wizardVal + 1));
                    // Set values, etc.
                    VV.Form.DoPostbackSave();
                }
                else if (resp.data[0] == 'Error') {
                    confirmationMsg = 'An error was encountered. ' + resp.data[1];
                    VV.Form.HideLoadingPanel();
                    VV.Form.Global.DisplayMessaging(confirmationMsg);
                    return false;
                }
                else {
                    confirmationMsg = 'An unhandled response occurred from the unique record checking mechanism.  The form will not save at this time.  Please try again or communicate this issue to support.';
                    VV.Form.HideLoadingPanel();
                    VV.Form.Global.DisplayMessaging(confirmationMsg);
                    return false;
                }
            }
            else {
                confirmationMsg = 'The status of the response returned as undefined.';
                VV.Form.HideLoadingPanel();
                VV.Form.Global.DisplayMessaging(confirmationMsg);
                return false;
            }
        }
        else {
            confirmationMsg = resp.data.error + '<br>';
            VV.Form.HideLoadingPanel();
            VV.Form.Global.DisplayMessaging(confirmationMsg);
            return false;
        }
    });
}
else {
    VV.Form.HideLoadingPanel();
    VV.Form.Global.DisplayMessaging('All of the fields have not been filled in completely or there is an issue with the range of the data entered. Highlight your mouse over the red icon to see how you can resolve the error stopping you from saving this form.')
}