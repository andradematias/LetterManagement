//RelateToLetterManagement for Letter Management

const CallServerSide = function () {

    VV.Form.ShowLoadingPanel();
    //This gets all of the form fields.
    let formData = VV.Form.getFormDataCollection();

    let FormInfo = {};
    FormInfo.name = 'REVISIONID';
    FormInfo.value = VV.Form.DataID;
    formData.push(FormInfo);
    console.log(formData);

    //Following will prepare the collection and send with call to server side script.
    const data = JSON.stringify(formData);
    const requestObject = $.ajax({
        type: "POST",
        url: VV.BaseAppUrl + 'api/v1/' + VV.CustomerAlias + '/' + VV.CustomerDatabaseAlias + '/scripts?name=LetterManagementRelateToLetterManagement',
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
    console.log(resp);
    VV.Form.HideLoadingPanel();
    let messageData = '';
    if (typeof (resp.status) != 'undefined') {
        messageData = "A status code of " + resp.status + " returned from the server.  There is a communication problem with the  web servers.  If this continues, please contact the administrator and communicate to them this message and where it occurred.";
        alert(messageData);
        console.log(messageData)
    }
    else if (typeof (resp.statusCode) != 'undefined') {
        messageData = "A status code of " + resp.statusCode + " with a message of '" + resp.errorMessages[0].message + "' returned from the server.  This may mean that the servers to run the business logic are not available.";
        alert(messageData);
        console.log(messageData)
    }
    else if (resp.meta.status == '200') {
        if (resp.data[0] != 'undefined') {
            if (resp.data[0] == 'Success') {
                console.log(resp.data[2]);
                // VV.Form.DoAjaxFormSave();
                // alert('The record has been saved.')
                //Modal message to communicate that relation was successful
                //BuildIt,ModalTitle,ModalBody,ShowCloseButton,ShowOkButton,OkButtonTitle,OkButtonCallback,CloseButtonText,ThirdButton,ThirdButtonText,ThirdButtonCallback
                VV.Form.Global.MessageModal(false, 'Records Related', "This form has been related to relevant records, and the form has been saved.", false, true, 'Ok', null);
            }
            else if (resp.data[0] == 'Error') {
                messageData = `An error was encountered. ${resp.data[1]}`;
                VV.Form.HideLoadingPanel();
                VV.Form.Global.MessageModal(false, 'Record Relation Error', messageData, false, true, 'Ok', null);
            }
            else {
                messageData = 'An unhandled response occurred when attempting to relate this form to relevant records. The form will not save at this time.  Please try again or communicate this issue to support.';
                VV.Form.HideLoadingPanel();
                VV.Form.Global.MessageModal(false, 'Record Relation Error', messageData, false, true, 'Ok', null);
            }
        }
        else {
            messageData = 'The status of the response returned as undefined.';
            VV.Form.HideLoadingPanel();
            alert(messageData);
        }
    }
    else {
        messageData = "The following unhandled response occurred while attempting to retrieve data on the the server side get data logic." + resp.data.error + '<br>';
        VV.Form.HideLoadingPanel();
        alert(messageData);
    }
});