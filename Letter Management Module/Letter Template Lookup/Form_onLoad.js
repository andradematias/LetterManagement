//CloseButtonFormat hides the VV close button, changes the form close button colors, and makes them clickable even in read-only mode. 
//This function must be called on Load and in EventsEnd.
// VV.Form.Global.CloseButtonFormat();

console.log(VV.Form.GetFieldValue('Revision ID'));

var formSaved = VV.Form.IsFormSaved

if(formSaved){
    VV.Form.SetFieldValue('Form Saved','True',true)
}

// set field defaults
if (VV.Form.GetFieldValue('Allow Email') == 'Select Item') {
    VV.Form.SetFieldValue('Allow Email', 'Yes');
}

// Modal Section
VV.Form.Global.LoadModalSettings();
VV.Form.Global.MessageModal(true);