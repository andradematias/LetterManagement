//DocumentCreateModal for Global

//include bootstrap script bundle (VV does not automatically load this bundle within the form viewer)
//the version number is meaningless, only used to force download of the script file when version is changed
var script = document.createElement('script');
script.src = '/bundles/bootstrapjs?v=FBul99mpojQQrPqNoqXHNBuItkZ_0pqoo9DoBnPB5pQ1';
document.head.appendChild(script);

var style = document.createElement('style');
style.innerHTML = '.close { vertical-align:middle;}';  //You can put css styles into this section.

document.head.appendChild(style);

//create modal dom elements using bootstrap modal classes.  ID of this element will be used to close or launch the modal.
var modalDiv = document.createElement("div");
modalDiv.setAttribute('class', 'modal fade');
modalDiv.setAttribute('id', 'documentModal');
modalDiv.setAttribute('tabindex', '-1');
modalDiv.setAttribute('role', 'dialog');
modalDiv.setAttribute('aria-labelledby', 'View Documents');
modalDiv.setAttribute('aria-hidden', 'true');
document.body.appendChild(modalDiv);

var dialogDiv = document.createElement("div");
dialogDiv.setAttribute('class', 'modal-dialog');
dialogDiv.setAttribute('role', 'document');
modalDiv.appendChild(dialogDiv);

var contentDiv = document.createElement("div");
contentDiv.setAttribute('class', 'modal-content');
dialogDiv.appendChild(contentDiv);

//insert form here

var headerDiv = document.createElement("div");
headerDiv.setAttribute('class', 'modal-header');
contentDiv.appendChild(headerDiv);

//Element of the header to show the purpose of the modal.
var modalTitle = document.createElement("h5");
modalTitle.setAttribute('class', 'modal-title');
modalTitle.setAttribute('id', 'modalTitle');
modalTitle.innerHTML += "View Documents";
headerDiv.appendChild(modalTitle);

var modalBodyDiv = document.createElement("div");
modalBodyDiv.setAttribute('class', 'modal-body');
contentDiv.appendChild(modalBodyDiv);

//The following loads 2 target sections for the modal to show messages and actions to the user.
var bodyContent = document.createElement("div");
bodyContent.innerHTML =
    '<div id="documentMessageArea"></div>' +
    '<div id="documentButtonArea"></div>';
modalBodyDiv.appendChild(bodyContent);


var modalFooterDiv = document.createElement("div");
modalFooterDiv.setAttribute('class', 'modal-footer');
contentDiv.appendChild(modalFooterDiv);

//The following is the Close button.  Calling a VV script to clean the modal and close it.
var modalCloseButton = document.createElement("button");
modalCloseButton.setAttribute('type', 'button');
modalCloseButton.setAttribute('class', 'btn btn-secondary');
modalCloseButton.setAttribute('onclick', 'VV.Form.Global.DocumentCancelModal()');
modalCloseButton.innerHTML += "Close";

modalFooterDiv.appendChild(modalCloseButton);