//GetFormPrefix for Global - Takes in a Form ID and returns the prefix
//Parameter: FormID
var prefixReg = /^([A-Za-z-]+)-\d+$/;
var formPrefix = '';
try {
    formPrefix = prefixReg.exec(FormID)[1];
} catch (error) {
    console.error('Unable to parse form prefix for: "' + FormID + '"');
    console.error(error);
} finally {
    return formPrefix;
}