// DocumentVerified for Global - Verifies a document and updates the UploadDocumentValidate modal. Note: You must define a websvc depending on the context as each may perform slightly different actions
// Parameters: DocumentID, DocGUID
var ScriptName = 'DocumentVerified';
var WebsvcName;
var formPrefix = VV.Form.Global.GetFormPrefix(VV.Form.GetFieldValue('Form ID'));
if (formPrefix == 'TASK') {
    WebsvcName = 'ChecklistTaskDocumentVerified';
} else if (formPrefix == 'LICAPP') {
    WebsvcName = 'LicenseApplicationDocumentVerified';
} else if (formPrefix == 'INFO-CHANGE-REQUEST') {
    WebsvcName = 'InformationChangeRequestDocumentVerified';
} else {
    var errMsg = 'Cannot find document verify webservice for this form template!';
    alert(errMsg);
    throw new Error(errMsg);
}
var CallServerSide = function () {
    //This gets all of the form fields.
    VV.Form.ShowLoadingPanel();
    var formData = VV.Form.getFormDataCollection();

    var FormInfo = {};
    FormInfo.name = 'REVISIONID';
    FormInfo.value = VV.Form.DataID;
    formData.push(FormInfo);

    var FormInfo = {};
    FormInfo.name = 'Document ID';
    FormInfo.value = DocumentID;
    formData.push(FormInfo);

    var FormInfo = {};
    FormInfo.name = 'Document GUID';
    FormInfo.value = DocGUID;
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

$.when(CallServerSide()).always(function (resp) {
    VV.Form.HideLoadingPanel();
    var messageData = '';
    if (typeof (resp.status) != 'undefined') {
        messageData = "A status code of " + resp.status + " returned from the server. There is a communication problem with the web servers. If this continues, please contact the administrator and communicate to them this message and where it occurred.";
        console.error(ScriptName + ': ' + messageData);
        alert(messageData);
    }
    else if (typeof (resp.statusCode) != 'undefined') {
        messageData = "A status code of " + resp.statusCode + " with a message of '" + resp.errorMessages[0].message + "' returned from the server. This may mean that the servers to run the business logic are not available.";
        console.error(ScriptName + ': ' + messageData);
        alert(messageData);
    }
    else if (resp.meta.status == '200') {
        if (resp.data[0] != 'undefined') {
            if (resp.data[0] == 'Success') {
                $("#verif" + resp.data[2]).css("color", "green").html("Verified"); // set verified label
                $("#valid" + resp.data[2]).css("opacity", ".5").prop("disabled", true); // disable valid button
                alert('Document verified.');
            }
            else if (resp.data[0] == 'Error') {
                messageData = 'An error was encountered. ' + resp.data[1];
                console.error(ScriptName + ': ' + messageData);
                alert(messageData);
            }
            else {
                messageData = 'An unhandled response occurred when calling ' + WebsvcName + '. The form will not save at this time. Please try again or communicate this issue to support.';
                console.error(ScriptName + ': ' + messageData);
                alert(messageData);
            }
        }
        else {
            messageData = 'The status of the response returned as undefined.';
            console.error(ScriptName + ': ' + messageData);
            alert(messageData);
        }
    }
    else {
        messageData = "The following unhandled response occurred while attempting to retrieve data from " + WebsvcName + resp.data.error;
        console.error(ScriptName + ': ' + messageData);
        alert(messageData);
    }
});