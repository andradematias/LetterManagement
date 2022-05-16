/* 
Properties
  ModalTitle = String
  ModalBody = String
  ShowOkButton = Bool
  ShowCloseButton = bool
  BuildIt = Bool
  OkButtonTitle = String
  OkButtonCallback = function
  BuildIt,ModalTitle,ModalBody,ShowCloseButton,ShowOkButton,OkButtonTitle,OkButtonCallback
*/

/*** 
 README: This function is deprecated in favor of MessageModal. If you see this function called, please replace it with VV.Form.Global.MessageModal 
 ***/

console.warn('This function is deprecated in favor of MessageModal. If you see this function called, please replace it with VV.Form.Global.MessageModal ')

if (BuildIt) {
    var ModalHeaderText = $('<h5>').attr('id', 'ModalDialogTitleText').addClass('modal-title');
    var ModalCloseButton = $('<button>').attr('id', 'ModalDialogCloseButton').attr('data-dismiss', 'modal').attr('aria-label', 'Submit').css('margin', '0 5px 5px 0').addClass('btn');
    var ModalOkButton = $('<button>').attr('id', 'ModalDialogOkButton').attr('data-dismiss', 'modal').attr('aria-label', 'Submit').css('margin', '0 5px 5px 0').addClass('btn');
    var modalDiv = $('<div>').attr('tabindex', '-1').attr('role', 'dialog').attr('aria-labelledby', 'Submit Button Modal').attr('aria-hidden', 'true').attr('id', 'ModalOuterDiv').addClass('modal fade');
    var modaldialogDiv = $('<div>').attr('role', 'document').addClass('modal-dialog');
    var modalcontentDiv = $('<div>').css('margin', '15% auto').addClass('modal-content');
    var modalheaderDiv = $('<div>').addClass('modal-header');
    var modalBody = $('<div>').attr('id', 'ModalDialogBodyText').addClass('modal-body');
    var bodyButtonHolder = $('<div>').css('text-align', 'right');
    $(bodyButtonHolder).append(ModalOkButton).append(ModalCloseButton);
    $(ModalCloseButton).text('Return to Form');
    $(modalheaderDiv).append(ModalHeaderText);
    $(modalcontentDiv).append(modalheaderDiv).append(modalBody).append(bodyButtonHolder);
    $(modaldialogDiv).append(modalcontentDiv);
    $(modalDiv).append(modaldialogDiv)
    $('body').append(modalDiv);
    $(modalDiv).hide();
} else {
    if (!ShowOkButton) {
        $('#ModalDialogOkButton').hide();
    } else {
        $('#ModalDialogOkButton').show();
        $('#ModalDialogOkButton').text(OkButtonTitle).click(OkButtonCallback);
    }
    if (!ShowCloseButton) {
        $('#ModalDialogCloseButton').hide();
    } else {
        $('#ModalDialogCloseButton').show();
    }
    $('#ModalDialogBodyText').html('');
    $('#ModalDialogTitleText').html(ModalTitle);
    $('#ModalDialogBodyText').append(ModalBody);
    $('#ModalOuterDiv').modal({
        backdrop: 'static',
        keyboard: false
    });
}