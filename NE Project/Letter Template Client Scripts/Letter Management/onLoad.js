//Set License Type to All by Default
if (!VV.Form.IsFormSaved) {
    VV.Form.SetFieldValue('License Type', 'All', false)
}

//Tab Control should be set to the first tab on each load.
VV.Form.Template.CheckUserGroup();
VV.Form.SetFieldValue('Tab Control', 'Letter');

var userID = VV.Form.GetFieldValue('User ID');
var IndividualID = VV.Form.GetFieldValue('Individual ID');
var isFill = VV.Form.Global.IsFillAndRelate();
var uploadPath = VV.Form.GetFieldValue('UploadFolder');

if (userID.length == 0 && !isFill) {
    VV.Form.Template.PopulateFields();
}
else if (uploadPath == '') {
    var newPath = VV.Form.Global.BuildUploadFolderPath(IndividualID)
    VV.Form.SetFieldValue('UploadFolder', newPath);
}

// Modal Section
VV.Form.Global.LoadModalSettings();
VV.Form.Global.CancelAndCloseModal(true);
VV.Form.Template.MergeCreateModal();

// UserGroups Visibility Section
// This sets all current User Groups in the hidden UserGroups Field
// Groups and conditions manages the visibility
VV.Form.SetFieldValue('User Groups', VV.Form.FormUserGroups[0])

var formSaved = VV.Form.IsFormSaved

if (formSaved) {
    VV.Form.SetFieldValue('Form Saved', 'True', true)
}

VV.Form.Template.RetrieveUserInfo();

VV.Form.SetFieldValue('Communication Type', 'Email');