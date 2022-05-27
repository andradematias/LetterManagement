//Build folder path to be sent to Letter Management if there is no email address and user wants to send a letter
var formID = VV.Form.GetFieldValue('Form ID');
var newPath = VV.Form.Global.BuildUploadFolderPath(formID);
VV.Form.SetFieldValue('UploadFolder', newPath);

VV.Form.Template.SendNewCommunication();