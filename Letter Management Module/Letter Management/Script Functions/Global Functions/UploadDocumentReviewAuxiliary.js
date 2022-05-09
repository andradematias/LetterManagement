// UploadDocumentReviewAuxiliary for Global - Controls functionality of UploadDocumentReview for the License Application's auxiliary forms based on if the application is submitted and user groups
// Forms affected: Certification, Continuing Education, Conviction Information, "Degree, Experience and Educational Content", Education History, Exam Results, Other Licenses, Provisional Nursing Home Information, Training
const LUGroups = new Set(['License Coordinator', 'License Manager', 'License Processor', 'VaultAccess']);
const InProcessAppStatuses = new Set(['New', 'Staff Entry', 'Waiting Applicant Action']);
var showRemoveButton = false;
var showVerifyStatus = false;
var isLUStaff = VV.Form.FormUserGroups.some(function (userGroup) {
    return LUGroups.has(userGroup);
});
var applicationSubmitted = false; // updated by LicenseApplicationAuxiliaryReadOnly
try {
    applicationSubmitted = VV.Form.GetFieldValue('Application Submitted').toLowerCase() == 'true';
} catch (e) {
    console.warn('Could not read field "Application Submitted". This form may not be picked up by LicenseApplicationAuxiliaryReadOnly');
}
var licenseApplicationID;
if (window.opener && window.opener.VV) {
    var parentFormID = window.opener.VV.Form.GetFieldValue('Form ID');
    if (parentFormID.startsWith('LICAPP')) {
        licenseApplicationID = parentFormID;
    }
}

// options based on target form & security group
if (licenseApplicationID) {
    var applicationStatus = window.opener.VV.Form.GetFieldValue('Status');

    if (isLUStaff) {
        showVerifyStatus = true; // only LU sees doc status
    } else if (isLUStaff == false && applicationSubmitted == false && InProcessAppStatuses.has(applicationStatus)) {
        showRemoveButton = true; // show button for applicants when the application is still editable
    }
}

VV.Form.Global.UploadDocumentReview({
    targetFormID: licenseApplicationID,
    showRemoveButton: showRemoveButton,
    showVerifyStatus: showVerifyStatus,
});