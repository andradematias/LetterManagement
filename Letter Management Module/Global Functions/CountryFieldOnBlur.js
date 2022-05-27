// Global script for Country OnBlur | updated Eric Oyanadel
// Parameters that are taken in this order:
// Country, Street, Street1, Street2, ZipCode, City, State, County

VV.Form.Template.FormValidation(Country);
var country = VV.Form.GetDropDownListItemValue(Country);
var countryIdentifier = VV.Form.GetFieldValue('Country Identifier');

if (country != countryIdentifier) {
    var triggerGC = true;
    var triggerOnBlur = false;
    VV.Form.SetFieldValue(Street, '', triggerGC, triggerOnBlur);
    VV.Form.SetFieldValue(Street1, '', triggerGC, triggerOnBlur);
    VV.Form.SetFieldValue(Street2, '', triggerGC, triggerOnBlur);
    VV.Form.SetFieldValue(ZipCode, '', triggerGC, triggerOnBlur);
    VV.Form.SetFieldValue(City, '', triggerGC, triggerOnBlur);
    VV.Form.SetFieldValue(State, 'Select Item', triggerGC, triggerOnBlur);
    VV.Form.SetFieldValue(County, 'Select Item', triggerGC, triggerOnBlur);

    // We clear out Validation because all fields onBLur events get triggered when setting the fieldValue
    VV.Form.ClearValidationErrorOnField(Street);
    VV.Form.ClearValidationErrorOnField(Street1);
    VV.Form.ClearValidationErrorOnField(Street2);
    VV.Form.ClearValidationErrorOnField(City);
    VV.Form.ClearValidationErrorOnField(State);
    VV.Form.ClearValidationErrorOnField(ZipCode);
}

VV.Form.SetFieldValue('Country Identifier', country);