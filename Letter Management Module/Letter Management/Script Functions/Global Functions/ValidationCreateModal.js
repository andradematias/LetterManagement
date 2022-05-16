//ValidationCreateModal for Global Script - Helper Function for Validation Modal process (ValidationLoadModal).

//example of displaying the payment modal
//$('#validationErrorModal').modal('show');

if ($('#validationErrorModal').length) {
    // modal already exists, don't add a new one to document
    return;
}

//create modal dom elements using bootstrap modal classes.  ID of this element will be used to close or launch the modal.
var modalDiv = document.createElement("div");
modalDiv.setAttribute('class', 'modal fade');
modalDiv.setAttribute('id', 'validationErrorModal');
modalDiv.setAttribute('tabindex', '-1');
modalDiv.setAttribute('role', 'dialog');
modalDiv.setAttribute('aria-labelledby', 'Form Validation Errors Found');
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
modalTitle.innerHTML += "Form Validation Errors Found";
headerDiv.appendChild(modalTitle);

var modalBodyDiv = document.createElement("div");
modalBodyDiv.setAttribute('class', 'modal-body');
contentDiv.appendChild(modalBodyDiv);

//The following loads 2 target sections for the modal to show messages and actions to the user.
var bodyContent = document.createElement("div");
bodyContent.innerHTML =
    '<div id="validationmessagearea"></div>' +
    '<div id="validationbuttonArea"></div>';
modalBodyDiv.appendChild(bodyContent);


var modalFooterDiv = document.createElement("div");
modalFooterDiv.setAttribute('class', 'modal-footer');
contentDiv.appendChild(modalFooterDiv);

//The following is the cancel button.  Calling a VV script to clean the modal and close it.
var modalCancelButton = document.createElement("button");
modalCancelButton.setAttribute('type', 'button');
modalCancelButton.setAttribute('class', 'btn btn-secondary');
modalCancelButton.setAttribute('onclick', 'VV.Form.Global.ValidationCancelModal()');
modalCancelButton.innerHTML += "Cancel";

modalFooterDiv.appendChild(modalCancelButton);