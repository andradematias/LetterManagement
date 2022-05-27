/* CityInformationLookup  - Autopopulates City, State, and County fields based on the Zip/Postal code
Params:
ZipControlName           - required; the name of the control that houses the zip code
CityControlName          - the name of the control that houses the city info
StateControlName         - the name of the control that houses the state info
CountyControlName        - the name of the control that houses the county info
CountryControlName       - required; the name of the control that houses the country info
*/

var deferred = $.Deferred();
var evalGC = true; // to show fields like county dropdown when necessary
var triggerEvents = false;
var countryControlValue = VV.Form.GetDropDownListItemValue(CountryControlName);
var zipControlValue = VV.Form.GetFieldValue(ZipControlName).substring(0, 5);
var passValidation = false;
var validationErrMsg = '';

if (ZipControlName == null || CountryControlName == null) {
    validationErrMsg = 'ZipControlName and CountryControlName are required for CityInformationLookup';
    console.error(validationErrMsg);
} else if (zipControlValue.length < 5) {
    validationErrMsg = 'Zip code length < 5';
} else if (countryControlValue != 'US' && countryControlValue != 'CA' && countryControlValue != 'Select Item') {
    validationErrMsg = 'CityInformationLookup only supports US and Canadian postal codes';
} else if (zipControlValue[5] == '-') {
    // if Zip+4 given, do not run web service since it's more specific (likely populated by AddressValidation)
    // Note: this stops an infinite loop with AddressValidation when it populates US Zip+4
    validationErrMsg = 'Zip+4 is not accepted';
} else {
    passValidation = true;
}

if (passValidation == false) {
    deferred.reject(validationErrMsg);
    return deferred.promise();
}

var CityInformationLookup = function () {
    var formData = [];

    var FormInfo = {};
    FormInfo.name = 'ZipCode';
    FormInfo.value = VV.Form.GetFieldValue(ZipControlName).trim().substring(0, 5);
    formData.push(FormInfo);

    //Following will prepare the collection and send with call to server side script.
    var data = JSON.stringify(formData);
    var requestObject = $.ajax({
        type: "POST",
        url: VV.BaseAppUrl + 'api/v1/' + VV.CustomerAlias + '/' + VV.CustomerDatabaseAlias + '/scripts?name=LibFormCityInformationLookup',
        contentType: "application/json; charset=utf-8",
        data: data,
        success: '',
        error: ''
    });

    return requestObject;
};

$.when(
    CityInformationLookup()
).always(function (resp) {
    var messageData = '';
    if (typeof (resp.status) != 'undefined') {
        messageData = "A status code of " + resp.status + " returned from the server.  There is a communication problem with the  web servers.  If this continues, please contact the administrator and communicate to them this message and where it occured.";
        console.error(messageData);
        deferred.reject(messageData);
    }
    else if (typeof (resp.statusCode) != 'undefined') {
        messageData = "A status code of " + resp.statusCode + " with a message of '" + resp.errorMessages[0].message + "' returned from the server.  This may mean that the servers to run the business logic are not available.";
        console.error(messageData);
        deferred.reject(messageData);
    }
    else if (resp.meta.status == '200') {
        //Force Evaluation of G&C
        VV.Form.SetFieldValue(StateControlName, VV.Form.GetFieldValue(StateControlName)) //working
        if (resp.data[0] != 'undefined' && resp.data[0] == 'Success') {
            var loadData = resp.data[2];
            if (StateControlName != null) {
                if (loadData.State) {
                    VV.Form.SetFieldValue(StateControlName, loadData.State, evalGC, triggerEvents);
                } else if (loadData.Province) {
                    VV.Form.SetFieldValue(StateControlName, loadData.Province, evalGC, triggerEvents);
                }
                // Added by Eric | this lines is a workaround the state dropdown not picking up the onBlur event when the field gets set.
                VV.Form.Template.FormValidation(StateControlName)
            }

            if (CityControlName != null) {
                VV.Form.SetFieldValue(CityControlName, loadData.City.toUpperCase(), evalGC, triggerEvents);
            }

            if (CountyControlName != null) {
                if (loadData.State == 'NE') {
                    VV.Form.SetFieldValue(CountyControlName, VV.Form.Global.CaseTitleChange(loadData.County), evalGC, triggerEvents); // dropdown values use title case
                } else {
                    VV.Form.SetFieldValue(CountyControlName, 'Out Of State', evalGC, triggerEvents);
                }
            }
            deferred.resolve();
        }
        else if (resp.data[0] != 'undefined' && resp.data[0] == 'Error') {
            messageData = 'An unhandled response occurred.  The form will not save at this time.  Please try again or communicate this issue to support.';
            console.error(messageData);
            deferred.reject(messageData);
        }
        else {
            messageData = 'The status of the response returned as undefined.';
            console.error(messageData);
            deferred.reject(messageData);
        }
    }
    else {
        messageData = resp.data.error;
        console.error(messageData);
        deferred.reject(messageData);
    }
});

return deferred.promise();