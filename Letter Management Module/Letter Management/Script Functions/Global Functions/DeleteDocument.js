/*
    Script Name:   DeleteDocument
    Customer:      VisualVault
    Purpose:       
    Parameters:    docID, docGUID
    Return Value:  
    Date of Dev:   
    Last Rev Date:
    Revision Notes:

*/
//ChecklistTaskDocumentsRetrieved for License Application
var CallServerSide = function () {

    VV.Form.ShowLoadingPanel();
    //This gets all of the form fields.
    var formData = VV.Form.getFormDataCollection();

    var FormInfo = {};
    FormInfo.name = 'DOCID';
    FormInfo.value = docID;
    formData.push(FormInfo);

    var FormInfo = {};
    FormInfo.name = 'DOCGUID';
    FormInfo.value = docGUID;
    formData.push(FormInfo);

    //Following will prepare the collection and send with call to server side script.
    var data = JSON.stringify(formData);
    var requestObject = $.ajax({
        type: "POST",
        url: VV.BaseAppUrl + 'api/v1/' + VV.CustomerAlias + '/' + VV.CustomerDatabaseAlias + '/scripts?name=LibDHHSDeleteDocument',
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
                $("#" + resp.data[2]).empty();
                alert('Document successfully deleted.')
                VV.Form.Global.DocumentCancelModal();
            }
            else if (resp.data[0] == 'Error') {
                messageData = 'An error was encountered. ' + resp.data[1];
                VV.Form.HideLoadingPanel();
                //VV.Form.Global.DisplayMessaging(messageData);
                alert(messageData);
            }
            else {
                messageData = 'An unhandled response occurred when calling ChecklistTaskDocumentsRetrieved. The form will not save at this time.  Please try again or communicate this issue to support.';
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