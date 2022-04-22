const { query } = require('winston');
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
    /*Script Name:   IndividualRecordVerifyUniqueNoEmail
     Customer:      Nebraska, DHHS
     Purpose:       The purpose of this process is to allow user to create an account using a public record of the Individual Record form when the email address is not present on the form.
     Parameters:
     Return Array:
                    1. Status: 'Success', 'Minor Error', 'Error'
                    2.  Message
                        i. 'User Created' if the user was created'
                        ii. 'User Disabled' if the user was already disabled
                        iii. 'User Exists' if the user already created and enabled
                        iv. If 'Minor Error', send back the minor error response.
     Psuedo code: 
                1. Call GetForms on the Individual Record and query on the SSN, I94, and/or Alien Registration Number.
                    a. If the applicant is a US Citizen then also query on their SSN.
     Last Rev Date: 02/23/2022
     Revision Notes:
     01/18/2021 - Alex Rhee: Script created
     03/22/2021 - Alex Rhee: Fixed verify logic
     07/21/2021 - John Sevilla: Add baseURL variable and url to duplicate credentials error
     09/23/2021 - Saesha Senger: Revise script to remove email address
     02/23/2022 - John Sevilla: Update to make US Citizen optional
     */

    logger.info('Start of the process IndividualRecordVerifyUniqueNoEmail at ' + Date());

    /****************
     Config Variables
    *****************/
    let IndividualRecordTemplateID = 'Individual Record';
    let errorMessageGuidance = 'Please try again or contact a system administrator if this problem continues.'
    let missingFieldGuidance = 'Please provide a value for the missing field and try again, or contact a system administrator if this problem continues.'

    // Server-independent base app url
    let baseURL = `${vvClient.getBaseUrl()}/app/${module.exports.getCredentials().customerAlias}/${module.exports.getCredentials().databaseAlias}/`;


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
        /*********************
         Form Record Variables
        **********************/
        let Citizen = getFieldValueByName('US Citizen', true);
        let SSN = getFieldValueByName('SSN', true);
        let I94 = getFieldValueByName('I94', true);
        let AlienRegNumber = getFieldValueByName('Alien Registration Number', true);
        let FormID = getFieldValueByName('Form ID');

        // Specific fields are detailed in the errorLog sent in the response to the client.
        if (errorLog.length > 0) {
            throw new Error(`${missingFieldGuidance}`)
        }

        /****************
         BEGIN ASYNC CODE
        *****************/

        //Step 1. Call GetForms on the Individual Record and query on the SSN, I94, and/or the Alien Registration Number
        if (Citizen == "Yes") {
            verifQuery = `[SSN] eq '${SSN}'`;
        }
        else {
            if (I94 && AlienRegNumber) {
                verifQuery = `[I94] eq '${I94}' or [Alien Registration Number] eq '${AlienRegNumber}'`;
            } else if (I94) {
                verifQuery = `[I94] eq '${I94}'`;
            } else if (AlienRegNumber) {
                verifQuery = `[Alien Registration Number] eq '${AlienRegNumber}'`;
            } else if (SSN) {
                verifQuery = `[SSN] eq '${SSN}'`; //Brian Added Still need to check SSN if Non Citizen.
            } else {
                verifQuery = '';
            }
        }

        if (verifQuery != '') {
            let verifQueryObj = {
                q: verifQuery,
                expand: true
            };

            let getFormsResp = await vvClient.forms.getForms(verifQueryObj, IndividualRecordTemplateID);
            getFormsResp = JSON.parse(getFormsResp);
            let getFormsData = (getFormsResp.hasOwnProperty('data') ? getFormsResp.data : null);

            if (getFormsResp.meta.status !== 200) { throw new Error(`There was an error when searching for a duplicate individual record. ${errorMessageGuidance}`) }
            if (getFormsData === null) { throw new Error(`Data was not able to be returned when searching for a duplicate individual record.. ${errorMessageGuidance}`) }
            if (getFormsData.length != 0) {
                if (getFormsData[0]["form ID"] != FormID) {
                    throw new Error(`A Record for this user already exists in the system. Please make any corrections, or open the existing users record to continue.`)
                }
            }
        }

        outputCollection[0] = "Success";
        outputCollection[1] = "Individual Record is unique"
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
