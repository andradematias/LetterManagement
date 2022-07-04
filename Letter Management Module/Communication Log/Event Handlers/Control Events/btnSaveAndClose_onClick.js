// btnSaveAndClose_onClick for Communications Log
const results = VV.Form.Template.FormValidation();
if (results) {
    VV.Form.Template.SaveForm().then(function () {
        VV.Form.Global.MessageModal({
            ModalTitle: 'Record Saved',
            ModalBody: 'The record has been saved. The window will now close.',
            ShowOkButton: true,
            OkButtonText: 'Ok',
            OkButtonCallback: VV.Form.Global.CloseWindowNoModal,
            ShowCloseButton: false,
        });
    });
} else {
    VV.Form.Global.ValidationLoadModal('Save');
}