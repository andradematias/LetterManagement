const { query } = require('winston');
var logger = require('../log');
var moment = require('moment');

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
}

module.exports.main = async function (ffCollection, vvClient, response) {
    /*Script Name:   PopulateFieldsOnLoad
     Customer:      Nebraska, DHHS
     Purpose:       The purpose of this process is to pull information form the Indivdual Record form based off the user email and pass it to new forms to load form details as available.
     Parameters: 
     Return Array:
                    1. Status: 'Success', 'Minor Error', 'Error'
                    2.  Message
                        i. 'Individual Record Found.'
                    3. FormInfo Object
     Psuedo code: 
                1. Do a getUser call using the UsID passed in from the client side to get the current user and pull their email address.
                2. Call GetForms on the Individual Record and query on the Email to retrieve form info.
     Last Rev Date: 0221/2022
     Revision Notes:
     02/05/2021 - Alex Rhee: Script created
     07/15/2021 - John Sevilla: Add street1 and street2 fields to getForms query
     07/22/2021 - Miroslav Sanader: Add Business Name to getForms query.
     07/27/2021 - Eric Oyanadel: Add `Instance Name` field  to `Form Info` output collection response.
     09/07/2021 - Saesha Senger: Add 'Opt-in' field
     10/01/2021 - Eric Oyanadel: Add `Place of Birth` field  to `Form Info` output collection response.
     11/3/2021 - John Sevilla: Make it possible to query off Individual ID if it exists
     02/21/2022 - Fabian Montero: Updated date of birth so it is a UTC ISO string.
     */

    logger.info('Start of the process PopulateFieldsOnLoad at ' + Date());

    /****************
     Config Variables
    *****************/
    let IndividualRecordTemplateID = 'Individual Record';
    let errorMessageGuidance = 'Please try again, or contact a system administrator if this problem continues.'
    let missingFieldGuidance = 'Please provide a value for the missing field and try again, or contact a system administrator if this problem continues.'

    /****************
     Script Variables
    *****************/
    let outputCollection = [];
    let errorLog = [];
    let FormInfo = {};
    let EmailAddress;

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

        /*********************
         Form Record Variables
        **********************/

        let userid = getFieldValueByName('USERID');
        let IndividualID = getFieldValueByName('Individual ID', true);

        // Specific fields are detailed in the errorLog sent in the response to the client.
        if (errorLog.length > 0) {
            throw new Error(`${missingFieldGuidance}`)
        }

        /****************
         BEGIN ASYNC CODE
        *****************/

        //1. Do a getUser call using the UsID passed in from the client side to get the current user and pull their email address.
        let formQuery = '';
        if (IndividualID) {
            formQuery = `[instanceName] eq '${IndividualID}'`;
        } else {
            let userQuery = `[id] eq '${userid}'`;

            let queryObj = {
                q: userQuery,
                e: 'true'
            }

            let getUserResp = await vvClient.users.getUser(queryObj);
            getUserResp = JSON.parse(getUserResp);
            let getUserData = (getUserResp.hasOwnProperty('data') ? getUserResp.data : null);

            if (getUserResp.meta.status !== 200) { throw new Error(`There was an error when calling getUser. ${errorMessageGuidance}`) }
            if (getUserData === null) { throw new Error(`Data was not able to be returned when calling getUser. ${errorMessageGuidance}`) }
            if (getUserData.length != 1) { throw new Error(`The User could not be found. ${errorMessageGuidance}`) }

            EmailAddress = getUserData[0].emailAddress;

            //2. Call GetForms on the Individual Record and query on the Email to retrieve form info.
            formQuery = "[Email Address] eq '" + EmailAddress + "'";
        }

        let formQueryObj = {
            q: formQuery,
            //expand: true,
            fields: "First Name, Last Name, Middle Name, AKA, Suffix, Same Address, Street, Street1, Street2, City, State, Zip Code, Country, County, Physical Street, Physical Street1, Physical Street2, Physical City, Physical State, Physical Zip Code, Physical Country,Physical County, SSN, Has SSN, US Citizen, Alien Registration Number, I94, Primary Phone Number, Secondary Phone Number, Primary Phone Type, Secondary Phone Type, OptIn, Email Address, Form ID, Date of Birth, County, Work Phone Number, Business Name, Place of Birth"
        };

        let getFormsResp = await vvClient.forms.getForms(formQueryObj, IndividualRecordTemplateID);
        getFormsResp = JSON.parse(getFormsResp);
        let getFormsData = (getFormsResp.hasOwnProperty('data') ? getFormsResp.data : null);

        if (getFormsResp.meta.status !== 200) { throw new Error(`There was an error when calling getForms. ${errorMessageGuidance}`) }
        if (getFormsData === null) { throw new Error(`Data was not able to be returned when calling getForms. ${errorMessageGuidance}`) }
        if (getFormsData.length != 1) { throw new Error(`The Individual Record could not be found. ${errorMessageGuidance}`) }

        let foundData = getFormsData[0];

        FormInfo = {
            "First Name": foundData["first Name"],
            "Last Name": foundData["last Name"],
            "Middle Name": foundData["middle Name"],
            "Suffix": foundData['suffix'],
            "AKA": foundData["aka"],
            //Same Address Field
            "Same Address": foundData["same Address"],
            //Mailing Address Fields
            "Street": foundData["street"],
            "Street1": foundData["street1"],
            "Street2": foundData["street2"],
            "City": foundData["city"],
            "State": foundData["state"],
            "Zip Code": foundData["zip Code"],
            "Country": foundData["country"],
            "County": foundData["country"],
            //Physical Address Fields
            "Physical Street 1": foundData["physical Street"],
            "Physical Street 2": foundData["physical Street1"],
            "Physical Street 3": foundData["physical Street2"],
            "Physical City": foundData["physical City"],
            "Physical State": foundData["physical State"],
            "Physical Zip Code": foundData["physical Zip Code"],
            "Physical Country": foundData["physical Country"],
            "Physical County": foundData["physical County"],
            //End Address Fields
            "SSN": foundData["ssn"],
            "Has SSN": foundData["has SSN"],
            "US Citizen": foundData["uS Citizen"],
            "Alien Registration Number": foundData["alien Registration Number"],
            "I94": foundData["i94"],
            "Primary Phone Number": foundData["primary Phone Number"],
            "Secondary Phone Number": foundData["secondary Phone Number"],
            "Primary Phone Type": foundData["primary Phone Type"],
            "Secondary Phone Type": foundData["secondary Phone Type"],
            "OptIn": foundData["optIn"],
            //"Prior Practice Phone Number": foundData["Prior Practice Phone Number"],
            //"Prior Practice Phone Type": foundData["Prior Practice Phone Type"],
            "Email Address": foundData["email Address"],
            "Form ID": foundData["form ID"],
            "Date of Birth": moment(foundData["date of Birth"]).toISOString(),
            "Place of Birth": foundData["place of Birth"],
            "County": foundData["county"],
            "Work Phone Number": foundData["work Phone Number"],
            "Business Name": foundData["business Name"],
            // This field shows the Individual Record ID
            "Instance Name": foundData["instanceName"]
        }

        outputCollection[0] = 'Success'
        outputCollection[1] = 'Individual Record found.'
        outputCollection[2] = FormInfo
    } catch (error) {
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
