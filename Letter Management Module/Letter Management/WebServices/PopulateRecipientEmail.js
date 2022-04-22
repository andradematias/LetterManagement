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
    /*Script Name:   PopulateRecipientEmail
     Customer:      //
     Purpose:       The purpose of this process is to see if the requester has a registered email and return it in the outputCollection variable.
     Parameters:
     Return Array:
                    1. Status: 'Success', 'Minor Error', 'Error'
                    2.  Message
                        i. 'User Created' if the user was created'
                        ii. 'User Disabled' if the user was already disabled
                        iii. 'User Exists' if the user already created and enabled
                        iv. If 'Minor Error', send back the minor error response.
     Psuedo code: 
                1. The email of the requesting user is obtained
                2. Return of the email found
     Last Rev Date: 
     Revision Notes:
     04/22/2022 - Creation of the web service.
     */

    logger.info('Start of the process LetterManagementOnLoad at ' + Date());

    /****************
     Config Variables
    *****************/
    let missingFieldGuidance = 'Please provide a value for the missing field and try again, or contact a system administrator if this problem continues.';
    let relParams = {}
    relParams.indexFields = 'include';
    relParams.limit = '2000';
    let today = moment().tz('America/Chicago').format('L');

    /****************
     Script Variables
    *****************/
    let outputCollection = [];
    let errorLog = [];
    let shortDescription = "";
    let RecipientEmail = "";


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
        let FormTemplateName = getFieldValueByName('Form Template Name');
        let FormTemplateID = getFieldValueByName('Form Template ID');


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

        //Step 1. The email of the requesting user is obtained.
        const getFormsParams = {
            q: `[form ID] eq '${FormTemplateID}'`,
            expand: true, // true to get all the form's fields
            // fields: 'id,name', // to get only the fields 'id' and 'name'
        };

        const getFormsRes = await vvClient.forms
            .getForms(getFormsParams, FormTemplateName)
            .then((res) => parseRes(res))
            .then((res) => checkMetaAndStatus(res, shortDescription))
            .then((res) => checkDataPropertyExists(res, shortDescription));

        if (getFormsRes.data.length !== 0) {
            RecipientEmail = getFormsRes.data[0]["email Address"];
        }

        //Step 2. Return of the email found
        outputCollection[0] = "Success";
        outputCollection[1] = RecipientEmail;

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
