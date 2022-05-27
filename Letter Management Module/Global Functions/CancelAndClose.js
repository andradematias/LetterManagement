//This function causes the MessageModal to appear. When pressing 'Ok,' the window closes. When pressing 'Cancel,' the modal disappears and the window remains open.

//This is the function that closes the window after a delay. It is called in the MessageModal as the 'Ok callback function'
function okCall() {
    setTimeout(function () {
        window.close();
    }, 1000);
}

var modalTitle = 'Cancel and Close';
var modalBody = 'Are you sure you would like to close this form? Any unsaved changes will be lost.';
var showCloseButton = true;
var closeButtonText = 'Return to Form';
var showOkButton = true;
var okButtonText = 'Ok';
VV.Form.Global.MessageModal(false, modalTitle, modalBody, showCloseButton, showOkButton, okButtonText, okCall, closeButtonText);   // shows modal