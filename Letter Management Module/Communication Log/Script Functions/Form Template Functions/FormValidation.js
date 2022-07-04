// Form Validation for Communications Log as part of NEDHHS

/* FIELD NAME, VALIDATION TYPE, & EVENT

fieldName | validationType | event
Body | Blank | Blur
CC | Blank | Blur
Communication Date | Blank | Blur
Communication Type | DropDown | Blur
Email Recipients | Blank | Blur
Scheduled Date | TodayorAfter | Blur
Subject | Blank | Blur

*/

// Pass in ControlName to validate a single item or nothing to validate everything.
var ErrorReporting = true;

var RunAll = false;
if (ControlName == null) {
    RunAll = true;
}

var emailType = VV.Form.GetFieldValue('Email Type');
var emailImmediateSendOrDigest = VV.Form.getDropDownListText('Communication Type') == 'Email' && (emailType == 'Immediate Send' || emailType == 'Digest');


/*************************************
    BEGIN GENERATED VALIDATION CODE
**************************************/

//Body - Validate if email is 'Immediate Send' or 'Digest'; we do not want to send empty emails into the scheduled email process
if (ControlName == 'Email Body' || RunAll) {
    if (emailImmediateSendOrDigest && VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Email Body'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Email Body', 'Please complete the Body field.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Email Body');
    }
}
//CC - Validate if it is not blank; we do not want to send bad email addresses into the scheduled email process
if (ControlName == 'CC' || RunAll) {
    var ccRecipients = VV.Form.GetFieldValue('CC');
    var isBlank = VV.Form.Global.CentralValidation(ccRecipients, 'Blank') == false;
    if (isBlank == false && VV.Form.Global.CentralEmailValidation(ccRecipients) == false) {
        VV.Form.SetValidationErrorMessageOnField('CC', 'Please make sure you are supplying a valid list of comma-separated email addresses.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('CC');
    }
}
//Communication Date - Validate only if it is not an 'Immediate Send' or 'Digest' email (sendable). When the email is sendable, a user should not see this field as the scheduled email process updates it for them.
if (ControlName == 'Communication Date' || RunAll) {
    if (emailImmediateSendOrDigest == false && VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Communication Date'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Communication Date', 'The Communication Date must be chosen.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Communication Date');
    }
}
//Communication Type - DropDown must be selected.
if (ControlName == 'Communication Type' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Communication Type'), 'DDSelect') == false) {
        VV.Form.SetValidationErrorMessageOnField('Communication Type', 'Please make a selection from the Communication Type dropdown.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Communication Type');
    }
}
//Email Recipients - Validate if email is 'Immediate Send' or 'Digest' or if it is not blank; we do not want to send bad email addresses into the scheduled email process
if (ControlName == 'Email Recipients' || RunAll) {
    var emailRecipients = VV.Form.GetFieldValue('Email Recipients');
    var isBlank = VV.Form.Global.CentralValidation(emailRecipients, 'Blank') == false;
    if ((emailImmediateSendOrDigest || isBlank == false) && VV.Form.Global.CentralEmailValidation(emailRecipients) == false) {
        VV.Form.SetValidationErrorMessageOnField('Email Recipients', 'Please make sure you are supplying a valid list of comma-separated email addresses.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Email Recipients');
    }
}
//Scheduled Date - Date must be today or after today.
if (ControlName == 'Scheduled Date' || RunAll) {
    if (emailImmediateSendOrDigest && VV.Form.Global.CentralDateValidation(VV.Form.GetFieldValue('Scheduled Date'), 'TodayorAfter') == false) {
        VV.Form.SetValidationErrorMessageOnField('Scheduled Date', 'Scheduled Date must be today or after today.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Scheduled Date');
    }
}
//Subject - Field that must be completed.
if (ControlName == 'Subject' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Subject'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Subject', 'Please complete the Subject field.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Subject');
    }
}



return ErrorReporting;