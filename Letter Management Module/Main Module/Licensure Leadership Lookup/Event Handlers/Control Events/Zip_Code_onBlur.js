if (VV.Form.Template.FormValidation('Zip Code')) {
    // lookup and populate city, state, and county field controls
    VV.Form.Global.CityInformationLookup('Zip Code', 'City', 'State', 'County', 'Country');
}

VV.Form.Global.AddressValidationOnBlur()