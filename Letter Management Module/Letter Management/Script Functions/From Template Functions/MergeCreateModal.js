//MergeCreateModal for Child Record

//example of displaying the payment modal
//$('#mergeModal').modal('show');

//include bootstrap script bundle (VV does not automatically load this bundle within the form viewer)
//the version number is meaningless, only used to force download of the script file when version is changed
let script = document.createElement('script');
script.src = '/bundles/bootstrapjs?v=FBul99mpojQQrPqNoqXHNBuItkZ_0pqoo9DoBnPB5pQ1';
document.head.appendChild(script);

let style = document.createElement('style');
style.innerHTML = '.close { vertical-align:middle;}';  //You can put css styles into this section.

document.head.appendChild(style);

//create modal dom elements using bootstrap modal classes.  ID of this element will be used to close or launch the modal.
let modalDiv = document.createElement("div");
modalDiv.setAttribute('class', 'modal fade');
modalDiv.setAttribute('id', 'mergeModal');
modalDiv.setAttribute('tabindex', '-1');
modalDiv.setAttribute('role', 'dialog');
modalDiv.setAttribute('aria-labelledby', 'Set Dynamic Values');
modalDiv.setAttribute('aria-hidden', 'true');
document.body.appendChild(modalDiv);

let dialogDiv = document.createElement("div");
dialogDiv.setAttribute('class', 'modal-dialog');
dialogDiv.setAttribute('role', 'merge');
modalDiv.appendChild(dialogDiv);

let contentDiv = document.createElement("div");
contentDiv.setAttribute('class', 'modal-content');
dialogDiv.appendChild(contentDiv);

//insert form here

let headerDiv = document.createElement("div");
headerDiv.setAttribute('class', 'modal-header');
contentDiv.appendChild(headerDiv);

//Element of the header to show the purpose of the modal.
let modalTitle = document.createElement("h5");
modalTitle.setAttribute('class', 'modal-title');
modalTitle.setAttribute('id', 'modalTitle');
modalTitle.innerHTML += "Set Dynamic Values";
headerDiv.appendChild(modalTitle);

let modalBodyDiv = document.createElement("div");
modalBodyDiv.setAttribute('class', 'modal-body');
contentDiv.appendChild(modalBodyDiv);

//The following loads 2 target sections for the modal to show messages and actions to the user.
let bodyContent = document.createElement("div");
bodyContent.innerHTML =
    '<div id="mergeMessageArea"></div>' +
    '<div id="mergeButtonArea"></div>';
modalBodyDiv.appendChild(bodyContent);


let modalFooterDiv = document.createElement("div");
modalFooterDiv.setAttribute('class', 'modal-footer');
contentDiv.appendChild(modalFooterDiv);

//The following is the cancel button.  Calling a VV script to clean the modal and close it.
let modalCancelButton = document.createElement("button");
modalCancelButton.setAttribute('type', 'button');
modalCancelButton.setAttribute('class', 'btn btn-secondary');
modalCancelButton.setAttribute('onclick', 'VV.Form.Template.MergeCancelModal()');
modalCancelButton.innerHTML += "Cancel";

modalFooterDiv.appendChild(modalCancelButton);

// The following is the "OK" button for the screen.  This can call other scripts and take other actions or can have specific actions configured if the other options do not apply.
let modalSubmitButton = document.createElement("button");
modalSubmitButton.setAttribute('type', 'button');
modalSubmitButton.setAttribute('class', 'btn btn-primary');
modalSubmitButton.setAttribute('onclick', 'VV.Form.Template.DynamicTokenMerge();');
modalSubmitButton.innerHTML += "Merge Values";

modalFooterDiv.appendChild(modalSubmitButton);

modalFooterDiv.appendChild(modalCancelButton);