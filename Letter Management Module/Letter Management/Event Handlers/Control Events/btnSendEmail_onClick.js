//If no email address, show modal and don't run SendEmail script
const email = VV.Form.GetFieldValue('Recipient Email');
if (email == '') {
    if (VV.Form.GetFieldValue('Email String') !== "") {
        VV.Form.SetFieldValue('Recipient Email', VV.Form.GetFieldValue('Email String'));
    } else {
        VV.Form.Template.CallToPopulateRecipientEmail();
    }
    //Modal message to communicate that no email is present
    //BuildIt,ModalTitle,ModalBody,ShowCloseButton,ShowOkButton,OkButtonTitle,OkButtonCallback,CloseButtonText,ThirdButton,ThirdButtonText,ThirdButtonCallback
    //VV.Form.Global.MessageModal(false, 'No Email Address', "No email address has been located for the recipient. Please click 'Preview/Print' to generate a letter that can be sent to a physical address.", true, false, 'Close', null);
} else {
    var modalBody = "Do you really want to send this letter as an email?"

    // BuildIt,ModalTitle,ModalBody,ShowCloseButton,ShowOkButton,OkButtonTitle,OkButtonCallback   
    VV.Form.Global.MessageModal(false, 'Send Email', modalBody, true, true, 'Ok', VV.Form.Template.SendEmail, 'Cancel')
}