//AddLetter on License Application

//Template GUID (Letter Management Form) goes here
var templateId = '713c7926-b6d7-ec11-a9dc-f4127e30e2df';

//Form fields go here
var IndividualID = VV.Form.GetFieldValue('Form ID');
var UploadPath = VV.Form.GetFieldValue('UploadFolder');


//Field mappings
var fieldMappings = [
    {
        sourceFieldName: 'Form ID',
        sourceFieldValue: IndividualID,
        targetFieldName: 'Individual ID'
    },
    {
        sourceFieldName: 'UploadFolder',
        sourceFieldValue: UploadPath,
        targetFieldName: 'UploadFolder'
    }
];

//Call the fill in global script
VV.Form.Global.FillinAndRelateForm(templateId, fieldMappings);