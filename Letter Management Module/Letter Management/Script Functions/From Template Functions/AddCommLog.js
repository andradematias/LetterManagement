//AddExams on License Application

//Template GUID goes here
const templateId = '9784ef20-69ff-eb11-a9cf-a7c45ba94e73';
//Test comm log
//const templateId = '5bbea924-161b-ec11-8208-ef9d412ac617';

//Form fields go here
const IndividualID = VV.Form.GetFieldValue('Individual ID');
const LetterHTML = VV.Form.GetFieldValue('Letter HTML');
const Subject = VV.Form.GetFieldValue('Subject of Template');
const LicenseID = VV.Form.GetFieldValue('License Details ID');
const DisciplinaryID = VV.Form.GetFieldValue('Disciplinary Event ID');
const OrganizationID = VV.Form.GetFieldValue('Organization ID');
const FacilityID = VV.Form.GetFieldValue('Facility ID');
const Recipient = VV.Form.GetFieldValue('Recipient Email');
const CommType = VV.Form.GetFieldValue('Communication Type');

let IDToPass;

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
];

//Call the fill in global script
VV.Form.Global.FillinAndRelateForm(templateId, fieldMappings);