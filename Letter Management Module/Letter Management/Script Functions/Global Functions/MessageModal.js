/* 
Properties
  ModalTitle = String
  ModalBody = String
  ShowOkButton = Bool
  ShowCloseButton = bool
  BuildIt = Bool
  OkButtonTitle = String
  OkButtonCallback = function
  CloseButtonText - String
  ThirdButton - boolean
  ThirdButtonText - string
  ThirdButtonCallback - function

  BuildIt,ModalTitle,ModalBody,ShowCloseButton,ShowOkButton,OkButtonTitle,OkButtonCallback,CloseButtonText,ThirdButton,ThirdButtonText,ThirdButtonCallback
*/


//handle use case where function not initialzed with BuildIt = true
var modalExists = $('#ModalDialogBodyText').length > 0;

//first param true with modal display params
if (BuildIt && ModalTitle && ModalBody) {
    BuildIt = false;
}

if (BuildIt || !modalExists) {
    var ModalHeaderText = $('<h5>').attr('id', 'ModalDialogTitleText').addClass('modal-title');
    var ModalCloseButton = $('<button>').attr('id', 'ModalDialogCloseButton').attr('data-dismiss', 'modal').attr('aria-label', 'Submit').css('margin', '0 5px 5px 0').addClass('btn').text('Close');
    var ModalOkButton = $('<button>').attr('id', 'ModalDialogOkButton').attr('data-dismiss', 'modal').attr('aria-label', 'Submit').css('margin', '0 5px 5px 0').addClass('btn');
    var ModalThirdButton = $('<button>').attr('id', 'ModalThirdButton').attr('data-dismiss', 'modal').attr('aria-label', 'Submit').css('margin', '0 5px 5px 0').addClass('btn').text('Cancel');
    var modalDiv = $('<div>').attr('tabindex', '-1').attr('role', 'dialog').attr('aria-labelledby', 'Submit Button Modal').attr('aria-hidden', 'true').attr('id', 'ModalOuterDiv').addClass('modal fade');
    var modaldialogDiv = $('<div>').attr('role', 'document').addClass('modal-dialog');
    var modalcontentDiv = $('<div>').css('margin', '15% auto').addClass('modal-content');
    var modalheaderDiv = $('<div>').addClass('modal-header');
    var modalBody = $('<div>').attr('id', 'ModalDialogBodyText').addClass('modal-body');
    var bodyButtonHolder = $('<div>').attr('id', 'ModalButtonHolder').css('text-align', 'right');
    $(bodyButtonHolder).append(ModalOkButton).append(ModalThirdButton).append(ModalCloseButton);
    $(modalheaderDiv).append(ModalHeaderText);
    $(modalcontentDiv).append(modalheaderDiv).append(modalBody).append(bodyButtonHolder);
    $(modaldialogDiv).append(modalcontentDiv);
    $(modalDiv).append(modaldialogDiv)
    $('body').append(modalDiv);
    $(modalDiv).hide();
    modalExists = $('#ModalDialogBodyText').length > 0;
}

if (!BuildIt && modalExists) {
    var ModalOkButton = $('#ModalDialogOkButton')
    if (!ShowOkButton) {
        ModalOkButton.hide();
    } else {
        ModalOkButton.show();
        ModalOkButton.off(); // removes all preexisting click event handlers from ok button; this prevents error where a handler seems to run more than once after having closed the modal several times
        ModalOkButton.text(OkButtonTitle).click(OkButtonCallback);
    }
    var ModalCloseButton = $('#ModalDialogCloseButton');
    if (!ShowCloseButton) {
        ModalCloseButton.hide();
    } else {
        ModalCloseButton.show();
        // Check if the CloseButtonText param is passed | Edited Eric Oyanadel | 7-21-21
        if (CloseButtonText) {
            ModalCloseButton.text(CloseButtonText)
        }
    }
    var ModalThirdButton = $('#ModalThirdButton');
    if (!ThirdButton) {
        ModalThirdButton.hide();
    } else {
        ModalThirdButton.show();
        ModalThirdButton.off();
        ModalThirdButton.text(ThirdButtonText).click(ThirdButtonCallback);
    }
    $('#ModalDialogBodyText').html('');
    $('#ModalDialogTitleText').html(ModalTitle);
    $('#ModalDialogBodyText').append(ModalBody);
    $('#ModalOuterDiv').modal({
        backdrop: 'static',
        keyboard: false
    });
}