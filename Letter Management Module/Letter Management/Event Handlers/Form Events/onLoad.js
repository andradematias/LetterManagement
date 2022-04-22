//Tab Control should be set to the first tab on each load.
VV.Form.Template.CheckUserGroup();
VV.Form.SetFieldValue('Tab Control', 'Letter');

const userID = VV.Form.GetFieldValue('User ID');
const IndividualID = VV.Form.GetFieldValue('Individual ID');
const isFill = VV.Form.Global.IsFillAndRelate();
const uploadPath = VV.Form.GetFieldValue('UploadFolder');
const licenseType = VV.Form.GetFieldValue('License Type')

//Set License Type to All by Default
if (!VV.Form.IsFormSaved && isNull(licenseType)) {
    VV.Form.SetFieldValue('License Type', 'All', false);
}

if (userID.length == 0 && !isFill) {
    VV.Form.Template.PopulateFields();
}
else if (uploadPath == '') {
    const newPath = VV.Form.Global.BuildUploadFolderPath(IndividualID)
    VV.Form.SetFieldValue('UploadFolder', newPath);
}

// Modal Section
VV.Form.Global.LoadModalSettings();
VV.Form.Global.CancelAndCloseModal(true);
VV.Form.Template.MergeCreateModal();
// Documents Modal
VV.Form.Global.DocumentCreateModal();

// UserGroups Visibility Section
// This sets all current User Groups in the hidden UserGroups Field
// Groups and conditions manages the visibility
VV.Form.SetFieldValue('User Groups', VV.Form.FormUserGroups[0])

const formSaved = VV.Form.IsFormSaved

if (formSaved) {
    VV.Form.SetFieldValue('Form Saved', 'True', true)
}

//VV.Form.Template.RetrieveUserInfo();

VV.Form.SetFieldValue('Communication Type', 'Email');

//Helper function to determine if any passed in controlValue is null
function isNull(controlValue) {
    if (controlValue == '' || controlValue == null || controlValue == undefined || controlValue == 'Select Item') {
        return true;
    }
    return false;
}
