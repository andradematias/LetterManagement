const { query } = require('winston');
var logger = require('../log');
var moment = require('moment-timezone');
//const { IoT1ClickProjects } = require('aws-sdk');

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
    /*Script Name:   LetterManagementRetrieveUserInfo
     Customer:      
     Purpose:       The purpose of this process is to see if the applicant has a proof of legal residence form.
     Parameters:
     Return Array:
                    1. Status: 'Success', 'Minor Error', 'Error'
                    2.  Message
                        i. 'User Created' if the user was created'
                        ii. 'User Disabled' if the user was already disabled
                        iii. 'User Exists' if the user already created and enabled
                        iv. If 'Minor Error', send back the minor error response.
     Psuedo code: 
                1. Get the Site associated with this user
                2. Get the user information based off the login user
                3. Call GetForms to get the Individual Record if the ID is present
                4. Call getforms to pull in the CMO/Deputy Director information from the Licensure Leadership Lookup Form
                5. The responses object is constructed.
                5. Return Array
     Last Rev Date: 09/17/2021
     Revision Notes:
     09/17/2021 - Alex Rhee: Script created
     12/07/2021 - Miroslav Sanader: Update script to include deficiency text instead of task name if present
     03/23/2022 - The web service has been updated to make it easier to integrate into a new project.
     */

    logger.info('Start of the process LetterManagementOnLoad at ' + Date());

    /****************
     Config Variables
    *****************/
    let errorMessageGuidance = 'Please try again, or contact a system administrator if this problem continues.';
    let missingFieldGuidance = 'Please provide a value for the missing field and try again, or contact a system administrator if this problem continues.';
    let IndividualRecordTemplateID = 'Individual Record';
    let LeadershipLookupID = 'Licensure Leadership Lookup';
    let relParams = {}
    relParams.indexFields = 'include';
    relParams.limit = '2000';
    let today = moment().tz('America/Chicago').format('L');

    /****************
     Script Variables
    *****************/
    let outputCollection = [];
    let errorLog = [];
    let arrayOfResponses = [];
    let UserInfo;
    let IndividualInfo;
    let LeaderInfo;
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

    // Creates a formatted HTML string of the JSON objects for easy review
    function getFormattedKeyValue(entrySet) {
        let user = entrySet;
        for (const [key, value] of Object.entries(entrySet)) {
            user[key] = formatDate(value);
        }
        return user
    }

    //Set prefix on the keys for a dataset
    function prefixDataKeys(keyPrefix, dataSet) {
        let UserKeys = {};
        for (let elem of Object.keys(dataSet)) {
            let newName = `${keyPrefix} ` + "- " + elem;
            UserKeys[elem] = newName;
        }

        return renameKeys(dataSet, UserKeys)
    }

    //Rename keys of an object
    function renameKeys(obj, newKeys) {
        const keyValues = Object.keys(obj).map(key => {
            const newKey = newKeys[key] || key;
            return { [newKey]: obj[key] };
        });
        return Object.assign({}, ...keyValues);
    }

    //Format returned dates
    function formatDate(value) {
        let returnVal = value;
        let regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?/i;
        if (regex.test(value)) {
            returnVal = `${value.substring(5, 7)}/${value.substring(8, 10)}/${value.substring(0, 4)}`
        }

        return returnVal;
    }

    //Run Form Query
    async function runFormQuery(formQueryObj, formTemplateID) {
        let getFormResp = await vvClient.forms.getForms(formQueryObj, formTemplateID);
        getFormResp = JSON.parse(getFormResp);
        let formData = (getFormResp.hasOwnProperty('data') ? getFormResp.data : null);

        if (getFormResp.meta.status !== 200) { throw new Error(`There was an error when calling getForms. ${errorMessageGuidance}`) }
        if (formData === null) { throw new Error(`Data was not able to be returned when calling getForms. ${errorMessageGuidance}`) }

        return formData;
    }

    //Retrieve Form Instance Data
    async function getFormInstanceData(instanceID, formTemplateID) {
        let formQuery = `[instanceName] eq '${instanceID}'`;

        let formQueryObj = {
            q: formQuery,
            expand: true,
        };

        return await runFormQuery(formQueryObj, formTemplateID);
    }

    //Retrieve All Form Data
    async function getAllFormData(formTemplateID) {

        let formQueryObj = {
            q: "",
            expand: true,
        };

        return await runFormQuery(formQueryObj, formTemplateID);
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

    function checkDataIsNotEmpty(
        vvClientRes,
        shortDescription,
        ignoreStatusCode = 999
    ) {
        /*
        Checks that the data property of a vvCliente API response object is not empty
        Parameters:
                res: Parsed response object from the API call
                shortDescription: A string with a short description of the process
                ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkMeta(), make sure to pass the same param as well.
        */
        const status = vvClientRes.meta.status;

        if (status != ignoreStatusCode) {
            const dataIsArray = Array.isArray(vvClientRes.data);
            const dataIsObject = typeof vvClientRes.data === "object";
            const isEmptyArray = dataIsArray && vvClientRes.data.length == 0;
            const isEmptyObject =
                dataIsObject && Object.keys(vvClientRes.data).length == 0;

            // If the data is empty, throw an error
            if (isEmptyArray || isEmptyObject) {
                throw new Error(
                    `${shortDescription} returned no data. Please, check parameters and syntax. Status: ${status}.`
                );
            }
            // If it is a Web Service response, check that the first value is not an Error status
            if (dataIsArray) {
                const firstValue = vvClientRes.data[0];

                if (firstValue == "Error") {
                    throw new Error(
                        `${shortDescription} returned an error. Please, check called Web Service. Status: ${status}.`
                    );
                }
            }
        }
        return vvClientRes;
    }

    try {

        /*********************
         Form Record Variables
        **********************/
        let IndividualID = getFieldValueByName('Individual ID', true);
        let UserID = getFieldValueByName('USERID');

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

        //Step 1. Get the Site associated with this user
        let siteParams = {
            q: `name eq 'Home'`,
            fields: `id,name,enabled`
        };

        let getSites = await vvClient.sites.getSites(siteParams)
            .then((res) => parseRes(res))
            .then((res) => checkMetaAndStatus(res, shortDescription))
            .then((res) => checkDataPropertyExists(res, shortDescription))
            .then((res) => checkDataIsNotEmpty(res, shortDescription));

        if (getSites.data.length > 1) { throw new Error(`Multiple sites found for Home. Please contact support.`); }


        //Step 2. Get the user information based off the login user
        let userParam = {
            q: `id eq '${UserID}'`
        };
        let siteID = getSites.data[0].id;
        let getUser = await vvClient.users.getUsers(userParam, siteID)
            .then((res) => parseRes(res))
            .then((res) => checkMetaAndStatus(res, shortDescription))
            .then((res) => checkDataPropertyExists(res, shortDescription))
            .then((res) => checkDataIsNotEmpty(res, shortDescription));

        UserInfo = getFormattedKeyValue(getUser.data[0]);
        UserInfo = prefixDataKeys("State Staff", getUser.data[0]);

        if (getUser.data[0]["middleInitial"]) {
            UserInfo["State Staff - Full name"] = `${getUser.data[0]["firstName"]} ${getUser.data[0]["middleInitial"]} ${getUser.data[0]["lastName"]}`
        } else {
            UserInfo["State Staff - Full name"] = `${getUser.data[0]["firstName"]} ${getUser.data[0]["lastName"]}`
        }

        UserInfo["State Staff - Full name"] = UserInfo["State Staff - Full name"].trim();

        //Step 3. Call GetForms to get the Individual Record if the ID is present
        if (IndividualID) {

            let getIndividualData = await getFormInstanceData(IndividualID, IndividualRecordTemplateID)
                .then((res) => parseRes(res))
                .then((res) => checkMetaAndStatus(res, shortDescription))
                .then((res) => checkDataPropertyExists(res, shortDescription))
                .then((res) => checkDataIsNotEmpty(res, shortDescription));

            if (getIndividualData.length > 0) {
                IndividualInfo = getIndividualData[0];
                IndividualInfo["Individual ID"] = IndividualID;

                if (getIndividualData[0]["middle Name"]) {
                    IndividualInfo["Full Name"] = ` - ${getIndividualData[0]["first Name"]} ${getIndividualData[0]["middle Name"]} ${getIndividualData[0]["last Name"]}`
                } else {
                    IndividualInfo["Full Name"] = ` - ${getIndividualData[0]["first Name"]} ${getIndividualData[0]["last Name"]}`
                }
                IndividualInfo["Full Name"] = IndividualInfo["Full Name"].trim();
                RecipientEmail["email"] = getIndividualData[0]["email Address"];
            }

            IndividualInfo = getFormattedKeyValue(IndividualInfo);
            IndividualInfo = prefixDataKeys("Individual Record", IndividualInfo);
        }

        //Step 4. Call getforms to pull All information from the Licensure Leadership Lookup table
        //Note this one looks different because we are interested in more than one record
        LeaderInfo = {};
        LeaderInfo["Current Date"] = today;
        let getLeadershipLookup = await getAllFormData(LeadershipLookupID)
            .then((res) => parseRes(res))

        if (getLeadershipLookup.length > 0) {
            for (const rec of getLeadershipLookup) {
                if ('Enabled' == rec["enabled"]) {
                    let prefix = rec['prefix'];
                    LeaderInfo = Object.assign(LeaderInfo, prefixDataKeys(prefix, rec));

                    if (rec["middle Name"]) {
                        LeaderInfo[prefix + " - Full Name"] = `${rec["first Name"]} ${rec["middle Name"]} ${rec["last Name"]}`
                    } else {
                        LeaderInfo[prefix + " - Full Name"] = `${rec["first Name"]} ${rec["last Name"]}`
                    }


                    LeaderInfo = getFormattedKeyValue(LeaderInfo);
                }
            }
        }

        //Step 5. The responses object is constructed
        arrayOfResponses = [
            {
                name: "State Staff",
                value: UserInfo
            },
            {
                name: "Job Leadership",
                value: LeaderInfo
            },
            {
                name: "Individual Info",
                value: IndividualInfo
            },
            {
                name: "Recipient Email",
                value: RecipientEmail
            }
        ]

        //Step 5. Return Array
        outputCollection[0] = "Success";
        outputCollection[1] = arrayOfResponses;

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
