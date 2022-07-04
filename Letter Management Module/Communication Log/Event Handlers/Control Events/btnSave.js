// btnSave_onClick for Communications Log
const results = VV.Form.Template.FormValidation();
if (results) {
    VV.Form.Template.SaveForm().then(function () {
        VV.Form.Global.MessageModal({
            ModalTitle: 'Record Saved',
            ModalBody: 'The record has been saved.',
            CloseButtonText: 'Ok',
        });
    });
} else {
    VV.Form.Global.ValidationLoadModal('Save');
}