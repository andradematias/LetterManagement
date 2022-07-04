// SendCommunication for Communications Log
var results = VV.Form.Template.FormValidation();

if (results) {
    // update fields on send
    if (VV.Form.getDropDownListText('Approved') != 'Yes') {
        VV.Form.SetFieldValue('Approved', 'Yes', false);
        VV.Form.SetFieldValue('Communication Sent', 'No', false);
    }

    VV.Form.Template.SaveForm().then(function () {
        VV.Form.Global.MessageModal({
            ModalTitle: 'Send Communication',
            ModalBody: 'The communication has been scheduled to be sent.',
            CloseButtonText: 'Ok',
        });
    });
} else {
    VV.Form.Global.ValidationLoadModal('Save');
}