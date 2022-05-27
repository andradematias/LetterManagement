// ValidationLoadModal Global Script

/*
    Script Name:   ValidationLoadModal
    Customer:      NEDHHS
    Purpose:       The purpose of this script is to load a modal with field names and error messages from fields that have a validation error. This is done by detecting the visible error image flag that is show by a field (even if a container is hidden). This script will also generate a link, if possible, to call a function that will take the user directly to the field with the error.
    **** This script should be called after validation has been run that returned false (had errors). ****
    Parameters:    Pass in the control.value from a button click when calling this script. This is used to generate an error message.(controlName, validationFancyModal)
    Date of Dev:   7/17/2020
    Last Rev Date: 7/20/2021 
    Revision Notes:
    7/17/2020  - Rocky: Script created.
    7/20/2021  - John Sevilla: Added logic to alias form fields on the validation modal
*/

// Create the modal
VV.Form.Global.ValidationCreateModal()

// Clean out in case data exists
VV.Form.Global.ValidationCleanModal()

// Check if fancy modal should be displayed
if (validationFancyModal !== true) {
    validationFancyModal = false
}

// Fancy Modal Variables
var htmlContent = ''
var title = 'Form Validation Errors'


// Instructions displayed at top of modal.
var modalInstructions = '<p class="validationusermessage">Please examine the list of fields with errors that have occurred. The description by each field outlines the error that was encountered. Navigate to the field, make the appropriate correction, and then try again.</p>'

// If Button name is passed in show these instructions.
if (controlName == 'btnSave') {
    modalInstructions = '<p class="validationusermessage">Please examine the list of fields with errors that have occurred. The description by each field outlines the error that was encountered. Navigate to the field, make the appropriate correction, and then try clicking the Save and Confirm button again.</p>'
} else if (controlName == 'btnSubmit') {
    modalInstructions = '<p class="validationusermessage">Please examine the list of fields with errors that have occurred. The description by each field outlines the error that was encountered. Navigate to the field, make the appropriate correction, and then try clicking the Submit button again.</p>'
} else if (controlName == 'btnCreate') {
    modalInstructions = '<p class="validationusermessage">Please examine the list of fields with errors that have occurred. The description by each field outlines the error that was encountered. Navigate to the field, make the appropriate correction, and then try clicking the Create User Manually button again.</p>'
} else if (controlName == 'btnCreateApp') {
    modalInstructions = '<p class="validationusermessage">Please examine the list of fields with errors that have occurred. The description by each field outlines the error that was encountered. Navigate to the field, make the appropriate correction, save the form, and then try clicking the Create Application button again.</p>'
} else if (controlName == 'btnFindLicenseeorPayor') {
    modalInstructions = '<p class="validationusermessage">To use the search feature, you must complete Payer Business Name OR Address Line 1 plus City OR Payer First and Last Name OR Payer FEIN OR Payer SSN.</p>'
}

// If this script was called but no fields were found with validation errors this message will be shown.
var noValidationErrorsFound = 'Form Validation was performed and reported an error. However no specific field was found with an error displayed. Please try again or contact a system administrator if the problem continues.'

// Store fields found to have validation errors.
var formFields = []

/* In the form HTML a type tag corresponds to the following:
   1 - Textbox
   3 - Multi-line Textbox
   4 - Checkbox
   5 - Dropdown
   10 - Signature
   13 - Date
   14 - Cell Field (number)
*/

// looks for aliases to the field names that will display in the modal
var aliases = null;
if (VV.Form.Template.ValidationModalFieldAliases) {
    aliases = VV.Form.Template.ValidationModalFieldAliases();
}

// Find all fields that have been flagged with a validation error. Get the field name and error message.
$('[vvfftype="1"], [vvfftype="3"], [vvfftype="4"], [vvfftype="5"], [vvfftype="10"], [vvfftype="13"], [vvfftype="14"]').each(function (i, elem) {
    if ($(this).find('[vvimage="validation"]').attr('style') === 'display: inline-block;') {
        var error = $(this).find('[vvimage="validation"]').children().eq(0).attr('title')
        var field = $(this).attr('vvfieldnamewrapper')
        if (error && field) {
            var displayName = null;
            if (aliases && aliases[field]) {
                displayName = aliases[field];
            } else {
                displayName = field;
            }

            formFields.push({ fieldName: field, errorMessage: error, fieldDisplayName: displayName });
        }
    }
})
// console.log(formFields);
// If this script was called but no fields were found with validation errors display a message to the user.
if (formFields.length === 0) {
    VV.Form.HideLoadingPanel()
    //VV.Form.Global.DisplayMessaging(noValidationErrorsFound)

    // TAB LOGIC - Check if tabs are visible on page and relationships are mapped. Check if function exists before calling it.
} else if ($(".styleTabButtons").length > 0 && $(".styleTabButtons").prop("style")['display'] !== 'none' && typeof VV.Form.Template.TabToFieldRelationships === 'function') {

    // Modal instructions
    $(modalInstructions).appendTo('#validationmessagearea');

    htmlContent += modalInstructions

    var generatedCodeObj = {
        'Not Mapped': [],
        'Not In': []
    }
    var tabToFieldRelationshipsObj = {}

    // Get tab to relationship object from function setup on form.
    tabToFieldRelationshipsObj = VV.Form.Template.TabToFieldRelationships()

    // Get tab buttons on form to set in the same order so the order is maintained when displaying the modal.
    $(".styleTabButtons > div").each(function (i, elem) {
        generatedCodeObj[($(this).children(":first").val())] = []
    })


    // Helper function that takes an object of a fieldName and errorMessage and generates HTML to display in modal.
    function findFieldInObj(fieldObj) {
        var fieldFound = false

        for (var key in tabToFieldRelationshipsObj) {
            // Find if a field name has a relationship to a tab.
            if (tabToFieldRelationshipsObj.hasOwnProperty(key)) {
                fieldFound = tabToFieldRelationshipsObj[key].some(function (elem) {
                    return elem.toLowerCase() === fieldObj['fieldName'].toLowerCase()
                })

                if (fieldFound) {
                    // Make sure an array exists to push into.
                    if (!Array.isArray(generatedCodeObj[key])) {
                        generatedCodeObj[key] = []
                    }
                    // Tab relationship was found to field, generated HTML.
                    generatedCodeObj[key].push('<b>' + fieldObj['fieldDisplayName'] + '</b>: <a href="javascript:void(0)" onclick="VV.Form.Global.ValidationGoToFieldFromModal(' + "'" + fieldObj['fieldName'] + "'" + ')">' + fieldObj['errorMessage'] + '</a><br>')
                    break
                }
            }
        }
        if (!fieldFound) {
            // If a field isn't being displayed and a tab relationship wasn't found it can't be navigated to automatically. Generate HTML with no link.
            if ($('[VVFieldName="' + fieldObj['fieldName'] + '"]').parent().parent().prop("style")['display'] === 'none') {
                generatedCodeObj['Not Mapped'].push('<b>' + fieldObj['fieldDisplayName'] + '</b>: ' + fieldObj['errorMessage'] + '<br>')
            } else {
                generatedCodeObj['Not In'].push('<b>' + fieldObj['fieldDisplayName'] + '</b>: <a href="javascript:void(0)" onclick="VV.Form.Global.ValidationGoToFieldFromModal(' + "'" + fieldObj['fieldName'] + "'" + ')">' + fieldObj['errorMessage'] + '</a><br>')
            }
        }
    }

    // Call function for each field with a validation error.
    formFields.forEach(function (elem) {
        findFieldInObj(elem)
    })


    // Take object of that has keys that match Tab name and a value that is an Array of HTML code for each field and join and populate the modal.
    for (var key in generatedCodeObj) {
        if (generatedCodeObj.hasOwnProperty(key)) {
            if (Array.isArray(generatedCodeObj[key]) && generatedCodeObj[key].length > 0) {
                if (key === 'Not Mapped') {
                    $('<hr style="width:40%;margin-top:0;margin-bottom:5px">' + generatedCodeObj[key].join('') + '<br>').appendTo('#validationbuttonArea')

                    htmlContent += '<hr style="width:40%;margin-top:0;margin-bottom:5px">' + generatedCodeObj[key].join('') + '<br>'
                } else {
                    $('<h4>' + key + ' Tab</h4><hr style="width:40%;margin-top:0;margin-bottom:5px">' + generatedCodeObj[key].join('') + '<br>').appendTo('#validationbuttonArea')

                    htmlContent += '<h4>' + key + ' Tab</h4><hr style="width:40%;margin-top:0;margin-bottom:5px">' + generatedCodeObj[key].join('') + '<br>'
                }
            }
        }
    }

    // Display modal. The modal itself has buttons to save or cancel.
    //$('#validationErrorModal').modal({ backdrop: 'static', keyboard: false });
    if (validationFancyModal === true) {
        Swal.fire({
            icon: 'error',
            title: 'Form Validation Errors Found',
            html: htmlContent,
            width: '64rem'
        })
    } else {
        $('#validationErrorModal').modal('show');
    }


} else {
    // NO TABS LOGIC.

    // Modal instructions
    $(modalInstructions).appendTo('#validationmessagearea');

    htmlContent += modalInstructions


    // Iterate through returned LES Child Assignment data to populate modal.
    formFields.forEach(function (fieldObj) {
        // If a field isn't being displayed currently generate HTML with no link.
        if ($('[VVFieldName="' + fieldObj['fieldName'] + '"]').parent().parent().prop("style")['display'] === 'none') {
            $(('<b>' + fieldObj['fieldDisplayName'] + '</b>: ' + fieldObj['errorMessage'] + '<br>')).appendTo('#validationbuttonArea')

            htmlContent += '<b>' + fieldObj['fieldDisplayName'] + '</b>: ' + fieldObj['errorMessage'] + '<br>'

        } else {
            $('<b>' + fieldObj['fieldDisplayName'] + '</b>: <a href="javascript:void(0)" onclick="VV.Form.Global.ValidationGoToFieldFromModal(' + "'" + fieldObj['fieldName'] + "'" + ')">' + fieldObj['errorMessage'] + '</a><br>').appendTo('#validationbuttonArea')

            htmlContent += '<b>' + fieldObj['fieldDisplayName'] + '</b>: <a href="javascript:void(0)" onclick="VV.Form.Global.ValidationFancyGoToField(' + "'" + fieldObj['fieldName'] + "'" + ')">' + fieldObj['errorMessage'] + '</a><br>'

        }
    })

    $(document).ready(function () {
        // Display modal. The modal itself has buttons to save or cancel.

        if (validationFancyModal === true) {
            Swal.fire({
                icon: 'error',
                title: 'Form Validation Errors Found',
                html: htmlContent,
                width: '64rem'
            })
        } else {
            $('#validationErrorModal').modal({ backdrop: 'static', keyboard: false });
        }

    });
}