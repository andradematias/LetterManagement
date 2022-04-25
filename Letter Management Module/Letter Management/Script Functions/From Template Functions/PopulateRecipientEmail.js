//If no email address, show modal and don't run SendEmail script
const email = VV.Form.GetFieldValue('Recipient Email').trim();

if (VV.Form.Global.CentralValidation(email, 'Blank') == false) {
    if ((VV.Form.Global.CentralValidation(VV.Form.GetFieldValue('Email String').trim(), 'Blank')) !== false) {
        VV.Form.SetFieldValue('Recipient Email', VV.Form.GetFieldValue('Email String').trim());
    } else {
        VV.Form.Template.CallToPopulateRecipientEmail();
    }
    sendEmail();
} else {
    sendEmail();
}

function sendEmail() {
    var modalBody = "Do you really want to send this letter as an email?"

    // BuildIt,ModalTitle,ModalBody,ShowCloseButton,ShowOkButton,OkButtonTitle,OkButtonCallback   
    VV.Form.Global.MessageModal(false, 'Send Email', modalBody, true, true, 'Ok', VV.Form.Template.SendEmail, 'Cancel')
}