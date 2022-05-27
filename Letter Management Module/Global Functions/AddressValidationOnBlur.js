// Address Validation ONBLUR events
// script created by Eric Oyanadel

/* REQUIRED FORM FIELDS TO ADD */
// "Address Is Validating" - Avoids more than one API call being sent out when several fields with validation blur
// "Suggestions Menu" - Enables the address suggestion API when true
// "Address String Field" - Checks if the address fields were updated; used to limit API calls
CountryName = (CountryName) ? CountryName : 'Country';
AddressLine1Name = (AddressLine1Name) ? AddressLine1Name : 'Street';
AddressLine2Name = (AddressLine2Name) ? AddressLine2Name : 'Street1';
CityName = (CityName) ? CityName : 'City';
StateName = (StateName) ? StateName : 'State';
ZipCodeName = (ZipCodeName) ? ZipCodeName : 'Zip Code';

var currentCountry = VV.Form.GetFieldValue(CountryName);
if (currentCountry == 'US' || currentCountry == 'CA') {
    var street = VV.Form.GetFieldValue(AddressLine1Name).trim();
    var city = VV.Form.GetFieldValue(CityName).trim();
    var state = VV.Form.GetFieldValue(StateName).trim();
    var zip = VV.Form.GetFieldValue(ZipCodeName).trim();
    var responseAddressString = VV.Form.GetFieldValue('Address String Field');
    var userFormAddressString = street + city + state + zip;
    userFormAddressString = userFormAddressString.replace(/ /g, '').toUpperCase();
    if (street && city && state != 'Select Item' && zip && responseAddressString != userFormAddressString) {
        VV.Form.Global.AddressValidation(CountryName, AddressLine1Name, AddressLine2Name, CityName, StateName, ZipCodeName);
    }
}