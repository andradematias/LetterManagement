var isFill = VV.Form.Global.IsFillAndRelate();

// Modal Section; up here in case WaitForCompletePageLoad needs MessageModal before
VV.Form.Global.LoadModalSettings();
VV.Form.Global.MessageModal(true);
//Documents Modal
VV.Form.Global.DocumentCreateModal();

VV.Form.SetFieldValue('Has Submitted License', 'No')

if (VV.Form.IsFormSaved) {
    VV.Form.Template.GetRelatedLicenseRecords()
}

VV.Form.Global.WaitForCompletePageLoad(function () {
    var groups = VV.Form.FormUserGroups.toString();
    console.log('groups ' + groups);
    //Identifies the url. Used to determine if form is the public version
    var url = window.location.href
    console.log('url == ' + url)

    //Checks to see if applicant is logged in and filling out public application
    if (groups.indexOf('License Applicant') > -1 && url == 'https://vv5dev.visualvault.com/FormViewer/public?xcdid=419017bf-4f45-eb11-81f5-912ea5398475&xcid=bbf860ac-4f45-eb11-81f5-912ea5398475&formid=ee42fef7-586a-eb11-a9c3-fb4ab9bb6383') {
        //modal here
        VV.Form.Global.MessageModal(false, 'Logged in User Accessing Public Registration Form', VV.Form.Template.LoggedInPublicFormModal(), false, true, 'Ok',
            function () {
                setTimeout(function () {
                    window.location.href = VV.BaseURL + "UserPortal"
                }, 2000);
            })
    }


    // Mailing Country fields should default to US
    var mailingCountry = VV.Form.GetDropDownListItemValue('Country');
    if (mailingCountry == 'Select Item' || mailingCountry == '' || mailingCountry == 'Error') {
        VV.Form.SetFieldValue('Country', 'US');
    }

    // Physical Country fields should default to US
    var physicalCountry = VV.Form.GetDropDownListItemValue('Physical Country');
    if (physicalCountry == 'Select Item' || physicalCountry == '' || physicalCountry == 'Error') {
        VV.Form.SetFieldValue('Physical Country', 'US');
    }

    //var groups = VV.Form.FormUserGroups.toString();
    VV.Form.SetFieldValue('User Groups', groups);

    //Tab Control should be set to the first tab on each load.
    VV.Form.SetFieldValue('Tab Control', 'Profile');

    //Set ordering for address fields for mobile mode

    /* Controls for container Con_IndInfoAdd. In mobile mode they will be displayed in the order they appear below.*/
    var mailingAddressFlexControls = [
        'Mailing Address Label',
        'Mailing Country Label',
        'Country',
        'Business Name Label',
        'Business Name',
        'Mailing Address Line 1 Label',
        'Street',
        'Mailing Address Line 2 Label',
        'Street1',
        'Mailing Address Line 3 Label',
        'Street2',
        'Mailing Zip Code Label',
        'Mailing Postal Code Label',
        'Zip Code',
        'Mailing City Label',
        'City',
        'Mailing State Label',
        'Mailing Province Label',
        'State',
        'Mailing County Label',
        'County',
        'Label267',
        'Same Address'
    ]

    mailingAddressFlexControls.forEach(VV.Form.Global.SetContainerControlFlexOrder);

    /* Controls for container Con_IndInfoPhysicalAddress. In mobile mode they will be displayed in the order they appear below.*/
    var physicalAddressFlexControls = [
        'Physical Address Label',
        'Label246',
        'Physical Country',
        'Label253',
        'Physical Street',
        'Label257',
        'Physical Street1',
        'Label262',
        'Physical Street2',
        'Physical Postal Code Label',
        'Physical Zip Code Label',
        'Physical Zip Code',
        'Physical City Label',
        'Physical City',
        'Physical Province Label',
        'Physical State Label',
        'Physical State',
        'Physical County Label',
        'Physical County',
    ]

    physicalAddressFlexControls.forEach(VV.Form.Global.SetContainerControlFlexOrder);

});

//Determine if Form Has Been previously Saved.
/*if (VV.Form.IsFormSaved) {
    VV.Form.SetFieldValue('FormSaved', true) //This was put here for deprecated gender field, leaving it as it may be needed later.
}*/


// UserGroups Visibility Section
// This sets all current User Groups in the hidden UserGroups Field
// Groups and conditions manages the visibility
var groups = VV.Form.FormUserGroups.toString();
//The Individual Form does not have this conditional to handle no groups
if (groups == '' || groups == null || groups == 'undefined') {
    groups = 'Public';
}
VV.Form.SetFieldValue('User Groups', groups)


//temporary call to set Form ID Stamp field changed property
VV.Form.Global.UpdateFormIdField('Form ID');

function getParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}

// set LUFormID onLoad to fix error with legacy data
VV.Form.SetFieldValue('LUFormID', VV.Form.GetFieldValue('Form ID'));

VV.Form.SetFieldValue('RevID', getParam('RevID'))
if (getParam('Staff Entry') == 'True') {
    VV.Form.SetFieldValue('Email Sent', 'true', true);
    VV.Form.SetFieldValue('Email Address', getParam('Email'));
    VV.Form.SetFieldValue('Retype Email Address', getParam('Email'));
    VV.Form.SetFieldValue('LUFormID', getParam('LUFormID'));
    VV.Form.Template.InviteeCompletionCheck();
}

var userGroups = VV.Form.GetFieldValue('User Groups')
if (userGroups.trim() == '' || userGroups == null || userGroups == undefined || userGroups == 'undefined' || userGroups.trim() == 'Public') {
    VV.Form.SetFieldValue('Public User', true)
}

var userGroups = VV.Form.GetFieldValue('User Groups');
var userGroupsArray = userGroups.split(',');
var status = VV.Form.GetFieldValue('Status');

if (status != 'New' && (userGroupsArray.includes('VaultAccess') || userGroupsArray.includes('License Coordinator') || userGroupsArray.includes('License Processor') || userGroupsArray.includes('License Manager'))) {
    VV.Form.Global.GetOnHoldData();
}

VV.Form.Template.CeaseAndDesistLabelUpdate(); // updates certain required field labels

var jsonFieldName = 'Individual_Record_JSON_Object_Data';

//  JSON.parse will throw an error if the JSON field is empty or mal-formed. 
var jsonFieldValue = VV.Form.GetFieldValue(jsonFieldName).trim();
if (jsonFieldValue.length > 0) {
    VV.Form.SetFieldValue(jsonFieldName, JSON.stringify(JSON.parse(VV.Form.GetFieldValue(jsonFieldName)), null, "\t"), false);
}