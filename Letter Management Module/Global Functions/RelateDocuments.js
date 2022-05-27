// RelateDocuments for Continuing Education
////Parameters: formID
VV.Form.DoAjaxFormSave(); // Save so there will be a form ID

const ScriptName = 'RelateDocuments';
const WebsvcName = 'LibRelateDocuments';
let FormID = formID; // This is a parameter because not all form ID fields are named the same
let LicenseAppID;
if (!FormID.includes('NUR-HOM-FAC-INFO')) {
    LicenseAppID = VV.Form.GetFieldValue('License Application ID');
} else {
    LicenseAppID = VV.Form.GetFieldValue('License ID');
}


const CallServerSide = function () {
    //This gets all of the form fields.
    let formData = [];
    formData.push(
        {
            name: 'REVISIONID',
            value: VV.Form.DataID // Form GUID
        },
        {
            name: 'License Application ID',
            value: LicenseAppID
        },
        {
            name: 'Individual ID',
            value: VV.Form.GetFieldValue('Individual ID')
        },
        {
            name: 'Form ID',
            value: FormID
        }
    );

    //Following will prepare the collection and send with call to server side script.
    const data = JSON.stringify(formData);
    const requestObject = $.ajax({
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
    let messageData = '';
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
                console.log(`Related to success`);
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