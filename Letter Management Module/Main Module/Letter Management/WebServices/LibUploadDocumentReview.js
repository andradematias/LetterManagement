const { query } = require('winston');
let logger = require('../log');

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
    /*Script Name:   LibUploadDocumentReview
     Customer:      
     Purpose:       The purpose of this process is to find documents uploaded by the applicant or on the applicant's behalf.
     Parameters:
                    1. REVISIONID – (string) The revision ID of the calling form
                    2. Target Form ID – (string) The Form ID of the form whose related documents we want to pull in
                    3. Individual ID (string) - The ID of the individual
                    4. Form ID (string) - The Form ID of the calling form
     Return Array:
                    1. Status: 'Success', 'Error'
                    2.  Message
                        i. 'Related Documents Returned' if the process was successful
     Psuedo code: 
                1. Depending on the passed params, get either the documents strictly related to the form or the documents in the individual's upload folder
     Last Rev Date: 04/11/2022
     Revision Notes:
     10/18/2021 - Saesha Senger: Script created
     11/17/2021 - John Sevilla: Add optional params to only show docs related to a given form
     12/8/2021 - John Sevilla: Make Individual ID and UploadFolder conditionally required
     1/05/2022 - Fabian Montero: Added call to web service which adds view permissions for applicant to their folder if the individual ID is available.
     3/03/2022 - John Sevilla: Removed ability to view all documents in the individual's folder and made it so you can target the related documents of a form record
     4/11/2022 - John Sevilla: Update getTemplateNameFromID
     */

    logger.info('Start of the process LibUploadDocumentReview at ' + Date());

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
    let FormPrefixToTemplateNameMap = null;

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

    function getFormPrefix(formID) {
        let prefixReg = /^([A-Za-z-]+)-\d+$/; // gets the prefix of the form (e.g. 'EDUCATION-HISTORY' in 'EDUCATION-HISTORY-00000125')
        let formPrefix = '';
        try {
            formPrefix = prefixReg.exec(formID)[1];
        } catch (error) {
            logger.error('Unable to parse form prefix for: "' + formID + '"');
            logger.error(error);
        } finally {
            return formPrefix;
        }
    }

    async function getTemplateNameFromID(formID) {
        let formPrefix = getFormPrefix(formID);
        if (!formPrefix) {
            throw new Error(`Unable to get prefix of ${formID}!`);
        }
        formPrefix += '-'; // add trailing dash since that is what FormTemplatePrefixList returns

        if (FormPrefixToTemplateNameMap === null) { // global map to avoid querying several times
            FormPrefixToTemplateNameMap = {};
            let queryResp = await vvClient.customQuery.getCustomQueryResultsByName('FormTemplatePrefixList', null)
            queryResp = JSON.parse(queryResp);
            if (queryResp.meta.status !== 200) { throw new Error(`There was an error when calling the FormTemplatePrefixList custom query. ${errorMessageGuidance}`) }
            let querySearchData = (queryResp.hasOwnProperty('data') ? queryResp.data : null);
            if (querySearchData === null) { throw new Error(`Data was not able to be returned when calling the FormTemplatePrefixList custom query.`) }
            if (querySearchData.length < 1) { throw new Error(`Unable to get template names from query FormTemplatePrefixList`) }

            querySearchData.forEach(template => {
                FormPrefixToTemplateNameMap[template.prefix] = template.templateName;
            });
        }

        let templateName = FormPrefixToTemplateNameMap[formPrefix];
        if (!templateName) {
            throw new Error(`Unable to find template name for ${formID}!`)
        }

        return templateName;
    }

    try {

        /*********************
         Form Record Variables
        **********************/
        let RevisionID = getFieldValueByName('REVISIONID')?.trim();
        let TargetFormID = getFieldValueByName('Target Form ID')?.trim();
        let FormID = ffCollection.getFormFieldByName('Form ID')?.value?.trim();
        let IndividualID = FormID?.startsWith('IND-') ? FormID : getFieldValueByName('Individual ID')?.trim();

        // Specific fields are detailed in the errorLog sent in the response to the client.
        if (errorLog.length > 0) {
            throw new Error(`${missingFieldGuidance}`);
        }

        /****************
         BEGIN ASYNC CODE
        *****************/

        /*************************************************************************************************
         Attempt to add view permission to individual folder(s) for applicant, if it does not already have it.
         This will occur anytime this web service is called and an individual ID is available.
        **************************************************************************************************/
        if (!IndividualID) {
            let IndividualIDField = ffCollection.getFormFieldByName('Individual ID');
            if (IndividualIDField) {
                IndividualID = IndividualIDField?.value
            }
        }
        if (IndividualID) {
            const grantIndividualPermissionDataArray = [
                { name: "Individual ID", value: IndividualID }
            ];
            let grantIndividualPermissionResp = await vvClient.scripts.runWebService('LibGrantViewerPermissionToIndividualFolder', grantIndividualPermissionDataArray);
        }
        /************************************************************************************************/

        let documentData;
        let targetRevisionID = RevisionID;
        // get documents related to a target form
        if (TargetFormID && TargetFormID !== 'self') {
            let targetFormTemplateName = await getTemplateNameFromID(TargetFormID);

            // get revision id of target form
            let queryParams = {};
            queryParams.q = `[instanceName] eq '${TargetFormID}'`;
            queryParams.expand = false;

            let getFormsResp = await vvClient.forms.getForms(queryParams, targetFormTemplateName);
            getFormsResp = JSON.parse(getFormsResp);
            let getFormsData = (getFormsResp.hasOwnProperty('data') ? getFormsResp.data : null);

            if (getFormsResp.meta.status !== 200) { throw new Error(`There was an error when calling getForms on ${targetFormTemplateName}.`) }
            if (getFormsData === null) { throw new Error(`Data was not able to be returned when calling getForms on ${targetFormTemplateName}.`) }
            if (getFormsData.length > 0) {
                targetRevisionID = getFormsData[0].revisionId;
            }
        }

        // get documents related to the target form
        let relParams = {};
        relParams.q = '';
        relParams.indexFields = 'include';
        relParams.limit = '2000';
        let relatedDocumentsResp = await vvClient.forms.getFormRelatedDocs(targetRevisionID, relParams);
        relatedDocumentsResp = JSON.parse(relatedDocumentsResp);
        documentData = (relatedDocumentsResp.hasOwnProperty('data') ? relatedDocumentsResp.data : null);
        if (documentData === null) { throw new Error(`Data was not able to be returned when calling getFormRelatedDocs.`) }
        if (relatedDocumentsResp.meta.status !== 200 && relatedDocumentsResp.meta.status !== 404) {
            throw new Error(`An error was encountered when attempting retrive the form related documents. ${relatedDocumentsResp.meta.statusMsg}. ${errorMessageGuidance}`);
        }

        //Return Array
        outputCollection[0] = "Success";
        outputCollection[1] = "Related documents returned";
        outputCollection[2] = documentData;
    } catch (error) {
        console.log(error);
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