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
    /*Script Name:   IndividualRecordVerifyUniqueUserCheck
     Customer:      Nebraska, DHHS
     Purpose:       The purpose of this process is to allow user to create an account using a public record ofthe Indivdual Record form.
     Parameters:
     Return Array:
                    1. Status: 'Success', 'Minor Error', 'Error'
                    2.  Message
                        i. 'User Created' if the user was created'
                        ii. 'User Disabled' if the user was already disabled
                        iii. 'User Exists' if the user already created and enabled
                        iv. If 'Minor Error', send back the minor error response.
     Psuedo code: 
                1. Call LibFormDuplicatePersonChecking which uses Soundex to find similar names by sound, as pronounced in English. 
                2. Call GetForms on the Individual Record and query on the First Name, Last Name, Email.
                    a. If the applicant is a US Citizen then also query on their SSN.
     Last Rev Date: 02/23/2022
     Revision Notes:
     01/18/2021 - Alex Rhee: Script created
     03/22/2021 - Alex Rhee: Fixed verify logic
     05/12/2021 - Alex Rhee: Updated with duplicate name checking and legacy account creation logic
     07/21/2021 - John Sevilla: Add baseURL variable and url to duplicate credentials error
     12/15/2021 - Eric Oyanadel: update [form ID]'s with [instanceName]
     02/23/2022 - John Sevilla: Update to make DOB and US Citizen optional
     */

    logger.info('Start of the process IndividualRecordVerifyUniqueUserCheck at ' + Date());

    /****************
     Config Variables
    *****************/
    let IndividualRecordTemplateID = 'Individual Record'
    let SiteName = 'Home';
    let NewUserEmailTemplate = 'New Account';
    let emailNotificationTemplateID = 'Email Notification Lookup'
    let GroupList = '';
    let errorMessageGuidance = 'Please try again or contact a system administrator if this problem continues.'
    let missingFieldGuidance = 'Please provide a value for the missing field and try again, or contact a system administrator if this problem continues.'

    //The name of the custom query in Default queries (NOT in form data queries)
    var userQueryName = 'User Lookup';

    // Query names used in call to LibFormDuplicatePersonChecking.
    let soundexQueryName = 'zWebSvc Individual Soundex Query'
    let soundexSearchQueryName = 'zWebSvc Individual Search Query'

    // Field names used in call to LibFormDuplicatePersonChecking that correspond to field names on Individual Record.
    let firstNameFieldName = 'first Name'
    let lastNameFieldName = 'last Name'

    // Email Template Variables for sending email.
    let emailTemplateName = 'Legacy Account Found'
    let duplicateEmailTemplateName = 'Duplicate Match Without Email'

    let TokenEmailAddress = '[Email Address]'
    let TokenFormID = '[Form ID]'

    // Server-independent base app url
    let baseURL = `${vvClient.getBaseUrl()}/app/${module.exports.getCredentials().customerAlias}/${module.exports.getCredentials().databaseAlias}/`;

    /****************
     Script Variables
    *****************/
    let outputCollection = [];
    let errorLog = [];
    var continueVerify = true;
    let manyDuplicates = false;
    let emailSubject = '';
    let emailBody = '';
    let recordID;
    var processDone = false;

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
        let FirstName = getFieldValueByName('First Name');
        let LastName = getFieldValueByName('Last Name');
        let MiddleName = getFieldValueByName('Middle Name', true);
        let AKA = getFieldValueByName('AKA', true);
        let EmailAddress = getFieldValueByName('Email Address');
        let Citizen = getFieldValueByName('US Citizen', true);
        let SSN = getFieldValueByName('SSN', true);
        let DOB = getFieldValueByName('Date of Birth', true);
        let FormID = getFieldValueByName('Form ID');
        let I94 = getFieldValueByName('I94', true);
        let AlienRegNumber = getFieldValueByName('Alien Registration Number', true);
        let baseURL = getFieldValueByName('baseURL')

        // Specific fields are detailed in the errorLog sent in the response to the client.
        if (errorLog.length > 0) {
            throw new Error(`${missingFieldGuidance}`)
        }

        /****************
         BEGIN ASYNC CODE
        *****************/

        // STEP 1 - Call LibFormDuplicatePersonChecking which uses Soundex to find similar names by sound, as pronounced in English. 
        let personCheckObject = [
            {
                name: 'PersonObject', value: {
                    'firstname': FirstName,
                    'lastname': LastName,
                    'mi': MiddleName,
                    'aka': AKA,
                    'otheridquery': `[AKA] eq '${FirstName}' and [Last Name] eq '${LastName}'`,
                    'secondotheridquery': `[First Name] eq '${FirstName}' and [AKA] eq '${LastName}'`
                }
            },
            { name: 'SoundexQueryName', value: soundexQueryName },
            { name: 'SoundexWhereClause', value: `(SOUNDEX([Last Name]) = SOUNDEX('${LastName}') and (SOUNDEX([First Name]) = SOUNDEX('${FirstName}') or SOUNDEX([First Name]) = SOUNDEX('${AKA}'))) or (SOUNDEX([First Name]) = SOUNDEX('${FirstName}') and (SOUNDEX([Last Name]) = SOUNDEX('${LastName}') or SOUNDEX([Last Name]) = SOUNDEX('${AKA}')))` },
            { name: 'SearchQueryName', value: soundexSearchQueryName },
            { name: 'NameOfFirstNameField', value: firstNameFieldName },
            { name: 'NameOfLastNameField', value: lastNameFieldName }
        ]

        console.log(personCheckObject);

        let personCheckResp = await vvClient.scripts.runWebService('LibFormDuplicatePersonChecking', personCheckObject);
        let personCheckData = (personCheckResp.hasOwnProperty('data') ? personCheckResp.data : null);

        if (personCheckData) {

            if (personCheckResp.meta.status != 200) {
                //throw new Error(`An error was returned when updating the user account.`)
                console.log(`An error was returned when when calling LibFormDuplicatePersonChecking.`)
            }
            if (!personCheckData || !Array.isArray(personCheckData)) {
                console.log(`Data was not returned when calling LibFormDuplicatePersonChecking.`)
            }
            if (personCheckData[0] === 'Error') {
                console.log(`The call to LibFormDuplicatePersonChecking returned with an error. ${personCheckData[1]}.`)
            }
            if (personCheckData[0] !== 'Success') {
                console.log(`The call to LibFormDuplicatePersonChecking returned with an unhandled error.`)
            }
        }

        if (personCheckData && personCheckData[1] === 'Duplicates found') {
            console.log(personCheckData)

            for (const userRecord of personCheckData[2]) {
                if (!processDone) {
                    continueVerify = true;
                    manyDuplicates = false;

                    if (userRecord.dhdocid != FormID && userRecord.dhdocid1 != FormID) {

                        let duplicateQuery;
                        let legacyFormID

                        if (userRecord.dhdocid == undefined || userRecord.dhdocid == '') {
                            legacyFormID = userRecord.dhdocid1
                        } else {
                            legacyFormID = userRecord.dhdocid
                        }

                        if (Citizen == "Yes") {
                            duplicateQuery = `[instanceName] eq '${legacyFormID}' AND ([Email Address] eq '${EmailAddress}' OR [SSN] eq '${SSN}')`;
                        }
                        else {
                            if (I94 && AlienRegNumber && SSN) {
                                duplicateQuery = `[instanceName] eq '${legacyFormID}' AND ([Email Address] eq '${EmailAddress}' OR [I94] eq '${I94}' OR [Alien Registration Number] eq '${AlienRegNumber}' OR [SSN] eq '${SSN}'`;
                            }
                            else if (I94 && AlienRegNumber) {
                                duplicateQuery = `[instanceName] eq '${legacyFormID}' AND ([Email Address] eq '${EmailAddress}' OR [I94] eq '${I94}' OR [Alien Registration Number] eq '${AlienRegNumber}')`;
                            } else if (I94) {
                                duplicateQuery = `[instanceName] eq '${legacyFormID}' AND ([Email Address] eq '${EmailAddress}' OR [I94] eq '${I94}')`;
                            } else if (AlienRegNumber) {
                                duplicateQuery = `[instanceName] eq '${legacyFormID}' AND ([Email Address] eq '${EmailAddress}' OR [Alien Registration Number] eq '${AlienRegNumber}')`;
                            } else if (SSN) {
                                duplicateQuery = `[instanceName] eq '${legacyFormID}' AND ([Email Address] eq '${EmailAddress}' OR [SSN] eq '${SSN}')`;
                            } else if (DOB) {
                                duplicateQuery = `[instanceName] eq '${legacyFormID}' AND [Date of Birth] eq '${DOB}'`;
                            } else {
                                duplicateQuery = `[instanceName] eq '${legacyFormID}'`;
                            }
                        }

                        if (!manyDuplicates) {

                            let duplicateQueryObj = {
                                q: duplicateQuery,
                                expand: true
                            };

                            let getIndRecResp = await vvClient.forms.getForms(duplicateQueryObj, IndividualRecordTemplateID);
                            getIndRecResp = JSON.parse(getIndRecResp);
                            let getIndRecData = (getIndRecResp.hasOwnProperty('data') ? getIndRecResp.data : null);

                            if (getIndRecResp.meta.status !== 200) { throw new Error(`There was an error when calling getIndRec. ${errorMessageGuidance}`) }
                            if (getIndRecData === null) { throw new Error(`Data was not able to be returned when calling getIndRec. ${errorMessageGuidance}`) }
                            if (getIndRecData.length != 0) {
                                continueVerify = false;
                                if (getIndRecData[0]["instanceName"] != FormID) {
                                    var userQueryParams = { filter: "[UsUserID] = '" + userRecord["email Address"] + "'" }

                                    let userSearchResp = await vvClient.customQuery.getCustomQueryResultsByName(userQueryName, userQueryParams)
                                    userSearchResp = JSON.parse(userSearchResp);
                                    let userSearchData = (userSearchResp.hasOwnProperty('data') ? userSearchResp.data : null);

                                    if (userSearchResp.meta.status !== 200) { throw new Error(`There was an error when calling the user search custom query. ${errorMessageGuidance}`) }
                                    if (userSearchData === null) { throw new Error(`Data was not able to be returned when calling the user search custom query.. ${errorMessageGuidance}`) }
                                    if (userSearchData.length != 0) {
                                        processDone = true;
                                        // STEP 2 - Call LibEmailGenerateAndCreateCommunicationLog to send an email to the applicant to notify them of the approval of their License Application.
                                        let tokenArr = [
                                            { name: TokenEmailAddress, value: userRecord["email Address"] },
                                        ];
                                        let emailRequestArr = [
                                            { name: 'Email Name', value: emailTemplateName },
                                            { name: 'Tokens', value: tokenArr },
                                            { name: 'Email Address', value: userRecord["email Address"] },
                                            { name: 'Email AddressCC', value: '' },
                                            { name: 'SendDateTime', value: '' },
                                            { name: 'RELATETORECORD', value: [getIndRecData[0]["form ID"]] },
                                            {
                                                name: 'OTHERFIELDSTOUPDATE', value: {
                                                    'Primary Record ID': getIndRecData[0]["form ID"],
                                                    'Other Record': ''
                                                }
                                            }
                                        ];

                                        let emailCommLogResp = await vvClient.scripts.runWebService('LibEmailGenerateAndCreateCommunicationLog', emailRequestArr)
                                        let emailCommLogData = (emailCommLogResp.hasOwnProperty('data') ? emailCommLogResp.data : null)

                                        if (emailCommLogResp.meta.status !== 200) {
                                            throw new Error(`There was an error when calling LibEmailGenerateAndCreateCommunicationLog.`)
                                        }
                                        if (!emailCommLogData || !Array.isArray(emailCommLogData)) {
                                            throw new Error(`Data was not returned when calling LibEmailGenerateAndCreateCommunicationLog.`)
                                        }
                                        if (emailCommLogData[0] === 'Error') {
                                            throw new Error(`The call to LibEmailGenerateAndCreateCommunicationLog returned with an error. ${emailCommLogData[1]}.`)
                                        }
                                        if (emailCommLogData[0] !== 'Success') {
                                            throw new Error(`The call to LibEmailGenerateAndCreateCommunicationLog returned with an unhandled error.`)
                                        }

                                        // STEP 2 - Send response with return array.
                                        outputCollection[0] = 'Success'
                                        outputCollection[1] = 'Legacy Account Found email sent.'
                                        outputCollection[2] = userRecord["email Address"];
                                        processDone = true;
                                        break;
                                    } else {
                                        processDone = true;
                                        recordID = userRecord.dhdocid;

                                        if (userRecord["email Address"] && userRecord["email Address"] != "") {

                                            //Step 2. Call getForms on the Email Template Lookup.
                                            let emailQuery = `[Email Name] eq '${NewUserEmailTemplate}'`;

                                            let emailFormQueryObj = {
                                                q: emailQuery,
                                                expand: true
                                            };

                                            let getEmailResp = await vvClient.forms.getForms(emailFormQueryObj, emailNotificationTemplateID);
                                            getEmailResp = JSON.parse(getEmailResp);
                                            let getEmailData = (getEmailResp.hasOwnProperty('data') ? getEmailResp.data : null);

                                            if (getEmailResp.meta.status !== 200) { throw new Error(`There was an error when calling getForms. ${errorMessageGuidance}`) }
                                            if (getEmailData === null) { throw new Error(`Data was not able to be returned when calling getForms. ${errorMessageGuidance}`) }
                                            if (getEmailData.length != 1) { throw new Error(`More than one email template was returned. Only one record should be returned. ${errorMessageGuidance}`) }

                                            //Found the email. Access the subject and body
                                            emailSubject = getEmailData[0]['subject Line'];
                                            emailBody = getEmailData[0]['body Text'];

                                            //Replace any tokens that are not [Username] and [Password] here. This example includes [First Name] and [URL]
                                            emailBody = emailBody.split('[URL]').join(baseURL);


                                            //GroupList logic here:
                                            GroupList = "License Applicant";
                                            //END PROCESS

                                            let emailToUse;

                                            emailToUse = userRecord["email Address"];

                                            //Step 3. If the email template is found, pull the email body and subject and then call LibUserCreate.
                                            var createUserDataArray = [
                                                { name: "Group List", value: GroupList },
                                                { name: "User Id", value: emailToUse },
                                                { name: "Email Address", value: emailToUse },
                                                { name: "Site Name", value: SiteName },
                                                { name: "First Name", value: FirstName },
                                                { name: "Last Name", value: LastName },
                                                { name: "Middle Initial", value: MiddleName },
                                                { name: "Send Email", value: "Custom" },
                                                { name: "Email Subject", value: emailSubject },
                                                { name: "Email Body", value: emailBody },
                                                { name: "Related Records", value: [recordID] },
                                                { name: "Other Fields", value: { "Primary Record ID": recordID } },
                                            ];

                                            let createUserResp = await vvClient.scripts.runWebService('LibUserCreate', createUserDataArray);
                                            let createUserData = (createUserResp.hasOwnProperty('data') ? createUserResp.data : null);

                                            if (createUserResp.meta.status !== 200) { throw new Error(`There was an error when calling LibCreateUser. ${errorMessageGuidance}`) }
                                            if (createUserData === null) { throw new Error(`Data was not able to be returned when calling LibCreateUser. ${errorMessageGuidance}`) }

                                            if (createUserData[0] == 'Success') {
                                                outputCollection[0] = createUserData[0];
                                                outputCollection[1] = 'Legacy User Created';
                                                processDone = true;
                                                break;
                                            }
                                        } else {

                                            let tokenArr = [
                                                { name: TokenEmailAddress, value: EmailAddress },
                                                { name: TokenFormID, value: FormID },
                                            ];
                                            let emailRequestArr = [
                                                { name: 'Email Name', value: duplicateEmailTemplateName },
                                                { name: 'Tokens', value: tokenArr },
                                                { name: 'Email Address', value: '' },
                                                { name: 'Email AddressCC', value: '' },
                                                { name: 'SendDateTime', value: '' },
                                                { name: 'RELATETORECORD', value: [getIndRecData[0]["instanceName"]] },
                                                {
                                                    name: 'OTHERFIELDSTOUPDATE', value: {
                                                        'Primary Record ID': getIndRecData[0]["instanceName"],
                                                        'Other Record': ''
                                                    }
                                                }
                                            ];

                                            let emailCommLogResp = await vvClient.scripts.runWebService('LibEmailGenerateAndCreateCommunicationLog', emailRequestArr)
                                            let emailCommLogData = (emailCommLogResp.hasOwnProperty('data') ? emailCommLogResp.data : null)

                                            if (emailCommLogResp.meta.status !== 200) {
                                                throw new Error(`There was an error when calling LibEmailGenerateAndCreateCommunicationLog.`)
                                            }
                                            if (!emailCommLogData || !Array.isArray(emailCommLogData)) {
                                                throw new Error(`Data was not returned when calling LibEmailGenerateAndCreateCommunicationLog.`)
                                            }
                                            if (emailCommLogData[0] === 'Error') {
                                                throw new Error(`The call to LibEmailGenerateAndCreateCommunicationLog returned with an error. ${emailCommLogData[1]}.`)
                                            }
                                            if (emailCommLogData[0] !== 'Success') {
                                                throw new Error(`The call to LibEmailGenerateAndCreateCommunicationLog returned with an unhandled error.`)
                                            }

                                            // STEP 2 - Send response with return array.
                                            outputCollection[0] = 'Success'
                                            outputCollection[1] = 'Duplicate match email sent.'
                                            processDone = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        } else {
                            processDone = true;
                            continueVerify = false;
                            outputCollection[0] = 'Success';
                            outputCollection[1] = 'Close match found'
                            break;
                        }

                    }
                }

            }
        }

        //If nothing was caught on the duplicate name checking process, finish with the regular verification
        if (continueVerify) {
            //Step 2. Call GetForms on the Individual Record and query on the First Name, Last Name, Email and SSN
            if (Citizen == "Yes") {
                verifQuery = `[Email Address] eq '${EmailAddress}' or [SSN] eq '${SSN}'`;
            }
            else {

                if (I94 && AlienRegNumber && SSN) {
                    verifQuery = `[Email Address] eq '${EmailAddress}' or [I94] eq '${I94}' or [Alien Registration Number] eq '${AlienRegNumber}' or [SSN] eq '${SSN}'`;
                } else if (I94) {
                    verifQuery = `[Email Address] eq '${EmailAddress}' or [I94] eq '${I94}'`;
                } else if (AlienRegNumber) {
                    verifQuery = `[Email Address] eq '${EmailAddress}' or [Alien Registration Number] eq '${AlienRegNumber}'`;
                } else if (SSN) {
                    verifQuery = `[Email Address] eq '${EmailAddress}' or [SSN] eq '${SSN}'`;
                } else {
                    verifQuery = `[Email Address] eq '${EmailAddress}'`;
                }
            }

            let verifQueryObj = {
                q: verifQuery,
                expand: true
            };

            let getFormsResp = await vvClient.forms.getForms(verifQueryObj, IndividualRecordTemplateID);
            getFormsResp = JSON.parse(getFormsResp);
            let getFormsData = (getFormsResp.hasOwnProperty('data') ? getFormsResp.data : null);

            if (getFormsResp.meta.status !== 200) { throw new Error(`There was an error when calling getForms. ${errorMessageGuidance}`) }
            if (getFormsData === null) { throw new Error(`Data was not able to be returned when calling getForms. ${errorMessageGuidance}`) }
            if (getFormsData.length != 0) {
                if (getFormsData[0]["instanceName"] != FormID) {
                    throw new Error(`A record for you already exists in the system based upon one of the key identifying criteria. Please go to ${baseURL} to sign in or use the forgot username/password link. If you need further assistance, please e-mail DHHS.LanceSupport@nebraska.gov.`)
                }
            }

            outputCollection[0] = "Success";
            outputCollection[1] = "Individual Record is unique"
        }

    } catch (error) {
        // Log errors captured.
        logger.info(JSON.stringify(`IndividualRecordVerifyUniqueUserCheck Error ${error} ${errorLog}`))
        outputCollection[0] = 'Error'
        outputCollection[1] = `${error.message} ${errorLog.join(' ')} `
        outputCollection[2] = null
        outputCollection[3] = errorLog
    } finally {
        response.json(200, outputCollection)
    }
}
