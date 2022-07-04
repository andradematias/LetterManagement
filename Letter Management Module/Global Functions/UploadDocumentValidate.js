//UploadDocumentValidate for Global - Shows the Valid/Invalid document modal ("Review Documents" button)
const LUGroups = new Set(['License Coordinator', 'License Manager', 'License Processor', 'VaultAccess']);
const FinalAppStatuses = new Set(['Approved', 'Denied', 'Withdrawn, Application Closed', 'Incomplete']);
var showVerifyStatus = false;
var showValidInvalidButtons = false;
var isLUStaff = VV.Form.FormUserGroups.some(function (userGroup) {
    return LUGroups.has(userGroup);
});
var licenseApplicationID;
var applicationStatus;
var targetFormID;
var formID = VV.Form.GetFieldValue('Form ID');
if (formID.startsWith('LICAPP')) { // on License App
    targetFormID = 'self';
    licenseApplicationID = formID;
    applicationStatus = VV.Form.GetFieldValue('Status');
} else if (window.opener && window.opener.VV) { // opened through License App
    var parentFormID = window.opener.VV.Form.GetFieldValue('Form ID');
    if (parentFormID.startsWith('LICAPP')) {
        targetFormID = parentFormID;
        licenseApplicationID = parentFormID;
        applicationStatus = window.opener.VV.Form.GetFieldValue('Status');
    }
}

// options based on target form & security group
if (isLUStaff && licenseApplicationID) {
    showVerifyStatus = true;
    if (FinalAppStatuses.has(applicationStatus) == false) {
        // only show when application is not in a "final" status
        showValidInvalidButtons = true;
    }
} else if (isLUStaff) {
    showVerifyStatus = true;
    showValidInvalidButtons = true;
}

VV.Form.Global.UploadDocumentReview({
    targetFormID: targetFormID,
    showValidInvalidButtons: showValidInvalidButtons,
    showVerifyStatus: showVerifyStatus,
});