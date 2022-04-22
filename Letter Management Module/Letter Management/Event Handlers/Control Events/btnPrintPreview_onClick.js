//Helper function to determine if any passed in controlValue is null
function isNull(controlValue) {
    if (controlValue == '' || controlValue == null || controlValue == undefined || controlValue == 'Select Item') {
        return true;
    }
    return false;
}

var isLandscape = isNull(VV.Form.GetFieldValue('Landscape')) ? false : VV.Form.GetFieldValue('Landscape')
VV.Form.Template.PrintLetter(VV.Form.GetFieldValue('Letter HTML'), VV.Form.Template.ParseTokens('[Full Name]'), isLandscape);