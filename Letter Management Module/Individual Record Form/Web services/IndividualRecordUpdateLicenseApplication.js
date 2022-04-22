var logger = require('../log');

module.exports.getCredentials = function () {
    // Get customerAlias and databaseAlias from the project url
    // https://vv5demo.visualvault.com/app/customerAlias/Main/UserPortal
    // Get ID and Secret from /Control Panel/Administration Tools/User Administration/User Information => HTTP API Access
    // clientId: API Key
    // clientSecret: API Secret
    let options = {};
    options.customerAlias = "Matias";
    options.databaseAlias = "Main";
    options.userId = "Matias.API";
    options.password = "p";
    options.clientId = "ce26b233-d68e-4406-a148-3b9458cd6f33";
    options.clientSecret = "yJCQUzYNS7CvJypLp18klcY5Ncyap6Pm12n2tNKFy2s=";
    return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
    /*Script Name:   IndividualRecordUpdateLicenseApplication
     Customer:      Nebraska, DHHS
     Purpose:       The purpose of this process is to update any 'new' license applications associated with the current individual.
     Parameters:    Various form fields
     Return Array:
                    [0] = "Success"
                    [1] = "Relevant License Applications for this individual have been updated."
     Psuedo code: 
                1. Call getForms on the license application to retrieve 'new' applications
                2. All postFormRevision on any retrieved license applications to update fields
     Last Rev Date: 02/23/2022 
     Revision Notes:
     01/19/2022 - Saesha Senger: Script created
     01/25/2022 - Saesha Senger: Update to exclude business license applications
     02/19/2022 - Fabian Montero: Removed unused moment require statement
     02/23/2022 - John Sevilla: Made Date of Birth and US Citizen optional to account for "Created by Cease and Desist" process
     */

    logger.info('Start of the process IndividualRecordUpdateLicenseApplication at ' + Date());

    /****************
     Config Variables
    *****************/
    let LicenseAppTemplateID = 'License Application';
    let errorMessageGuidance = 'Please try to End Provider Relationship again, or contact a system administrator if this problem continues.'
    let missingFieldGuidance = 'Please provide a value for the missing field and try again, or contact a system administrator if this problem continues.'

    /****************
     Script Variables
    *****************/
    let outputCollection = [];
    let errorLog = [];

    try {

        /****************
         Helper Functions
        *****************/
        // Check if field object has a value property and that value is truthy before returning value.
        function getFieldValueByName(fieldName, isOptional) {
            try {
                let fieldObj = ffCollection.getFormFieldByName(fieldName);
                let fieldValue = fieldObj && (fieldObj.hasOwnProperty('value') ? fieldObj.value : null);

                if (fieldValue === null) {
                    throw new Error(`${fieldName}`);
                }
                if (!isOptional && !fieldValue) {
                    throw new Error(`${fieldName}`);
                }
                return fieldValue;
            } catch (error) {
                errorLog.push(error.message);
            }
        }

        // Basic error checking of response, raising errors if found
        function parseAndCheckResp(resp, methodName = 'getForms') {
            resp = JSON.parse(resp);
            let respData = (resp.hasOwnProperty('data') ? resp.data : null);
            if (resp.meta.status !== 200) { throw new Error(`There was an error when calling ${methodName}. ${errorMessageGuidance}`) }
            if (respData === null) { throw new Error(`Data was not able to be returned when calling ${methodName}. ${errorMessageGuidance}`) }

            return resp;
        }

        /*********************
         Form Record Variables
        **********************/
        let IndividualID = getFieldValueByName('Form ID');
        let FirstName = getFieldValueByName('First Name');
        let LastName = getFieldValueByName('Last Name');
        let MiddleName = getFieldValueByName('Middle Name', true);
        let Suffix = getFieldValueByName('Suffix', true);
        let AKA = getFieldValueByName('AKA', true);
        let DateOfBirth = getFieldValueByName('Date of Birth', true);
        let PlaceOfBirth = getFieldValueByName('Place of Birth', true);
        let Country = getFieldValueByName('Country');
        let Zip = getFieldValueByName('Zip Code');
        let Street = getFieldValueByName('Street');
        let Street1 = getFieldValueByName('Street1', true);
        let Street2 = getFieldValueByName('Street2', true);
        let City = getFieldValueByName('City');
        let State = getFieldValueByName('State');
        let County = getFieldValueByName('County', true);
        let USCitizen = getFieldValueByName('US Citizen', true);
        let HasSSN = getFieldValueByName('Has SSN', true);
        let SSN = getFieldValueByName('SSN', true);
        let AlienReg = getFieldValueByName('Alien Registration Number', true);
        let I94 = getFieldValueByName('I94', true);
        let OutsideNA1 = getFieldValueByName('OutsideNA1', true);
        let OutsideNA2 = getFieldValueByName('OutsideNA2', true);
        let PrimaryPhoneType = getFieldValueByName('Primary Phone Type', true);
        let SecondaryPhoneType = getFieldValueByName('Secondary Phone Type', true);
        let PrimaryPhoneNumber = getFieldValueByName('Primary Phone Number', true);
        let SecondaryPhoneNumber = getFieldValueByName('Secondary Phone Number', true);
        let Extension1 = getFieldValueByName('Extension1', true);
        let Extension2 = getFieldValueByName('Extension2', true);
        let Email1 = getFieldValueByName('Email Address', true);
        let Status;
        let StatusArray = [];

        // Specific fields are detailed in the errorLog sent in the response to the client.
        if (errorLog.length > 0) {
            throw new Error(`${missingFieldGuidance}`)
        }

        /****************
         BEGIN ASYNC CODE
        *****************/

        // Do a getForms call to find the correct //// to update
        let queryParams = {};
        queryParams.q = `[Individual ID] eq '${IndividualID}' and [Show Business] ne 'Yes'`;
        queryParams.expand = 'false';
        queryParams.fields = 'Status';
        let getFormsResp = await vvClient.forms.getForms(queryParams, LicenseAppTemplateID);
        getFormsResp = parseAndCheckResp(getFormsResp);
        let getFormsData = getFormsResp.data;

        if (getFormsResp.meta.status !== 200) { throw new Error(`There was an error when calling getForms. ${errorMessageGuidance}`) }
        if (getFormsData === null) { throw new Error(`Data was not able to be returned when calling getForms. ${errorMessageGuidance}`) }
        if (getFormsData.length < 1) { throw new Error(`No '${LicenseAppTemplateID}' records found. ${errorMessageGuidance}`) }

        if (getFormsData.length > 0) {
            for (const rec of getFormsData) {
                Status = rec.status;
                StatusArray.push(Status);
            }

            if (!StatusArray.includes('Submitted') && !StatusArray.includes('Approved') && !StatusArray.includes('Pending') && !StatusArray.includes('Waiting Applicant Action') && !StatusArray.includes('Waiting Documentation, Primary Source') && !StatusArray.includes('Pending Board Review') && !StatusArray.includes('Pending Final Review') && !StatusArray.includes('Pending Applicant Response') && !StatusArray.includes('Pending Appeal') && !StatusArray.includes('Complete Pending Inspection') && !StatusArray.includes('Denied') && !StatusArray.includes('Withdrawn')) {
                for (const rec of getFormsData) {
                    let RevID = rec.revisionId;
                    let formUpdateObj = {};

                    // Update object holding all fields that need to be updated
                    formUpdateObj = {
                        'Individual ID': IndividualID,
                        'First Name': FirstName,
                        'Last Name': LastName,
                        'Middle Name': MiddleName,
                        'Suffix': Suffix,
                        'AKA': AKA,
                        'Date of Birth': DateOfBirth,
                        'Place of Birth': PlaceOfBirth,
                        'Mailing Country': Country,
                        'Mailing Zip Code': Zip,
                        'Mailing Street': Street,
                        'Mailing Street1': Street1,
                        'Mailing Street2': Street2,
                        'Mailing City': City,
                        'Mailing State': State,
                        'Mailing County': County,
                        'US Citizen': USCitizen,
                        'Has SSN': HasSSN,
                        'SSN': SSN,
                        'Alien Registration Number': AlienReg,
                        'I94': I94,
                        'OutsideNA1': OutsideNA1,
                        'OutsideNA2': OutsideNA2,
                        'Primary Phone Type': PrimaryPhoneType,
                        'Secondary Phone Type': SecondaryPhoneType,
                        'Primary Phone Number': PrimaryPhoneNumber,
                        'Secondary Phone Number': SecondaryPhoneNumber,
                        'Extension1': Extension1,
                        'Extension2': Extension2,
                        'Email Address': Email1
                    }

                    // Run postFormRevision to update each license application returned from the getForms call
                    formParams = {};
                    formRevisionResp = await vvClient.forms.postFormRevision(formParams, formUpdateObj, LicenseAppTemplateID, RevID);
                    if (formRevisionResp.meta.status != 201) {
                        throw new Error(`There was an error when attempting to revise the license application. ${formRevisionResp.meta.status}`)
                    }
                }
            }
        }

        outputCollection[0] = "Success";
        outputCollection[1] = "Relevant License Applications for this individual have been updated.";
    } catch (error) {
        console.log(error);
        // Log errors captured.
        logger.info(JSON.stringify(`${error} ${errorLog}`))
        outputCollection[0] = 'Error'
        outputCollection[1] = `${error.message} ${errorLog.join(' ')} `
        outputCollection[2] = null
        outputCollection[3] = errorLog
    } finally {
        response.json(200, outputCollection)
    }
}
