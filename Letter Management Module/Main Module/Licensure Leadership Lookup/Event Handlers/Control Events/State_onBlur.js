VV.Form.Template.FormValidation('State');

if (VV.Form.GetFieldValue('State') == 'NE') {
    VV.Form.Template.FormValidation('County');
}
VV.Form.Global.AddressValidationOnBlur()