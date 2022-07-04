// Country fields should default to US
var country = VV.Form.GetDropDownListItemValue('Country');
if (country == 'Select Item' || country == '' || country == 'Error') {
    VV.Form.SetFieldValue('Country', 'US');
}

// Modal Section
VV.Form.Global.LoadModalSettings();
VV.Form.Global.MessageModal(true);