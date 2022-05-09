// RelateDocuments for Continuing Education
VV.Form.DoAjaxFormSave(); // Save so there will be a form ID

var ScriptName = 'RelateDocuments';
var WebsvcName = 'LibRelateDocuments';
var FormID = formID; // This is a parameter because not all form ID fields are named the same
let LicenseAppID;
if (!FormID.includes('NUR-HOM-FAC-INFO')) {
    LicenseAppID = VV.Form.GetFieldValue('License Application ID');
} else {
    LicenseAppID = VV.Form.GetFieldValue('License ID');
}


var CallServerSide = function () {
    //This gets all of the form fields.
    var formData = [];

    var FormInfo = {};
    FormInfo.name = 'REVISIONID';
    FormInfo.value = VV.Form.DataID; // Form GUID
    formData.push(FormInfo);

    var FormInfo = {};
    FormInfo.name = 'License Application ID';
    FormInfo.value = LicenseAppID;
    formData.push(FormInfo);

    var FormInfo = {};
    FormInfo.name = 'Individual ID';
    FormInfo.value = VV.Form.GetFieldValue('Individual ID');
    formData.push(FormInfo);

    var FormInfo = {};
    FormInfo.name = 'Form ID';
    FormInfo.value = formID;
    formData.push(FormInfo);

    //Following will prepare the collection and send with call to server side script.
    var data = JSON.stringify(formData);
    var requestObject = $.ajax({
        type: "POST",
        url: VV.BaseAppUrl + 'api/v1/' + VV.CustomerAlias + '/' + VV.CustomerDatabaseAlias +
            '/scripts?name=' + WebsvcName,
        contentType: "application/json; charset=utf-8",
        data: data,
        success: '',
        error: ''
    });

    return requestObject;
};

$.when(
    CallServerSide()
).always(function (resp) {
    var messageData = '';
    if (typeof (resp.status) != 'undefined') {
        messageData = "A status code of " + resp.status + " returned from the server. There is a communication problem with the web servers. If this continues, please contact the administrator and communicate to them this message and where it occurred.";
        console.error(ScriptName + ': ' + messageData);
    }
    else if (typeof (resp.statusCode) != 'undefined') {
        messageData = "A status code of " + resp.statusCode + " with a message of '" + resp.errorMessages[0].message + "' returned from the server. This may mean that the servers to run the business logic are not available.";
        console.error(ScriptName + ': ' + messageData);
    }
    else if (resp.meta.status == '200') {
        if (resp.data[0] != 'undefined') {
            if (resp.data[0] == 'Success') {

            }
            else if (resp.data[0] == 'Error') {
                messageData = 'An error was encountered. ' + resp.data[1];
                console.error(ScriptName + ': ' + messageData);
            }
            else {
                messageData = 'An unhandled response occurred when calling ' + WebsvcName + '. The form will not save at this time. Please try again or communicate this issue to support.';
                console.error(ScriptName + ': ' + messageData);
            }
        }
        else {
            messageData = 'The status of the response returned as undefined.';
            console.error(ScriptName + ': ' + messageData);
        }
    }
    else {
        messageData = "The following unhandled response occurred while attempting to retrieve data from " + WebsvcName + resp.data.error;
        console.error(ScriptName + ': ' + messageData);
    }
});