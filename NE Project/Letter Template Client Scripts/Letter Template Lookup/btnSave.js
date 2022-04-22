var results = VV.Form.Template.FormValidation();
if (results) {
    VV.Form.Template.DuplicateRecordCheck() // does a form save after confirming non-duplicate
} else {
    setTimeout(function() {
        VV.Form.Global.ValidationLoadModal('btnSave');
    }, 500);
}