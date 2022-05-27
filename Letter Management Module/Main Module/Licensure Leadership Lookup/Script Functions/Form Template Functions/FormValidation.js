// Form Validation 

/* FIELD NAME, VALIDATION TYPE, & EVENT

fieldName | validationType | event
Country | Dropdown | Blur
City | Blank | Blur
County | DropDown | Blur
First Name | Blank | Blur
Last Name | Blank | Blur
State | DropDown | Blur
Street | Blank | Blur
Zip Code | Zip Required | Blur
*/

// Pass in ControlName to validate a single item or nothing to validate everything.
var ErrorReporting = true;

var RunAll = false;
if (ControlName == null) {
    RunAll = true;
}

// used to determine whether to run validation on city, state, zip, county
var CountryIsUSorCA = VV.Form.GetDropDownListItemValue('Country') == 'US' || VV.Form.GetDropDownListItemValue('Country') == 'CA';

/*************************************
    BEGIN GENERATED VALIDATION CODE
**************************************/
//Country - DropDown must be selected.
if (ControlName == 'Country' || RunAll) {
    var isSelectItem = VV.Form.Global.CentralValidation(VV.Form.getDropDownListText('Country'), 'DDSelect') == false;
    var isBlank = VV.Form.Global.CentralValidation(VV.Form.getDropDownListText('Country'), 'Blank') == false; /* added as a workaround to getddtext occasionally returning empty string - 7/14/2021 */
    if (isSelectItem || isBlank) {
        VV.Form.SetValidationErrorMessageOnField('Country', 'Please make a selection from the Country dropdown.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Country');
    }
}
//City - Field that must be completed.
if (CountryIsUSorCA) {
    if (ControlName == 'City' || RunAll) {
        if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('City'), 'Blank') == false) {
            VV.Form.SetValidationErrorMessageOnField('City', 'Please complete the City field.');
            ErrorReporting = false;
        } else {
            VV.Form.ClearValidationErrorOnField('City');
        }
    }
} else {
    VV.Form.ClearValidationErrorOnField('City');
}
//County - DropDown must be selected.
if (CountryIsUSorCA && VV.Form.GetFieldValue('State') == 'NE') {
    if (ControlName == 'County' || RunAll) {
        if (VV.Form.Global.CentralValidation(VV.Form.getDropDownListText('County'), 'DDSelect') == false) {
            VV.Form.SetValidationErrorMessageOnField('County', 'Please make a selection from the County dropdown.');
            ErrorReporting = false;
        } else {
            VV.Form.ClearValidationErrorOnField('County');
        }
    }
} else {
    VV.Form.ClearValidationErrorOnField('County');
}
//State - DropDown must be selected.
if (CountryIsUSorCA) {
    if (ControlName == 'State' || RunAll) {
        var stateLabel = '';
        if (VV.Form.GetDropDownListItemValue('Country') == 'CA') {
            stateLabel = 'Province';
        } else {
            stateLabel = 'State';
        }

        var isSelectItem = VV.Form.Global.CentralValidation(VV.Form.getDropDownListText('State'), 'DDSelect') == false;
        var isBlank = VV.Form.Global.CentralValidation(VV.Form.getDropDownListText('State'), 'Blank') == false; /* added as a workaround to getddtext occasionally returning empty string - 7/14/2021 */
        if (isSelectItem || isBlank) {
            VV.Form.SetValidationErrorMessageOnField('State', 'Please make a selection from the ' + stateLabel + ' dropdown.');
            ErrorReporting = false;
        } else {
            VV.Form.ClearValidationErrorOnField('State');
        }
    }
} else {
    VV.Form.ClearValidationErrorOnField('State');
}
//Street - Field that must be completed.
if (ControlName == 'Street' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Street'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Street', 'Please complete Address Line 1.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Street');
    }
}
//Zip Code - Field that must be completed.
if (CountryIsUSorCA) {
    if (ControlName == 'Zip Code' || RunAll) {
        if (VV.Form.Global.ZipCodeFormValidation('Zip Code', 'Country') == false) {
            ErrorReporting = false;
        } // validation cleared in ZipCodeFormValidation
    }
} else {
    VV.Form.ClearValidationErrorOnField('Zip Code');
}
//First Name - Field that must be completed.
if (ControlName == 'First Name' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('First Name'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('First Name', 'Please complete the First Name field.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('First Name');
    }
}
//Job Title - Field that must be completed.
if (ControlName == 'Job Title' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Job Title'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Job Title', 'Please complete the Job Title field.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Job Title');
    }
}
//Last Name - Field that must be completed.
if (ControlName == 'Last Name' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Last Name'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Last Name', 'Please complete the Last Name field.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Last Name');
    }
}
//Middle Name - Field that must be completed.
if (ControlName == 'Middle Name' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Middle Name'), 'Blank') == false) {
        VV.Form.SetValidationErrorMessageOnField('Middle Name', 'Please complete the Middle Name field.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Middle Name');
    }
}
//Email - Email Address is required, and must be entered in a valid email format.
if (ControlName == 'Email' || RunAll) {
    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Email'), 'Email') == false) {
        VV.Form.SetValidationErrorMessageOnField('Email', 'An email address must be entered, and it must be in the form of a valid email address.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Email');
    }
}

//Phone Number - Phone number is optional, but when entered, it must be in a valid phone number format. With auto-formatting.
if (ControlName == 'Phone Number' || RunAll) {
    let enteredValue = VV.Form.GetFieldValue('Phone Number');
    let formattedVal = VV.Form.Global.FormatPhone(enteredValue);

    if (formattedVal != enteredValue) {
        VV.Form.SetFieldValue('Phone Number', formattedVal);
    }

    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Phone Number'), 'Blank') == true) {
        if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Phone Number'), 'Phone') == false) {
            VV.Form.SetValidationErrorMessageOnField('Phone Number', 'When a phone number is entered, it must be 10 digits, all numbers, and formatted (xxx) xxx-xxxx. The local prefix cannot start with a 0 or 1.');
            ErrorReporting = false;
        }
        else {
            VV.Form.ClearValidationErrorOnField('Phone Number');
        }
    } else {
        VV.Form.ClearValidationErrorOnField('Phone Number');
    }
}


//Fax Number - Fax number is optional, but when entered, it must be in a valid phone number format. With auto-formatting.
if (ControlName == 'Fax Number' || RunAll) {
    let faxValue = VV.Form.GetFieldValue('Fax Number');
    let faxFormattedVal = VV.Form.Global.FormatPhone(faxValue);

    if (faxFormattedVal != faxValue) {
        VV.Form.SetFieldValue('Fax Number', faxFormattedVal);
    }

    if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Fax Number'), 'Blank') == true) {
        if (VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Fax Number'), 'Phone') == false) {
            VV.Form.SetValidationErrorMessageOnField('Fax Number', 'When a fax number is entered, it must be 10 digits, all numbers, and formatted (xxx) xxx-xxxx. The local prefix cannot start with a 0 or 1.');
            ErrorReporting = false;
        }
        else {
            VV.Form.ClearValidationErrorOnField('Fax Number');
        }
    } else {
        VV.Form.ClearValidationErrorOnField('Fax Number');
    }
}

//Enabled - DropDown must be selected.
if (ControlName == 'Enabled' || RunAll) {
    var isSelectItem = VV.Form.Global.CentralValidation(VV.Form.getDropDownListText('Enabled'), 'DDSelect') == false;
    var isBlank = VV.Form.Global.CentralValidation(VV.Form.getDropDownListText('Enabled'), 'Blank') == false; /* added as a workaround to getddtext occasionally returning empty string - 7/14/2021 */
    if (isSelectItem || isBlank) {
        VV.Form.SetValidationErrorMessageOnField('Enabled', 'Please make a selection from the Enabled dropdown.');
        ErrorReporting = false;
    } else {
        VV.Form.ClearValidationErrorOnField('Enabled');
    }
}

return ErrorReporting;