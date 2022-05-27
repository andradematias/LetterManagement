//onLoad for Communication Log
//CloseButtonFormat hides the VV close button, changes the form close button colors, and makes them clickable even in read-only mode. 
//This function must be called on Load and in EventsEnd.
VV.Form.Global.CloseButtonFormat();

if (VV.Form.Global.IsFillAndRelate()) {
    const ddl = $('[VVFieldName="Communication Log"]');
    // Trigger the onchange event that will go and update the associated dropdowns dropdown
    ddl.trigger("change")
}

//var uploadPath = VV.Form.GetFieldValue('Upload Path');

//if (uploadPath == '') {
//var newPath = VV.Form.Global.BuildUploadFolderPath(IndividualID);
//VV.Form.SetFieldValue('Upload Path', newPath);
//}

const fullYear = new Date().getFullYear();
const year = VV.Form.GetFieldValue('Year');
if (!year) {
    VV.Form.SetFieldValue('Year', fullYear);
}

// Modal Section For (Form onLoad)
VV.Form.Global.LoadModalSettings();
VV.Form.Global.CancelAndCloseModal(true);