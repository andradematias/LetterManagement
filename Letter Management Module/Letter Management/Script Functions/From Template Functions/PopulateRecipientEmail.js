//If no email address, show modal and don't run SendEmail script
const email = VV.Form.GetFieldValue('Recipient Email');
const TemplateID = VV.Form.GetFieldValue('Form Template ID');
const TemplateName = VV.Form.GetFieldValue('Form Template Name');
const EmailFieldName = VV.Form.GetFieldValue('Email Field Name');
const EmailString = VV.Form.GetFieldValue('Email String').trim();


if ((VV.Form.Global.CentralValidation(EmailString, 'Blank')) !== false && VV.Form.Global.CentralValidation(email, 'Blank') === false) {
    VV.Form.SetFieldValue('Recipient Email', EmailString);
    sendEmail();
} else if ((TemplateID === '' || TemplateName === '' || EmailFieldName === '') && VV.Form.Global.CentralValidation(email, 'Blank') === false) {
    VV.Form.Global.MessageModal(false, 'No Email Address', "No email address has been located for the recipient. Please click 'Preview/Print' to generate a letter that can be sent to a physical address.", true, false, 'Close', null);
} else if (VV.Form.Global.CentralValidation(email, 'Blank') !== false) {
    sendEmail();
}
else {
    VV.Form.Template.CallToWSPopulateRecipientEmail();
    sendEmail();
}


//If the user confirms, the global function "AddCommunicationLog" is called to record the log
function sendEmail() {
    var modalBody = "Do you really want to send this letter as an email?"

    // BuildIt,ModalTitle,ModalBody,ShowCloseButton,ShowOkButton,OkButtonTitle,OkButtonCallback   
    VV.Form.Global.MessageModal(false, 'Send Email', modalBody, true, true, 'Ok', VV.Form.Template.SendEmail, 'Cancel')
}
//BuildIt,ModalTitle,ModalBody,ShowCloseButton,ShowOkButton,OkButtonTitle,OkButtonCallback,CloseButtonText,ThirdButton,ThirdButtonText,ThirdButtonCallback