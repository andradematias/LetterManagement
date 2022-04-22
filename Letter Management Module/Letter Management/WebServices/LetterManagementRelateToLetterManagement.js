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
}
module.exports.main = async function (ffCollection, vvClient, response) {
    /*Script Name:   LetterManagementRelateToLetterManagement
     Customer:      Nebraska, DHHS
     Purpose:       The purpose of this process is to relate the current Letter Management form to records for which an ID is present in this form.
     Parameters:
     Return Array:
                    1. Status: 'Success', 'Minor Error', 'Error'
                    2.  Message
                        i. "Relevant forms have been related" if the forms were related 
     Psuedo code: 
                1. Get the IDs from the current Letter Management form
                2. If Individual ID is present, relate the current form to the Individual Record
                3. If Organization ID is present, relate the current form to the Organization Record
                4. If Facility ID is present, relate the current form to the Facility Information form
                5. If License Application ID is present, relate the current form to the License Application
                6. If License Details ID is present, relate the current form to the License Details form
                7. If Disciplinary Event ID is present, relate the current form to the Disciplinary or Licensure Event form
     Last Rev Date: 09/20/2021
     Revision Notes:
     09/20/2021 - Saesha Senger: Script created
     */

    logger.info('Start of the process LetterManagementRelateToLetterManagement at ' + Date());

    /****************
     Config Variables
    *****************/
    let errorMessageGuidance = 'Please try again, or contact a system administrator if this problem continues.';
    let missingFieldGuidance = 'Please provide a value for the missing field and try again, or contact a system administrator if this problem continues.';

    /****************
     Script Variables
    *****************/
    let outputCollection = [];
    let errorLog = [];

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

    try {


        /*********************
         Form Record Variables
        **********************/
        let RevisionID = getFieldValueByName('REVISIONID');
        let IndividualID = getFieldValueByName('Individual ID', true);
        let OrganizationID = getFieldValueByName('Organization ID', true);
        let FacilityID = getFieldValueByName('Facility ID', true);
        let LicenseApplicationID = getFieldValueByName('License Application ID', true);
        let LicenseDetailsID = getFieldValueByName('License Details ID', true);
        let DisciplinaryEventID = getFieldValueByName('Disciplinary Event ID', true);
        let respArray = [];

        /****************************
         Unused Form Record Variables
        *****************************/

        // Specific fields are detailed in the errorLog sent in the response to the client.
        if (errorLog.length > 0) {
            throw new Error(`${missingFieldGuidance}`)
        }

        /****************
         BEGIN ASYNC CODE
        *****************/

        //Step 1. Relate current form to Individual Record if the ID is present
        if (IndividualID) {
            let relateResp1 = await vvClient.forms.relateFormByDocId(RevisionID, IndividualID);
            relateResp1 = JSON.parse(relateResp1)
            if (relateResp1.meta.status !== 200 && relateResp1.meta.status !== 404) { throw new Error(`There was an error when attempting to relate this record to the Individual Record. ${errorMessageGuidance}`) }
            respArray.push(relateResp1)
        }

        //Step 2. Relate current form to Organization Record if the ID is present
        if (OrganizationID) {
            let relateResp2 = await vvClient.forms.relateFormByDocId(RevisionID, OrganizationID);
            relateResp2 = JSON.parse(relateResp2)
            if (relateResp2.meta.status !== 200 && relateResp2.meta.status !== 404) { throw new Error(`There was an error when attempting to relate this record to the Organization Record. ${errorMessageGuidance}`) }
            respArray.push(relateResp2)
        }

        //Step 3. Relate current form to Facility Information if the ID is present
        if (FacilityID) {
            let relateResp3 = await vvClient.forms.relateFormByDocId(RevisionID, FacilityID);
            relateResp3 = JSON.parse(relateResp3)
            if (relateResp3.meta.status !== 200 && relateResp3.meta.status !== 404) { throw new Error(`There was an error when attempting to relate this record to the Facility Information record. ${errorMessageGuidance}`) }
            respArray.push(relateResp3)
        }

        //Step 4. Relate current form to License Application if the ID is present
        if (LicenseApplicationID) {
            let relateResp4 = await vvClient.forms.relateFormByDocId(RevisionID, LicenseApplicationID);
            relateResp4 = JSON.parse(relateResp4)
            if (relateResp4.meta.status !== 200 && relateResp4.meta.status !== 404) { throw new Error(`There was an error when attempting to relate this record to the License Application. ${errorMessageGuidance}`) }
            respArray.push(relateResp4)
        }

        //Step 5. Relate current form to License Details if the ID is present
        if (LicenseDetailsID) {
            let relateResp5 = await vvClient.forms.relateFormByDocId(RevisionID, LicenseDetailsID);
            relateResp5 = JSON.parse(relateResp5)
            if (relateResp5.meta.status !== 200 && relateResp5.meta.status !== 404) { throw new Error(`There was an error when attempting to relate this record to the License Details record. ${errorMessageGuidance}`) }
            respArray.push(relateResp5)
        }

        //Step 6. Relate current form to Disciplinary or Licensure Event if the ID is present
        if (DisciplinaryEventID) {
            let relateResp6 = await vvClient.forms.relateFormByDocId(RevisionID, DisciplinaryEventID);
            relateResp6 = JSON.parse(relateResp6)
            if (relateResp6.meta.status !== 200 && relateResp6.meta.status !== 404) { throw new Error(`There was an error when attempting to relate this record to the Disciplinary or Licensure Event record. ${errorMessageGuidance}`) }
            respArray.push(relateResp6)
        }

        //Return Array
        outputCollection[0] = "Success";
        outputCollection[1] = "Relevant forms have been related.";
        outputCollection[2] = respArray;
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
