if (VV.Form.GetFieldValue('Email String') !== "") {
    VV.Form.SetFieldValue('Recipient Email', VV.Form.GetFieldValue('Email String'));
} else {
    VV.Form.Template.CallToPopulateRecipientEmail();
}