//FormValidation for the Letter Template Lookup Form

//pass in ControlName to validate a single item or nothing to validate everything.
var ErrorReporting = true;
var RunAll = false;
if (ControlName == null) {
    RunAll = true;
}

/*DISABLING FORM VALIDATION UNTIL GETATTRIBUTE NULL ISSUE CAN BE RESOLVED
if (ControlName == 'Send Select' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Send Select'), 'DDSelect') == false) {
        VV.Form.SetValidationErrorMessageOnField('Send Select', 'Select Item is not a valid option please pick either Digest or Immediate Send.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Send Select');
    }
}

if (ControlName == 'Send To Selector' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Send To Selector'), 'DDSelect') == false) {
        VV.Form.SetValidationErrorMessageOnField('Send To Selector', 'Select Item is not a valid option please pick an option.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Send To Selector');
    }
}

if (ControlName == 'Template Name' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Template Name'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Template Name', 'A value needs to be entered for the Template Name.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Template Name');
    }
}

if (ControlName == 'Subject Line' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Subject Line'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Subject Line', 'A value needs to be entered for the Subject Line.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Subject Line');
    }
}

if (ControlName == 'Body Text' || RunAll) {
    var body = VV.Form.GetFieldValue('Body Text');
    if (body == '<br>') {
        VV.Form.SetValidationErrorMessageOnField('Body Text', 'A value needs to be entered for the Body Text.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Body Text');
    }
}

if (ControlName == 'Send Select' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Send Select'), 'DDSelect') == false) {
        VV.Form.SetValidationErrorMessageOnField('Send Select', 'Select Item is not a valid option please pick either Digest or Immediate Send.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Send Select');
    }
}

if (ControlName == 'Send To Selector' || RunAll) {
    if (VV.Form.GetFieldValue('Send To Selector') == 'Send to email address listed in Send To:' && VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Send To'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Send To Selector', 'The Send To field is empty and needs a valid email address.');
        VV.Form.SetValidationErrorMessageOnField('Send To', 'The selected drop down requires a valid email in this field.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Send To Selector');
        VV.Form.ClearValidationErrorOnField('Send To');
    }
}

if (ControlName == 'Send CC Selector' || RunAll) {
    if (VV.Form.GetFieldValue('Send CC Selector') == 'Send to email address listed in CC:' && VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Send CC'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Send CC Selector', 'The CC field is empty and needs a valid email address.');
        VV.Form.SetValidationErrorMessageOnField('Send CC', 'The selected drop down requires a valid email in this field.');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Send CC Selector');
        VV.Form.ClearValidationErrorOnField('Send CC');
    }
}

if (ControlName == 'Send To' || RunAll) {
    if (!VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Send To'), 'Blank') == false) {
        var errorEmailTo = 0;
        var sendTo = VV.Form.GetFieldValue('Send To');
        sendTo.trim();
        var validateSendTo = sendTo.split(',');
        validateSendTo.forEach(function (tEmail) {
            if (VV.Form.Global.CentralValidation((tEmail), 'Email') == false) {
                errorEmailTo++;
                VV.Form.SetValidationErrorMessageOnField('Send To', 'One or more emails are invalid. Please enter valid email addresses in a coma seperated list.');
            }
        })
        if (errorEmailTo == 0) {
            VV.Form.ClearValidationErrorOnField('Send To');
            VV.Form.ClearValidationErrorOnField('Send To Selector');
        }
    }
}

if (ControlName == 'Send CC' || RunAll) {
    if (!VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Send CC'), 'Blank') == false) {
        var errorEmailCC = 0;
        var sendCC = VV.Form.GetFieldValue('Send CC');
        sendCC.trim();
        var validateSendCC = sendCC.split(',');
        validateSendCC.forEach(function (tEmailCC) {
            if (VV.Form.Global.CentralValidation((tEmailCC), 'Email') == false) {
                errorEmailCC++;
                VV.Form.SetValidationErrorMessageOnField('Send CC', 'One or more emails are invalid. Please enter valid email addresses in a coma seperated list.');
            }
        })
        if (errorEmailCC == 0) {
            VV.Form.ClearValidationErrorOnField('Send CC');
            VV.Form.ClearValidationErrorOnField('Send CC Selector');
        }
    }
}

*/
if (ControlName == 'Allow Email' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Allow Email'), 'DDSelect') == false) {
        VV.Form.SetValidationErrorMessageOnField('Allow Email', 'Please make a selection from the Allow Email dropdown');
        ErrorReporting = false;
    }
    else {
        VV.Form.ClearValidationErrorOnField('Allow Email');
    }
}


return ErrorReporting;