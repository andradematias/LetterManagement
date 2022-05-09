//UploadDocumentReview for Global - Modal that shows documents and lets us perform several actions based on the Options. Requires Global.DocumentCreateModal to be setup on load

/* Options - Extend these when needed to control modal appearance and functionality */
const showRemoveButton = Options?.showRemoveButton;
const showValidInvalidButtons = Options?.showValidInvalidButtons;
const showVerifyStatus = Options?.showVerifyStatus;
let targetFormID = Options?.targetFormID;
if (typeof targetFormID != "string" || targetFormID.includes("-") == false) {
    targetFormID = "self";
}

// modal to prevent getting documents for an invalid form DataID
if (targetFormID == "self" && VV.Form.IsFormSaved == false) {
    const modalTitle = "Save to View Documents";
    const modalBody =
        'Please "Save" the form in order to view the uploaded documents.';
    const showOkButton = false;
    const okButtonTitle = "";
    const okButtonCallback = null;
    const showThirdButton = false;
    const thirdButtonTitle = "";
    const thirdButtonCallback = null;
    const showCloseButton = true;
    const closeButtonTitle = "Ok";
    VV.Form.Global.MessageModal(
        false,
        modalTitle,
        modalBody,
        showCloseButton,
        showOkButton,
        okButtonTitle,
        okButtonCallback,
        closeButtonTitle,
        showThirdButton,
        thirdButtonTitle,
        thirdButtonCallback
    );
}

const CallServerSide = function () {
    VV.Form.ShowLoadingPanel();
    //This gets all of the form fields.
    let formData = VV.Form.getFormDataCollection();

    // Add data to formData
    formData.push(
        {
            name: "REVISIONID",
            value: VV.Form.DataID,
        },
        {
            name: "Target Form ID",
            value: targetFormID,
        }
    );

    let data = JSON.stringify(formData);
    let requestObject = $.ajax({
        type: "POST",
        url:
            VV.BaseAppUrl +
            "api/v1/" +
            VV.CustomerAlias +
            "/" +
            VV.CustomerDatabaseAlias +
            "/scripts?name=LibUploadDocumentReview",
        contentType: "application/json; charset=utf-8",
        data: data,
        success: "",
        error: "",
    });

    return requestObject;
};

console.log(`getting documents related to ${targetFormID}`);
$.when(CallServerSide()).always(function (resp) {
    console.log(resp);
    VV.Form.HideLoadingPanel();
    let messageData = "";
    if (typeof resp.status != "undefined") {
        messageData =
            "A status code of " +
            resp.status +
            " returned from the server.  There is a communication problem with the  web servers.  If this continues, please contact the administrator and communicate to them this message and where it occurred.";
        VV.Form.Global.DisplayMessaging(messageData);
    } else if (typeof resp.statusCode != "undefined") {
        messageData =
            "A status code of " +
            resp.statusCode +
            " with a message of '" +
            resp.errorMessages[0].message +
            "' returned from the server.  This may mean that the servers to run the business logic are not available.";
        VV.Form.Global.DisplayMessaging(messageData);
    } else if (resp.meta.status == "200") {
        if (resp.data[0] != "undefined") {
            if (resp.data[0] == "Success") {
                // Show different instructions based on button visibility/documents found
                let documentsFound = resp.data[2];
                let instructions =
                    'Review uploaded documents by clicking the "Open" button. ';
                if (documentsFound.length < 1) {
                    instructions =
                        "No documents were found related to the current form. Please upload a document to see it in this list.";
                } else if (showValidInvalidButtons) {
                    instructions =
                        'Please verify the related documents by clicking the corresponding "Valid" or "Invalid" button. ';
                } else if (showRemoveButton) {
                    instructions +=
                        'Remove any unwanted documents by clicking the "Remove File" button. ';
                }
                $("#documentMessageArea").append(
                    $(`<p class="documentUserMessage">${instructions}</p>`)
                );

                // Add styling so scroll bar shows on overflow
                let mainContent = $("#documentButtonArea");
                mainContent.css({
                    "max-height": "512px",
                    "overflow-y": "auto",
                });

                // Build table
                const documentsTable = $('<table style="width:100%;">');
                documentsFound.forEach(function (doc) {
                    const docID = doc.documentId.trim();
                    const docGUID = doc.id.trim();
                    const docURL = VV.BaseURL + "documentviewer?&hidemenu=true&dhid=" + docGUID;
                    let docName = doc.description.trim();
                    docName = docName ? docName : "Unknown";
                    let docUploadDate = doc.createDate.split("T")[0];
                    docUploadDate = docUploadDate ? docUploadDate : "Unknown";
                    let docType = doc["checklist task document type"]?.trim();
                    docType = docType ? docType : "Unknown";
                    const padbot = "18px"; // spacing between each row

                    /* verify status */
                    let verifTextID = "verif" + docID;
                    let verifColor = "#f70606";
                    let verifLabel = "Unverified";
                    let validBtnID = "valid" + docID;
                    let validBtnDisabled = "";
                    let validBtnOpacity = "1";
                    if (doc["document verified"] == "Yes") {
                        verifColor = "green";
                        verifLabel = "Verified";
                        validBtnDisabled = "disabled";
                        validBtnOpacity = ".5";
                    }
                    let verifyStatusHTML = "";
                    if (showVerifyStatus) {
                        verifyStatusHTML += `<span id="${verifTextID}" style="color:${verifColor};">${verifLabel}</span><b>  |  </b>`;
                    }

                    /* buttons */
                    let buttonHTML = "";
                    if (showValidInvalidButtons) {
                        buttonHTML = `<button id="${validBtnID}" onclick="VV.Form.Global.DocumentVerified('${docID}', '${docGUID}')" class="btn btn-primary" style="background-color:#2296f3;border-radius:25px; border:none; opacity: ${validBtnOpacity}" ${validBtnDisabled}>Valid</button>
                        <button onclick="VV.Form.Global.DocumentUnrelate('${docID}', '${docGUID}')" class="btn btn-primary" style="background-color:#2296f3;border-radius:25px;border:none;margin:4px 0px;">Invalid</button>`;
                    } else if (showRemoveButton) {
                        buttonHTML = `<button onclick="VV.Form.Global.DeleteDocument('${docID}', '${docGUID}')" class="btn btn-primary" style="background-color:#2296f3;border-radius:25px;border:none;margin:4px 0px;">Remove File</button>`;
                    }

                    /* build row */
                    $(`<tr>
                            <td style="padding-bottom:${padbot};text-align:center;width:17%;">
                                <a class="btn btn-primary" style="background-color:#2296f3;border-radius:25px; border:none" href="${docURL}" target="_blank">Open</a>
                            </td>
                            <td style="padding-bottom:${padbot};">
                                <div>Document Type: ${docType}</div>
                                <div>File Name: ${docName}</div>
                                <div>
                                    ${verifyStatusHTML}
                                    <span>Upload Date: ${docUploadDate}</span>
                                </div>
                            </td>
                            <td style="padding-bottom:${padbot};">
                                <div style="float:right;text-align:center;padding:0px 4px;">${buttonHTML}</div>
                            </td>
                        </tr>`).appendTo(documentsTable);
                });
                mainContent.append(documentsTable);

                // Display modal. The modal itself has buttons to submit or close.
                $("#documentModal").modal({ backdrop: "static", keyboard: false });
            } else if (resp.data[0] == "Error") {
                messageData = "An error was encountered. " + resp.data[1];
                //VV.Form.Global.DisplayMessaging(messageData);
                alert(messageData);
            } else {
                messageData =
                    "An unhandled response occurred when calling ChecklistTaskDocumentsRetrieved. The form will not save at this time.  Please try again or communicate this issue to support.";
                //VV.Form.Global.DisplayMessaging(messageData);
                alert(messageData);
            }
        } else {
            messageData = "The status of the response returned as undefined.";
            //VV.Form.Global.DisplayMessaging(messageData);
            alert(messageData);
        }
    } else {
        messageData =
            "The following unhandled response occurred while attempting to retrieve data on the the server side get data logic." +
            resp.data.error +
            "<br>";
        //VV.Form.Global.DisplayMessaging(messageData);
        alert(messageData);
    }
});
