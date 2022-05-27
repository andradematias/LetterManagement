const results = VV.Form.Template.FormValidation();
const unsavedChanges = VV.Form.UnsavedChanges;

if (results) {
    if (unsavedChanges > 0) {
        VV.Form.DoAjaxFormSave().then(function () {
            VV.Form.Global.MessageModal(false, 'Record Saved', "The record has been saved. The window will now close.", false, true, 'Ok', VV.Form.Global.CloseWindowNoModal);
        });
    } else {
        VV.Form.Global.MessageModal(false, 'Record Saved', "The record has been saved. The window will now close.", false, true, 'Ok', VV.Form.Global.CloseWindowNoModal);
    }
} else {
    setTimeout(function () {
        VV.Form.Global.ValidationLoadModal('btnSave');
    }, 500);
}