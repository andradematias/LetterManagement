const { query } = require('winston');
var logger = require('../log');
var moment = require('moment-timezone');

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
     Customer:      Nebraska, DHHS
     Purpose:       The purpose of this process is to create and add a new facility.
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
     Last Rev Date: 08/18/21
     Revision Notes:
     08/18/21 - Alex Rhee: Script created
     1/12/2022 - Fabian Montero: Updated send date to be UTC ISO String
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

    /****************
     Script Variables
    *****************/
    let outputCollection = [];
    let errorLog = [];
    let EmailArray = [];

    try {

        /****************
         Helper Functions
        *****************/
        // Check if field object has a value property and that value is truthy before returning value.
        function getFieldValueByName(fieldName, isOptional) {
            try {
                let fieldObj = ffCollection.getFormFieldByName(fieldName);
                let fieldValue = fieldObj && (fieldObj.hasOwnProperty('value') ? fieldObj.value : null);

                if (fieldValue === null && !isOptional) {
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
        let RevisionID = getFieldValueByName('REVISIONID');
        let OrganizationID = getFieldValueByName('Organization ID', true);
        let IndividualID = getFieldValueByName('Individual ID', true);
        let LicenseApplicationID = getFieldValueByName('License Application ID', true);
        let DisciplinaryID = getFieldValueByName('Disciplinary Event ID', true);
        let FacilityID = getFieldValueByName('Facility ID', true);
        let LicenseID = getFieldValueByName('License Details ID', true);
        let LetterHTML = getFieldValueByName('Letter HTML');
        let Subject = getFieldValueByName('Subject of Template');
        let Recipient = getFieldValueByName('Recipient Email', true);
        //let Tokens = getFieldValueByName('Tokens');
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
            orgEmployeeQuery = `[Organization ID] eq '${OrganizationID}' and ([Is Owner] eq 'True' or [Is Administrator] eq 'True')`;

            let orgEmployeeQueryObj = {
                q: orgEmployeeQuery,
                expand: true,
            };

            let getOrgEmployeeResp = await vvClient.forms.getForms(orgEmployeeQueryObj, OrganizationEmployeeTemplateID);
            getOrgEmployeeResp = JSON.parse(getOrgEmployeeResp);
            let getOrgEmployeeData = (getOrgEmployeeResp.hasOwnProperty('data') ? getOrgEmployeeResp.data : null);

            if (getOrgEmployeeResp.meta.status !== 200) { throw new Error(`There was an error when calling getForms. ${errorMessageGuidance}`) }
            if (getOrgEmployeeData === null) { throw new Error(`Data was not able to be returned when calling getForms. ${errorMessageGuidance}`) }
            if (getOrgEmployeeData.length > 0) {
                for (const rec of getOrgEmployeeData) {
                    if (EmailArray.indexOf(rec['employee Email']) < 0) {
                        EmailArray.push(rec['employee Email']);
                    }
                }
            }
        }

        if (FacilityID) {
            facEmployeeQuery = `[Facility ID] eq '${FacilityID}' and ([Is Owner] eq 'True' or [Is Administrator] eq 'True')`;

            let facEmployeeQueryObj = {
                q: facEmployeeQuery,
                expand: true,
            };

            let getFacEmployeeResp = await vvClient.forms.getForms(facEmployeeQueryObj, FacilityEmployeeTemplateID);
            getFacEmployeeResp = JSON.parse(getFacEmployeeResp);
            let getFacEmployeeData = (getFacEmployeeResp.hasOwnProperty('data') ? getFacEmployeeResp.data : null);

            if (getFacEmployeeResp.meta.status !== 200) { throw new Error(`There was an error when calling getForms. ${errorMessageGuidance}`) }
            if (getFacEmployeeData === null) { throw new Error(`Data was not able to be returned when calling getForms. ${errorMessageGuidance}`) }
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


        //Step 3. Create the communication log
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

        let postFormsTaskResp = await vvClient.scripts.runWebService('LibFormUpdateorPostandRelateForm', updateObj);
        let postFormsTaskData = (postFormsTaskResp.hasOwnProperty('data') ? postFormsTaskResp.data : null);

        if (postFormsTaskResp.meta.status !== 200) {
            throw new Error(`An error was encountered when attempting to create the ${ChecklistTaskTemplateID} record. 
                    (${postFormsTaskResp.hasOwnProperty('meta') ? postFormsTaskResp.meta.statusMsg : postFormsTaskResp.message})`)
        }
        if (!postFormsTaskData) {
            throw new Error(`Data was not returned when calling postForms.`)
        }

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