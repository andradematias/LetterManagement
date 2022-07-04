// addressValidation script created by Eric Oyanadel
// if 'Suggestions Menu' is true it will run the us_autocompletions
// if all the fields are filled out run the us_verification
// if the country is set to CA run the intl_verification
var evalGC = false;
var triggerEvents = false;

// toggles 'Address Is Validating', which serves as a flag to stop multiple instances of AddressValidation from being called until it is set to false
var toggleAddressValidation = function (enable, debugContext) {
    // console.log(`'Address Is Validating' set to '${enable}' ${debugContext ? '(' + debugContext + ')' : ''}`); // for debugging
    VV.Form.SetFieldValue('Address Is Validating', (enable ? 'true' : 'false'), evalGC, triggerEvents);
};

if (VV.Form.GetFieldValue('Address Is Validating').toLowerCase() == 'true') {
    // console.log('\'Address Is Validating\' is \'true\'. Cancelling validation'); // for debugging
    return;
} else {
    toggleAddressValidation(true, 'AddressValidation start');
}

var validateAddress = function () {
    var formData = [];
    var addressObject = {};
    addressObject.name = "addressObject";
    addressObject.country = VV.Form.GetFieldValue(Country);
    addressObject.address1 = VV.Form.GetFieldValue(Street1);
    addressObject.address2 = VV.Form.GetFieldValue(Street2);
    addressObject.city = VV.Form.GetFieldValue(City);
    addressObject.state = VV.Form.GetFieldValue(State);
    addressObject.zip = VV.Form.GetFieldValue(Zip);
    addressObject.suggestions = VV.Form.GetFieldValue('Suggestions Menu');
    formData.push(addressObject);

    var data = JSON.stringify(formData);
    var requestObject = $.ajax({
        type: "POST",
        url:
            VV.BaseAppUrl +
            "api/v1/" +
            VV.CustomerAlias +
            "/" +
            VV.CustomerDatabaseAlias +
            "/scripts?name=AddressVerification",
        contentType: "application/json; charset=utf-8",
        data: data,
        success: "",
        error: "",
    });

    return requestObject;
};

// removes whitespace and sets characters to uppercase
var buildAddressStr = function (street1, city, state, zip) {
    var addressStr = street1 + city + state + zip;
    return addressStr.replace(/ /g, '').toUpperCase();
};

// get current address string of form
var getFormAddressStr = function () {
    var street1Val = VV.Form.GetFieldValue(Street1);
    var cityVal = VV.Form.GetFieldValue(City);
    var stateVal = VV.Form.GetFieldValue(State);
    var zipVal = VV.Form.GetFieldValue(Zip); // Note: will include +4

    return buildAddressStr(street1Val, cityVal, stateVal, zipVal);
};

var autoFillAddressFields = function (resp) {
    var userStreet1 = VV.Form.GetFieldValue(Street1);
    var userCity = VV.Form.GetFieldValue(City);
    var userState = VV.Form.GetFieldValue(State);
    var userZip = VV.Form.GetFieldValue(Zip);
    var currentCountry = VV.Form.GetFieldValue(Country);
    var zipCodeString;
    if (currentCountry == "US") {
        zipCodeString = resp.data[3].zip_code + "-" + resp.data[3].zip_code_plus_4;
    } else {
        zipCodeString = resp.data[3].postal_code;
    }

    // during AV's first pass; IsValidating will be false
    if (userStreet1 != '' && userStreet1 != resp.data[4]) {
        VV.Form.SetFieldValue(Street1, resp.data[4], evalGC, triggerEvents);
        VV.Form.SetFieldValue(Street2, resp.data[5].secondary_line, evalGC, triggerEvents); // Street1_onBlur() -> AddressValidation() -> check(IsValidating) == true -> not gonna call AddressValidation API (AddressVerification web service) again
    }
    if (userCity != '' && userCity != resp.data[3].city) {
        VV.Form.SetFieldValue(City, resp.data[3].city, evalGC, triggerEvents);
    }
    if (userState != 'Select Item' && userState != resp.data[3].state) {
        VV.Form.SetFieldValue(State, resp.data[3].state, evalGC, triggerEvents);
    }
    if (userZip != '' && userZip != zipCodeString) {
        VV.Form.SetFieldValue(Zip, zipCodeString, evalGC, triggerEvents);
    }
};

var buildAddressSuggestionsModal = function (resp) {
    var suggestionsRespArray = resp.data[5].suggestions;
    var modalBody = $('<div>').append($('<p>').html('Looks like the address entered is not a valid address, but our database has a few suggestions. Please note that addresses may not be fully valid'));

    // create list of address suggestions
    var addressList = $('<ul>').css('list-style-type', 'none');
    suggestionsRespArray.forEach(function (suggestedAddr) {
        // format address to show on list
        var addrListItem = $('<li>').addClass('suggetionListItems').css({
            'list-style-type': 'none',
            'color': '#00607f',
            'cursor': 'pointer',
            'padding': '2.5px, 0',
            'font-family': 'Source Sans Pro',
        });
        addrListItem.append(`${suggestedAddr.primary_line} ${suggestedAddr.city}, ${suggestedAddr.state} ${suggestedAddr.zip_code}`);

        // add suggestion data to attr
        addrListItem.attr('addressData', JSON.stringify(suggestedAddr));

        // add click handler to address link
        addrListItem.click(function (event) {
            /**
            * NOTE: Actions that close Address Validation modals need to be the only events setting IsValidating to false.
            * This is to prevent an issue where a modal appearing triggers a blur of another address field, thus triggering 
            * another AddressValidation call and a "double modal"
            */
            toggleAddressValidation(false, 'suggestion clicked'); // allow selected suggestion validation

            var clickedSuggestion = $(event.target);
            var addressData = JSON.parse(clickedSuggestion.attr('addressData'));
            var newAddressStr = buildAddressStr(addressData.primary_line, addressData.city, addressData.state, addressData.zip_code);

            VV.Form.SetFieldValue(Street1, addressData.primary_line, evalGC, triggerEvents);
            VV.Form.SetFieldValue(Zip, addressData.zip_code, evalGC, triggerEvents);
            VV.Form.SetFieldValue('Address String Field', newAddressStr, evalGC, triggerEvents);

            // hide modal
            $('#ModalOuterDiv').modal('hide');
        });

        // append list item to list
        addressList.append(addrListItem);
    });

    // append list to modal body
    modalBody.append(addressList);

    return modalBody;
};

var undeliverableModalMessage = (
    `
    <p>According to our database the address entered is undeliverable.</p>
    <p>You may continue, proceed with caution.</p>  
  `
);

var missingUnitModalMessage = (
    `
    <p>According to our database the address entered has either a missing, incorrect, or unnecessary unit number</p>
    <p>You may continue if you believe this to be the correct address.</p>  
  `
);

var invalidAddressModalMessage = (
    `
    <p>According to our database the address entered may be improperly formatted or not yet in the system</p>
    <p>Please verify that the address you input is correct, otherwise you may continue.</p>  
  `
);

var showModal = function (title, body, closeButtonText) {
    var modalTitle = title;
    var modalBody = body;
    var showOkButton = true;
    var okButtonTitle = closeButtonText;
    var okButtonCallback = function () {
        /**
         * NOTE: Actions that close Address Validation modals need to be the only events setting IsValidating to false.
         * This is to prevent an issue where a modal appearing triggers a blur of another address field, thus triggering 
         * another AddressValidation call and a "double modal"
         */
        toggleAddressValidation(false, 'modal closed');
    };
    var showThirdButton = false;
    var thirdButtonTitle = '';
    var thirdButtonCallback = null;
    var showCloseButton = false;
    var closeButtonTitle = '';

    // "queues" up message modal to show after another MessageModal closes (if there's one open)
    var messageModal = $('#ModalOuterDiv');
    if (messageModal.css('display') == 'none') {
        VV.Form.Global.MessageModal(false, modalTitle, modalBody, showCloseButton, showOkButton, okButtonTitle, okButtonCallback, closeButtonTitle, showThirdButton, thirdButtonTitle, thirdButtonCallback);
    } else {
        messageModal.one('hidden.bs.modal', function () {
            VV.Form.Global.MessageModal(false, modalTitle, modalBody, showCloseButton, showOkButton, okButtonTitle, okButtonCallback, closeButtonTitle, showThirdButton, thirdButtonTitle, thirdButtonCallback);
        });
    }
};

$.when(validateAddress()).always(function (resp) {
    var messageData = "";
    var AddressString = ''; // addressString is a hidden field to match with user's input for onBlur Events
    var countryValue = VV.Form.GetFieldValue(Country);

    if (typeof resp.status != "undefined") {
        messageData =
            "A status code of " + resp.status + " returned from the server. There is a communication problem with the  web servers. If this continues, please contact the administrator and communicate to them this message and where it occurred.";
        alert(messageData);
    } else if (typeof resp.statusCode != "undefined") {
        messageData =
            "A status code of " + resp.statusCode + " with a message of '" + resp.errorMessages[0].message + "' returned from the server. This may mean that the servers to run the business logic are not available.";
        alert(messageData);
    } else if (resp.meta.status == 200) {
        if (resp.data[0] != 'undefined') {
            if (resp.data[0] == 'Success') {
                // UNDELIVERABLE SECTION
                if (resp.data[2] == 'undeliverable') {
                    // INTERNATIONAL SECTION
                    if (countryValue == 'CA') {
                        AddressString = buildAddressStr(resp.data[4], resp.data[3].city, resp.data[3].state, resp.data[3].postal_code);
                        VV.Form.SetFieldValue('Address String Field', AddressString, evalGC, triggerEvents);
                        showModal('Address Validation', undeliverableModalMessage, 'Ok');
                    } // US SUGGESTIONS SECTION
                    else if (resp.data[3] && countryValue == 'US') {
                        // set true for next call to validateAddress()
                        VV.Form.SetFieldValue('Suggestions Menu', 'true', evalGC, triggerEvents);

                        // get suggestions
                        validateAddress().then(function (data) {
                            var verifyResultObj = data.data[5];
                            var suggestionMatch = false;
                            if (verifyResultObj?.suggestions) {
                                // check if a suggested address matches the current address
                                var currAddressStr = getFormAddressStr();
                                for (const suggestedAddr of verifyResultObj.suggestions) {
                                    var suggestionStr = buildAddressStr(suggestedAddr.primary_line, suggestedAddr.city, suggestedAddr.state, suggestedAddr.zip_code);
                                    if (currAddressStr == suggestionStr) {
                                        // console.warn('A returned suggestion is identical to the current address, will not show suggestions'); // for debugging
                                        suggestionMatch = true;
                                        break;
                                    }
                                }
                            }

                            if (suggestionMatch == false && verifyResultObj?.suggestions?.length > 0) { // no matches and suggestions are useable
                                showModal('Address Validation', buildAddressSuggestionsModal(data), 'Cancel');
                            } else { // match found or no suggestions
                                showModal('Address Validation', undeliverableModalMessage, 'Ok');
                            }
                        });

                        // suggestion call sent, no longer need this to true
                        VV.Form.SetFieldValue('Suggestions Menu', 'false', evalGC, triggerEvents);
                    } // DEFAULT UNDELIVERABLE
                    else {
                        showModal('Address Validation', undeliverableModalMessage, 'Ok');
                    }
                } // DELIVERABLE SECTION 
                else if (resp.data[2] == 'deliverable') {
                    AddressString = buildAddressStr(resp.data[4], resp.data[3].city, resp.data[3].state, (resp.data[3].zip_code + '-' + resp.data[3].zip_code_plus_4));
                    VV.Form.SetFieldValue('Address String Field', AddressString, evalGC, triggerEvents);
                    autoFillAddressFields(resp);
                    toggleAddressValidation(false, 'deliverable address populated');
                } // MISSING UNIT SECTION
                else if (resp.data[2] && resp.data[2].includes('_unit')) {
                    showModal('Address Validation', missingUnitModalMessage, 'Ok');
                } // INVALID ADDRESS SECTION
                else {
                    console.warn(resp.data[5] ? resp.data[5] : 'No verify result returned.');
                    showModal('Address Validation', invalidAddressModalMessage, 'Ok');
                }
            } else if (resp.data[0] == 'Error') {
                messageData = 'An error was encountered. ' + resp.data[1];
                alert(messageData);
            } else {
                messageData = 'An unhandled response occurred when calling PopulateFieldsOnLoad. The form will not save at this time.  Please try again or communicate this issue to support.';
                alert(messageData);
            }
        } else {
            messageData = 'The status of the response returned as undefined.';
            alert(messageData);
        }
    }

    // allow Address Validation if we are not still waiting for a web service
    if (resp.meta.status != 200 || resp.data[0] != 'Success') {
        toggleAddressValidation(false, 'web service error');
    }
});