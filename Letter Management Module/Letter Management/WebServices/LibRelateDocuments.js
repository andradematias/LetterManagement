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
    /*Script Name:  LibDHHSRelateDocuments
    Customer:      NEDHHS
    Purpose:       The purpose of this process is to relate the documents related to the current form to any relevant license applications and the individual record
    Parameters:    REVISIONID (String, Required) - The revision id of the current form
                   LicenseApplicationRevID (String, Required) - The revision id of the license applications related to the current form
    Return Array:   
                    [0] Status: 'Success', 'Error'
                    [1] Message
    Pseudo code:   
                    1. Get current form's related docs
                    2. Get related forms to find relevant license applications
                    3. Relate the documents with the license application(s)
    
    Date of Dev: 02/09/2022
    Last Rev Date: 02/09/2022
    Revision Notes:
    02/09/2022  - Saesha Senger: Script created
    */

    logger.info('Beginning LibDHHSRelateDocuments on ' + Date());

    /****************
    Config Variables
    *****************/
    let IndRcdTemplateID = 'Individual Record';

    let errorMessageGuidance = 'Please try again or contact a system administrator if this problem continues.';
    let missingFieldGuidance = 'Please provide a value for the missing field(s).';

    /****************
    Script Variables
    *****************/
    let outputCollection = [];
    let errorLog = [];
    let minorErrors = [];

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
        let FormID = getFieldValueByName('Form ID');
        let LicenseAppID;
        if (!FormID.includes('NUR-HOM-FAC-INFO')) {
            LicenseAppID = getFieldValueByName('License Application ID', true);
        } else {
            LicenseAppID = getFieldValueByName('License ID', true);
        }
        let IndRcdRevID;
        let LicenseApplicationRevID;
        let LicenseApplicationRevIDs = [];
        // Specific fields are detailed in the errorLog sent in the response to the client.
        if (errorLog.length > 0) {
            throw new Error(`${missingFieldGuidance}`);
        }

        /****************
        BEGIN ASYNC CODE
        *****************/
        // 1. Get related documents
        let relParams = {};
        relParams.q = '';
        relParams.indexFields = 'include';
        relParams.limit = '2000';
        let relatedDocumentsResp = await vvClient.forms.getFormRelatedDocs(RevisionID, relParams);
        relatedDocumentsResp = JSON.parse(relatedDocumentsResp);
        let relatedDocumentsData = (relatedDocumentsResp.hasOwnProperty('data') ? relatedDocumentsResp.data : null);
        if (relatedDocumentsData === null) { throw new Error(`Data was not able to be returned when searching for related documents.`) }
        if (relatedDocumentsResp.meta.status !== 200 && relatedDocumentsResp.meta.status !== 404) {
            minorErrors.push(`An error was encountered when attempting retrieve associated documents. ${relatedDocumentsResp.meta.statusMsg}  ${errorMessageGuidance}`);
        }

        // 2. Get revision ID(s) of any relevant license application(s) -- using this method because the form could be related to an app via the 'add existing form' option on the license application
        // This will not return anything if the form is not opened via a FillInAndRelate from the license application, so it will not relate forms below.
        if (LicenseAppID) {
            let getRelated = await vvClient.forms.getFormRelatedForms(RevisionID, null);
            getRelated = JSON.parse(getRelated);
            let getRelatedData = (getRelated.hasOwnProperty('data') ? getRelated.data : null)
            if (getRelated.meta.status !== 200) {
                throw new Error(`Error encountered when searching for related forms. ${getRelated.meta.statusMsg}`)
            }
            if (!getRelated.hasOwnProperty('data')) {
                throw new Error('Data was not returned when searching for related forms.');
            }

            for (const getRelatedDataRec of getRelatedData) {
                if (getRelatedDataRec['instanceName'].includes('LICAPP')) {
                    LicenseApplicationRevID = getRelatedDataRec.revisionId;
                    LicenseApplicationRevIDs.push(LicenseApplicationRevID);
                }
            }

            // 4. Relate the document to the license application(s)
            for (const id of LicenseApplicationRevIDs) {
                for (const doc of relatedDocumentsResp.data) {
                    let relateDocumentResp = await vvClient.forms.relateDocument(id, doc.id);
                    relateDocumentResp = JSON.parse(relateDocumentResp);
                    if (relateDocumentResp.meta.status !== 200 && relateDocumentResp.meta.status !== 404) { logger.info(`Could not relate the document "${doc.name}".`) }
                }
            }
        }

        // 3. Get individual record's revision ID
        if (IndividualID) {
            let queryParams = {
                q: `[instanceName] eq '${IndividualID}'`,
            };

            let getFormsResp = await vvClient.forms.getForms(queryParams, IndRcdTemplateID);
            getFormsResp = JSON.parse(getFormsResp);
            let getFormsData = (getFormsResp.hasOwnProperty('data') ? getFormsResp.data : null);

            if (getFormsResp.meta.status !== 200) { errorLog.push(`Error encountered when searching for the individual record`); }
            if (!getFormsData || !Array.isArray(getFormsData)) { errorLog.push(`Data was not returned when calling getForms. ${errorMessageGuidance}`); }

            IndRcdRevID = getFormsData[0].revisionId;

            // 5. Relate the document to the individual record
            for (const doc of relatedDocumentsResp.data) {
                let relateDocumentResp = await vvClient.forms.relateDocument(IndRcdRevID, doc.id);
                relateDocumentResp = JSON.parse(relateDocumentResp);
                if (relateDocumentResp.meta.status !== 200 && relateDocumentResp.meta.status !== 404) { logger.info(`Could not relate the document "${doc.name}".`) }
            }
        }

        // send to client
        outputCollection[0] = 'Success';
        outputCollection[1] = 'Related document(s) to the relevant forms.'
    } catch (error) {
        // Log errors captured.
        logger.info(JSON.stringify(`${error} ${errorLog}`));
        outputCollection[0] = 'Error';
        outputCollection[1] = `${error.message} ${errorLog.join(' ')} `;
        outputCollection[2] = null;
        outputCollection[3] = errorLog;
    } finally {
        response.json(200, outputCollection);
    }
};