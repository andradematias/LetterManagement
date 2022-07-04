const { query } = require('winston');
let logger = require('../log');
const moment = require('moment-timezone');

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
    /*Script Name:   LetterManagementSendEmail
    Customer:     
    Purpose:       The purpose of this process is to create a Communication Log.
    Parameters:
    Return Array:
                    1. Status: 'Success', 'Minor Error', 'Error'
                    2.  Message
                    i. 'User Created' if the user was created'
                    ii. 'User Disabled' if the user was already disabled
                    iii. 'User Exists' if the user already created and enabled
                    iv. If 'Minor Error', send back the minor error response.
                    3. Object with help text loaded up
    Psuedo code: 
                    1.  Create the facility form and relate it
                    2. Create the communication log
                    3. Return outputCollection Array
                    
    Revision Notes:
                    08/18/21 - Alex Rhee: Script created
                    1/12/2022 - Fabian Montero: Updated send date to be UTC ISO String
                    05/03/22 - Matías Andrade: Code refactoring.
    */

    logger.info('Start of the process LetterManagementSendEmail at ' + Date());

    /****************
     Config Variables
     *****************/
    let CommunicationLogTemplateID = 'Communications Log';
    let OrganizationEmployeeTemplateID = 'Organization Employees';
    let FacilityEmployeeTemplateID = 'Facility Employees';
    let errorMessageGuidance = 'Please try again or contact a system administrator if this problem continues.';
    let missingFieldGuidance = 'Please provide a value for the missing field and try again, or contact a system administrator if this problem continues.';
    let sendDate = new Date().toISOString();
    let IDToPass = "";

    /****************
     Script Variables
     *****************/
    let outputCollection = [];
    let errorLog = [];
    let EmailArray = [];

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

    function parseRes(vvClientRes) {
        /*
        Generic JSON parsing function
        Parameters:
                vvClientRes: JSON response from a vvClient API method
        */
        try {
            // Parses the response in case it's a JSON string
            const jsObject = JSON.parse(vvClientRes);
            // Handle non-exception-throwing cases:
            if (jsObject && typeof jsObject === "object") {
                vvClientRes = jsObject;
            }
        } catch (e) {
            // If an error ocurrs, it's because the resp is already a JS object and doesn't need to be parsed
        }
        return vvClientRes;
    }

    function checkMetaAndStatus(
        vvClientRes,
        shortDescription,
        ignoreStatusCode = 999
    ) {
        /*
        Checks that the meta property of a vvCliente API response object has the expected status code
        Parameters:
                vvClientRes: Parsed response object from a vvClient API method
                shortDescription: A string with a short description of the process
                ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkData(), make sure to pass the same param as well.
        */
        if (!vvClientRes.meta) {
            throw new Error(
                `${shortDescription} error. No meta object found in response. Check method call parameters and credentials.`
            );
        }

        const status = vvClientRes.meta.status;

        // If the status is not the expected one, throw an error
        if (status != 200 && status != 201 && status != ignoreStatusCode) {
            const errorReason =
                vvClientRes.meta.errors && vvClientRes.meta.errors[0]
                    ? vvClientRes.meta.errors[0].reason
                    : "unspecified";
            throw new Error(
                `${shortDescription} error. Status: ${vvClientRes.meta.status}. Reason: ${errorReason}`
            );
        }
        return vvClientRes;
    }

    function checkDataPropertyExists(
        vvClientRes,
        shortDescription,
        ignoreStatusCode = 999
    ) {
        /*
        Checks that the data property of a vvCliente API response object exists 
        Parameters:
                res: Parsed response object from the API call
                shortDescription: A string with a short description of the process
                ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkMeta(), make sure to pass the same param as well.
        */
        const status = vvClientRes.meta.status;

        if (status != ignoreStatusCode) {
            // If the data property doesn't exist, throw an error
            if (!vvClientRes.data) {
                throw new Error(
                    `${shortDescription} data property was not present. Please, check parameters and syntax. Status: ${status}.`
                );
            }
        }

        return vvClientRes;
    }

    try {

        /*********************
         Form Record Variables
        **********************/
        let RevisionID = getFieldValueByName('REVISIONID');
        let OrganizationID = getFieldValueByName('Organization ID', true);
        let IndividualID = getFieldValueByName('Individual ID', true);
        let DisciplinaryID = getFieldValueByName('Disciplinary Event ID', true);
        let FacilityID = getFieldValueByName('Facility ID', true);
        let LicenseID = getFieldValueByName('License Details ID', true);
        let LetterHTML = getFieldValueByName('Letter HTML');
        let Subject = getFieldValueByName('Subject of Template');
        let Recipient = getFieldValueByName('Recipient Email', true);
        let CommType = getFieldValueByName('Communication Type');

        if (LicenseID) {
            IDToPass = LicenseID;
        } else if (DisciplinaryID) {
            IDToPass = DisciplinaryID;
        } else if (OrganizationID) {
            IDToPass = OrganizationID;
        } else if (FacilityID) {
            IDToPass = FacilityID;
        } else if (IndividualID) {
            IDToPass = IndividualID;
        }

        // Specific fields are detailed in the errorLog sent in the response to the client.
        if (errorLog.length > 0) {
            throw new Error(`${missingFieldGuidance}`)
        }

        /****************
         BEGIN ASYNC CODE
        *****************/
        //Step 1. Find Organization Employees for admin/owner emails

        if (OrganizationID) {
            let orgEmployeeQuery = `[Organization ID] eq '${OrganizationID}' and ([Is Owner] eq 'True' or [Is Administrator] eq 'True')`;

            let orgEmployeeQueryObj = {
                q: orgEmployeeQuery,
                expand: true,
            };

            let getOrgEmployeeResp = await vvClient.forms.getForms(orgEmployeeQueryObj, OrganizationEmployeeTemplateID)
                .then((res) => parseRes(res))
                .then((res) => checkMetaAndStatus(res, `There was an error when calling getForms. ${errorMessageGuidance}`))
                .then((res) => checkDataPropertyExists(res, `Data was not able to be returned when calling getForms. ${errorMessageGuidance}`));

            let getOrgEmployeeData = (getOrgEmployeeResp.hasOwnProperty('data') ? getOrgEmployeeResp.data : null);

            if (getOrgEmployeeData.length > 0) {
                for (const rec of getOrgEmployeeData) {
                    if (EmailArray.indexOf(rec['employee Email']) < 0) {
                        EmailArray.push(rec['employee Email']);
                    }
                }
            }
        }

        if (FacilityID) {
            let facEmployeeQuery = `[Facility ID] eq '${FacilityID}' and ([Is Owner] eq 'True' or [Is Administrator] eq 'True')`;

            let facEmployeeQueryObj = {
                q: facEmployeeQuery,
                expand: true,
            };

            let getFacEmployeeResp = await vvClient.forms.getForms(facEmployeeQueryObj, FacilityEmployeeTemplateID)
                .then((res) => parseRes(res))
                .then((res) => checkMetaAndStatus(res, `There was an error when calling getForms. ${errorMessageGuidance}`))
                .then((res) => checkDataPropertyExists(res, `Data was not able to be returned when calling getForms. ${errorMessageGuidance}`));

            let getFacEmployeeData = (getFacEmployeeResp.hasOwnProperty('data') ? getFacEmployeeResp.data : null);

            if (getFacEmployeeData.length > 0) {
                for (const rec of getFacEmployeeData) {
                    if (EmailArray.indexOf(rec['employee Email']) < 0) {
                        EmailArray.push(rec['employee Email']);
                    }
                }
            }
        }

        if (EmailArray.indexOf(Recipient) < 0) {
            EmailArray.push(Recipient);
        }


        //Step 2. Create the communication log
        let fieldsObject = {
            'Email Body': LetterHTML,
            'Primary Record ID': IDToPass,
            'Subject': Subject,
            'Communication Type': CommType,
            'Email Recipients': EmailArray.join(),
            'Email Type': 'Immediate Send',
            'Approved': 'Yes',
            'Scheduled Date': sendDate,
            'Communication Type Filter': 'Send New',
            'Form Saved': 'True'
        }

        let updateObj = [
            { name: 'REVISIONID', value: RevisionID },
            { name: 'ACTION', value: 'Post' },
            { name: 'TARGETTEMPLATENAME', value: CommunicationLogTemplateID },
            { name: 'UPDATEFIELDS', value: fieldsObject }
        ];

        let postFormsTaskResp = await vvClient.scripts.runWebService('LibFormUpdateorPostandRelateForm', updateObj)
            .then((res) => checkMetaAndStatus(res, `There was an error when calling LibFormUpdateorPostandRelateForm. ${errorMessageGuidance}`))
            .then((res) => checkDataPropertyExists(res, `Data was not able to be returned when calling LibFormUpdateorPostandRelateForm. ${errorMessageGuidance}`));

        let postFormsTaskData = (postFormsTaskResp.hasOwnProperty('data') ? postFormsTaskResp.data : null);

        if (IDToPass) {
            let relateResp = await vvClient.forms.relateFormByDocId(postFormsTaskData[2].revisionId, IDToPass);
            relateResp = JSON.parse(relateResp)
            if (relateResp.meta.status !== 200 && relateResp.meta.status !== 404) {
                throw new Error(`There was an error when attempting to relate this record to the Organization Record ${errorMessageGuidance}`)
            }
        }

        //Return Array
        outputCollection[0] = "Success";
        outputCollection[1] = "Facility found.";
        outputCollection[2] = postFormsTaskData[2].revisionId;

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
