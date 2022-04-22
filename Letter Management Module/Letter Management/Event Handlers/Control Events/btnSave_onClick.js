// btnSave script for Letter Management
if (VV.Form.IsFormSaved) { VV.Form.SetFieldValue('Form Saved', 'True') }

VV.Form.DoAjaxFormSave().then(function () {
    VV.Form.SetFieldValue('Form Saved', 'True');

    if (window.opener && window.opener.VV) {
        let parentFormID = window.opener.VV.Form.GetFieldValue('Form ID');
        // reload RRC for parent form
        if (parentFormID.startsWith('LICENSE-DETAILS')) {
            window.opener.VV.Form.ReloadRepeatingRowControl('RRC_LetterManagement');
        } else if (parentFormID.startsWith('DISC-LIC-EVENT')) {
            window.opener.VV.Form.ReloadRepeatingRowControl('RRC_LetterManagement');
        } else if (parentFormID.startsWith('LICAPP')) {
            window.opener.VV.Form.ReloadRepeatingRowControl('RRC_LetterManagement');
        } else if (parentFormID.startsWith('ORG')) {
            window.opener.VV.Form.ReloadRepeatingRowControl('RRC_LetterManagement');
        } else if (parentFormID.startsWith('FACILITY')) {
            window.opener.VV.Form.ReloadRepeatingRowControl('RRC_LetterManagement');
        } else if (parentFormID.startsWith('TASK')) {
            window.opener.VV.Form.ReloadRepeatingRowControl('RRC_CommLogs');
        }

        // save parent form
        window.opener.VV.Form.DoAjaxFormSave();

        VV.Form.Template.RelateToLetterManagement();
    }
});