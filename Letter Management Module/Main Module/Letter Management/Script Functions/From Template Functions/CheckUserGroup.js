let groups = VV.Form.FormUserGroups.toString();
console.log(groups);
VV.Form.SetFieldValue('User Groups', groups);
if (groups.indexOf('License Applicant') > -1) {
    VV.Form.SetFieldValue('LU Staff', 'False');
} else {
    VV.Form.SetFieldValue('LU Staff', 'True');
}