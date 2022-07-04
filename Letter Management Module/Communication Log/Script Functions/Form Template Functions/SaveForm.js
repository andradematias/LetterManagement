// SaveForm for Communications Log
var deferred = $.Deferred();
var doAfterSave = function () {
    var parentFormID;
    var formPrefix;
    if (window.opener && window.opener.VV) {
        parentFormID = window.opener.VV.Form.GetFieldValue('Form ID')
        formPrefix = VV.Form.Global.GetFormPrefix(parentFormID);
    }

    // Reload RRC of the parent form
    switch (formPrefix) {
        case 'IND':
            window.opener.VV.Form.ReloadRepeatingRowControl('RRC_CommLogs')
            break;
        case 'MONITORING':
        case 'DISC-LIC-EVENT':
            window.opener.VV.Form.ReloadRepeatingRowControl('RRC_CommunicationLogs')
            break;
        default: //Do nothing here
            break;
    }

    deferred.resolve();
}

VV.Form.SetFieldValue('Form Saved', true);

if (VV.Form.UnsavedChanges > 0) {
    VV.Form.DoAjaxFormSave().then(doAfterSave);
} else {
    doAfterSave();
}

return deferred.promise();