//AddComunnicationLog

//Template GUID "Communication Log" goes here
const templateId = '8b95e0a8-3bc7-ec11-a9da-bc51b0e8489a';

/*********************
Form Record Variables
**********************/
const IndividualID = VV.Form.GetFieldValue('Individual ID');
const LetterHTML = VV.Form.GetFieldValue('Letter HTML');
const Subject = VV.Form.GetFieldValue('Subject of Template');
const LicenseID = VV.Form.GetFieldValue('License Details ID');
const DisciplinaryID = VV.Form.GetFieldValue('Disciplinary Event ID');
const OrganizationID = VV.Form.GetFieldValue('Organization ID');
const FacilityID = VV.Form.GetFieldValue('Facility ID');
const Recipient = VV.Form.GetFieldValue('Recipient Email');
const CommType = VV.Form.GetFieldValue('Communication Type');

/****************
Config Variables
*****************/
let sendDate = new Date().toISOString();
let IDToPass = "";

if (LicenseID) {
    IDToPass = LicenseID;
} else if (DisciplinaryID) {
    IDToPass = DisciplinaryID;
} else if (OrganizationID) {
    IDToPass = OrganizationID;
} else if (FacilityID) {
    IDToPass = FacilityID;
} else if (IndividualID) {
    IDToPass = IndividualID;
}

//Field mappings
const fieldMappings = [
    {
        sourceFieldName: 'Letter HTML',
        sourceFieldValue: LetterHTML,
        targetFieldName: 'Email Body'
    },
    {
        sourceFieldName: 'License Application ID',
        sourceFieldValue: IDToPass,
        targetFieldName: 'Primary Record ID'
    },
    {
        sourceFieldName: 'Subject of Template',
        sourceFieldValue: Subject,
        targetFieldName: 'Subject'
    },
    {
        sourceFieldName: 'Communication Type',
        sourceFieldValue: CommType,
        targetFieldName: 'Communication Type'
    },
    {
        sourceFieldName: 'Recipient Email',
        sourceFieldValue: Recipient,
        targetFieldName: 'Email Recipients'
    },
    {
        sourceFieldValue: 'Immediate Send',
        targetFieldName: 'Email Type'
    },
    {
        sourceFieldValue: 'Yes',
        targetFieldName: 'Approved'
    },
    {
        sourceFieldValue: sendDate,
        targetFieldName: 'Scheduled Date'
    },
    {
        sourceFieldValue: 'Send New',
        targetFieldName: 'Communication Type Filter'
    },
    {
        sourceFieldValue: 'True',
        targetFieldName: 'Form Saved'
    },
];

//Call the fill in global script
VV.Form.Global.FillinAndRelateForm(templateId, fieldMappings);



