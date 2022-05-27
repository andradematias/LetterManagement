const results = VV.Form.Template.FormValidation();

if (results) {
    VV.Form.DoAjaxFormSave();
} else {
    setTimeout(function () {
        VV.Form.Global.ValidationLoadModal('btnSave');
    }, 500);
}