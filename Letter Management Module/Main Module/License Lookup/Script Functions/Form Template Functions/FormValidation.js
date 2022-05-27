// FormValidation for License Lookup

/* FIELD NAME, VALIDATION TYPE, & EVENT

fieldName | validationType | event
Date End | Blank | Blur
Date Start | Blank | Blur
License Category | DropDown | Blur
License Expiration Type | DropDown | Blur
License Name | Blank | Blur
Licensure Program | DropDown | Blur
Provisional License Duration | Number Only | Blur
Provisional License End Date | Blank | Blur
Provisional License Issuable | DropDown | Blur
*/

// Pass in ControlName to validate a single item or nothing to validate everything.
var ErrorReporting = true;

var RunAll = false;
if (ControlName == null) {
    RunAll = true;
}


/*************************************
    BEGIN GENERATED VALIDATION CODE
**************************************/

//Date End - Field that must be completed.
if (ControlName == 'Date End' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Date End'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Date End', 'The Date End must be chosen.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Date End');
    }
}
//Date Start - Field that must be completed.
if (ControlName == 'Date Start' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Date Start'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Date Start', 'The Date Start must be chosen.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Date Start');
    }
}
//License Category - DropDown must be selected.
if (ControlName == 'License Category' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.getDropDownListText('License Category'), 'DDSelect') == false) {
        VV.Form.SetValidationErrorMessageOnField('License Category', 'Please make a selection from the License Category dropdown.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('License Category');
    }
}
//License Expiration Type - DropDown must be selected.
if (ControlName == 'License Expiration Type' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.getDropDownListText('License Expiration Type'), 'DDSelect') == false) {
        VV.Form.SetValidationErrorMessageOnField('License Expiration Type', 'Please make a selection from the License Expiration Type dropdown.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('License Expiration Type');
    }
}
//License Name - Field that must be completed.
if (ControlName == 'License Name' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('License Name'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('License Name', 'Please complete the License Name field.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('License Name');
    }
}
//Licensure Program - DropDown must be selected.
if (ControlName == 'Licensure Program' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Licensure Program'), 'DDSelect') == false) {
        VV.Form.SetValidationErrorMessageOnField('Licensure Program', 'Please make a selection from the Licensure Program dropdown.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Licensure Program');
    }
}
//Provisional License Fields (Provisional License Duration, Provisional License End Date) - Fields that must have a valid value in one but not both fields
var provisionalLicenseIssuable = VV.Form.GetFieldValue('Provisional License Issuable');
if (ControlName == 'Provisional License Fields' || RunAll) {
    var provisionalLicenseDuration = VV.Form.GetFieldValue('Provisional License Duration');
    var provisionalLicenseEndDate = VV.Form.GetFieldValue('Provisional License End Date');
    var durationValid = VV.Form.Global.CentralValidation(provisionalLicenseDuration, 'NumberOnly') && parseFloat(provisionalLicenseDuration) > 0;
    var endDateValid = VV.Form.Global.CentralValidation(provisionalLicenseEndDate, 'Blank');
    var errorMessage = 'Only a duration or an end date can be entered for a provisional license, not both.';

    if (provisionalLicenseIssuable == 'Yes' && (durationValid && endDateValid)) {
        VV.Form.SetValidationErrorMessageOnField('Provisional License Duration', errorMessage);
        VV.Form.SetValidationErrorMessageOnField('Provisional License End Date', errorMessage);
        ErrorReporting = false;
    } else if (provisionalLicenseIssuable == 'Yes' && (durationValid == false && endDateValid == false)) {
        VV.Form.SetValidationErrorMessageOnField('Provisional License Duration', 'A whole number greater than zero must be entered for Provisional License Duration. ' + errorMessage);
        VV.Form.SetValidationErrorMessageOnField('Provisional License End Date', 'The Provisional License End Date must be chosen. ' + errorMessage);
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Provisional License Duration');
        VV.Form.ClearValidationErrorOnField('Provisional License End Date');
    }

}
//Provisional License Issuable - DropDown must be selected.
if (ControlName == 'Provisional License Issuable' || RunAll) {
    if (VV.Form.Global.CentralValidation(provisionalLicenseIssuable, 'DDSelect') == false) {
        VV.Form.SetValidationErrorMessageOnField('Provisional License Issuable', 'Please make a selection from the Provisional License Issuable dropdown.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Provisional License Issuable');
    }
}

return ErrorReporting;