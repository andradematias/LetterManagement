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
     Customer:      Nebraska, DHHS
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
                4. Call GetForms to get the Organization Record if the ID is present
                5. Call GetForms to get the Facility Information record if the ID is present
                6. Call GetForms to get the License Application record if the ID is present
                7. Call GetForms to get the License Details record if the ID is present
                8. Call GetForms to get the Disciplinary Event record if the ID is present
                9. Call getforms to pull in the CMO/Deputy Director information from the Potentate Lookup Form
     Last Rev Date: 09/17/2021
     Revision Notes:
     09/17/2021 - Alex Rhee: Script created
     12/07/2021 - Miroslav Sanader: Update script to include deficiency text instead of task name if present
     */

    logger.info('Start of the process LetterManagementOnLoad at ' + Date());

    /****************
     Config Variables
    *****************/
    let errorMessageGuidance = 'Please try again, or contact a system administrator if this problem continues.';
    let missingFieldGuidance = 'Please provide a value for the missing field and try again, or contact a system administrator if this problem continues.';
    let IndividualRecordTemplateID = 'Individual Record';
    let OrganizationRecordTemplateID = 'Organization Record';
    let FacilityTemplateID = 'Facility Information';
    let LicenseApplicationTemplateID = 'License Application';
    let LicenseDetailsTemplateID = 'License Details'
    let DisciplinaryEventTemplateID = 'Disciplinary or Licensure Event';
    let PotentateLetterTemplateID = 'Licensure Leadership Lookup';
    let LicenseLookupTemplateID = 'License Lookup';
    let FeeTemplateID = 'Fee';
    let relParams = {}
    relParams.indexFields = 'include';
    relParams.limit = '2000';
    let today = moment().tz('America/Chicago').format('L');

    /****************
     Script Variables
    *****************/
    let outputCollection = [];
    let errorLog = [];
    let UserInfo;
    let IndividualInfo;
    let IndividualFeeInfo;
    let OrganizationInfo;
    let FacilityInfo;
    let LicenseApplicationInfo;
    let LicenseDetailsInfo;
    let DisciplinaryEventInfo;
    let LeaderInfo;
    let LicenseStaffInfo;
    let PaymentPlanInfo;
    let RecipientEmail = "";
    let formattedKeys = "";
    let licenseTypeName = '';

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

        // Generate the URL based on the environment for the appeal form 
        function generateAppealFormLink() {
            let url = vvClient.getBaseUrl();
            //Temporory solution to set value as either dev or sandbox API call coming soon.
            let xcid = url.includes('sandbox') ? '1b9782e5-c48c-eb11-81f9-dc23f34e190a' :
                url.includes('qa') ? 'f7abab70-0bb8-eb11-81f9-f95f35fde26e' : 'bbf860ac-4f45-eb11-81f5-912ea5398475';
            let xcdid = url.includes('sandbox') ? '430b9745-2fa5-eb11-81fa-ebd64477ffbf' :
                url.includes('qa') ? '0ad3e4a9-0bb8-eb11-81f9-f95f35fde26e' : '419017bf-4f45-eb11-81f5-912ea5398475';
            let formId = '123b9762-ce17-ec11-a9cf-a7c45ba94e73';

            let appealFormLink = `${url}/FormViewer/public?xcid=${xcid}&xcdid=${xcdid}&formId=${formId}`;

            return appealFormLink;
        }

        // Creates a formatted HTML string of the JSON objects for easy review
        function getHTMLFormattedKeyValue(entrySet, entryTitle) {
            let htmlString = `<strong>${entryTitle}:</strong><br/>`;
            for (const [key, value] of Object.entries(entrySet)) {
                htmlString += `[${key}]: "${formatDate(value)}"<br/>`;
            }
            htmlString += '<br/>';
            return htmlString
        }

        //Set prefix on the keys for a dataset
        function prefixDataKeys(keyPrefix, dataSet) {
            let UserKeys = {};
            for (var elem of Object.keys(dataSet)) {
                var newName = `${keyPrefix} ` + elem;
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

        //Check if object is empty
        function notEmpty(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop))
                    return true;
            }
            return false;
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

        //Retrieve Related form data
        async function getRelatedFormData(fieldName, fieldValue, formTemplateID) {
            let formQuery = `[${fieldName}] eq '${fieldValue}'`;

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

        //Retreive License Details Data
        async function setLicenseDetailsData(licenseDetailsId) {
            let getLicenseDetailsData = await getFormInstanceData(licenseDetailsId, LicenseDetailsTemplateID);

            if (getLicenseDetailsData.length > 0) {
                LicenseDetailsInfo = prefixDataKeys("License Details", getLicenseDetailsData[0]);
                LicenseDetailsInfo["License Details ID"] = licenseDetailsId;
                LicenseDetailsInfo["License Number"] = getLicenseDetailsData[0]['license Number'];
                LicenseDetailsInfo["License Type"] = getLicenseDetailsData[0]['license Type'];
                LicenseDetailsInfo["License Group"] = getLicenseDetailsData[0]['license Group'];
            }
            return;
        }

        //Retrieve License Application Data
        async function setLicenseApplicationData(licenseApplicationId) {
            let getLicenseApplicationData = await getFormInstanceData(licenseApplicationId, LicenseApplicationTemplateID);

            if (getLicenseApplicationData.length > 0) {
                LicenseApplicationInfo = prefixDataKeys("License Application", getLicenseApplicationData[0]);
                LicenseApplicationInfo["License Application ID"] = licenseApplicationId;
                LicenseApplicationInfo["License Number"] = getLicenseApplicationData[0]['license ID'];
                LicenseApplicationInfo["License Type"] = getLicenseApplicationData[0]['license Type Text Value'];
                LicenseApplicationInfo["License Group"] = getLicenseApplicationData[0]['license Group Text Value'];
                licenseTypeName = LicenseApplicationInfo["License Type"];
            }
            return;
        }

        //Retrieve and Set Associated Payment Plan Data
        async function setPaymentPlanData(associatedRecordId, feeType) {
            let getFeeData = await getRelatedFormData('Associated Record ID', associatedRecordId, FeeTemplateID);
            if (getFeeData.length > 0) {
                for (let feeElem of
                    getFeeData.sort((a, b) => moment(b['createDate']) - moment(a['createDate']))) {

                    if (feeType == feeElem['fee Type'] && 'Yes' == feeElem['allow Payments']) {
                        PaymentPlanInfo = prefixDataKeys("PaymentPlan Info", feeElem);
                        break;
                    }
                }
            }
            return;
        }

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
        let UserID = getFieldValueByName('USERID');
        let baseURL = getFieldValueByName('baseURL');

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

        let getSites = await vvClient.sites.getSites(siteParams);
        getSites = JSON.parse(getSites);

        if (getSites.meta.status !== 200) { throw new Error(`An error occurred when trying to get the site ID for Home.`); }
        if (getSites.data.length > 1) { throw new Error(`Multiple sites found for Home. Please contact support.`); }


        //Step 2. Get the user information based off the login user
        let userParam = {
            q: `id eq '${UserID}'`
        };
        let siteID = getSites.data[0].id;
        let getUser = await vvClient.users.getUsers(userParam, siteID);
        getUser = JSON.parse(getUser);

        if (getUser.meta.status !== 200) { throw new Error(`An error occurred when trying to get the users for Home.`); }
        if (getUser.data.length == 0) { throw new Error(`No active users were found when attempting to get users for Home.`); }

        UserInfo = prefixDataKeys("State Staff", getUser.data[0]);
        if (getUser.data[0]["middleInitial"]) {
            UserInfo["State Staff full name"] = `${getUser.data[0]["firstName"]} ${getUser.data[0]["middleInitial"]} ${getUser.data[0]["lastName"]}`
        } else {
            UserInfo["State Staff full name"] = `${getUser.data[0]["firstName"]} ${getUser.data[0]["lastName"]}`
        }

        //Step 3. Call GetForms to get the Individual Record if the ID is present
        if (IndividualID) {

            let getIndividualData = await getFormInstanceData(IndividualID, IndividualRecordTemplateID);

            if (getIndividualData.length > 0) {

                IndividualInfo = prefixDataKeys("Individual Record", getIndividualData[0])
                IndividualInfo["Individual ID"] = IndividualID;
                if (getIndividualData[0]["middle Name"]) {
                    IndividualInfo["Full Name"] = `${getIndividualData[0]["first Name"]} ${getIndividualData[0]["middle Name"]} ${getIndividualData[0]["last Name"]}`
                } else {
                    IndividualInfo["Full Name"] = `${getIndividualData[0]["first Name"]} ${getIndividualData[0]["last Name"]}`
                }

                RecipientEmail = getIndividualData[0]["email Address"];

                let getFeeData = await getRelatedFormData('Individual ID', IndividualID, FeeTemplateID);
                if (getFeeData.length > 0) {
                    for (var feeElem of getFeeData) {
                        if (null != feeElem['denial Code'] && '' != feeElem['denial Code']) {
                            IndividualFeeInfo = prefixDataKeys('Fee Record', feeElem);
                            break;
                        }
                    }
                }
            }
        }

        //Step 4. Call GetForms to get the Organization Record if the ID is present
        if (OrganizationID) {

            let getOrganizationData = await getFormInstanceData(OrganizationID, OrganizationRecordTemplateID);

            if (getOrganizationData.length > 0) {

                OrganizationInfo = prefixDataKeys("Organization Record", getOrganizationData[0]);
                OrganizationInfo["Organization ID"] = OrganizationID

                if (RecipientEmail == "") {
                    RecipientEmail = getOrganizationData[0]["email Address"];
                }
            }
        }

        //Step 5. Call GetForms to get the Facility Information record if the ID is present
        if (FacilityID) {

            let getFacilityData = await getFormInstanceData(FacilityID, FacilityTemplateID);

            if (getFacilityData.length > 0) {

                FacilityInfo = prefixDataKeys("Facility Information", getFacilityData[0])
                FacilityInfo["Facility ID"] = FacilityID

                if (RecipientEmail == "") {
                    RecipientEmail = getFacilityData[0]["user ID"];
                }
            }
        }

        //Step 6. Call GetForms to get the License Application record if the ID is present
        if (LicenseApplicationID && !LicenseApplicationInfo) {

            await setLicenseApplicationData(LicenseApplicationID);

            let getChecklistTaskData = await getRelatedFormData('License Application ID', LicenseApplicationID, 'Checklist Task');

            if (getChecklistTaskData.length > 0) {
                var clTasksReturned = '';
                for (var clElem of getChecklistTaskData) {
                    if (clElem['assignee Names'] && clElem['assignee Names'].includes(IndividualInfo['Individual Record email Address']) &&
                        (clElem['status'] != 'Not Applicable' && clElem['status'] != 'Approved' && clElem['status'] != 'Canceled' && clElem['status'] != 'Waiting Approval')
                    ) {
                        if (!clElem['deficiency Text'])
                            clTasksReturned += `${clElem['task Name']}<br>`
                        else
                            clTasksReturned += `${clElem['deficiency Text']}<br>`
                    }
                }
                LicenseApplicationInfo['License Application deficiencies'] = clTasksReturned != '' ? clTasksReturned :
                    '<strong><i><span style="font-family: Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;background-color: yellow; color: red;">No Deficiencies Found</span></i></strong>';
            }

            if (null != LicenseApplicationInfo['License Application denial Code'] && '' != LicenseApplicationInfo['License Application denial Code']) {
                LicenseApplicationInfo['Appeal Link'] = generateAppealFormLink();
            }

            // If there is no License Details ID and 
            // If the application has a license details record associated, pull the data.
            if (!LicenseDetailsID && null != LicenseApplicationInfo["License Number"] && '' != LicenseApplicationInfo["License Number"]) {
                let getLicenseDetailsData = await getRelatedFormData('License Number', LicenseApplicationInfo["License Number"], LicenseDetailsTemplateID);

                if (getLicenseDetailsData.length > 0) {

                    LicenseDetailsInfo = prefixDataKeys("License Details", getLicenseDetailsData[0]);
                    LicenseDetailsInfo["License Details ID"] = getLicenseDetailsData[0]['License Details form ID'];
                    LicenseDetailsInfo["License Number"] = getLicenseDetailsData[0]['license Number'];
                    LicenseDetailsInfo["License Type"] = getLicenseDetailsData[0]['license Type'];
                }
            }

            await setPaymentPlanData(LicenseApplicationID, 'Administrative Penalty');
        }

        //Step 7. Call GetForms to get the License Details record if the ID is present
        if (LicenseDetailsID && !LicenseDetailsInfo) {
            await setLicenseDetailsData(LicenseDetailsID);

            //Get disciplinary events associated to the details and format for summary
            let getDisciplineData = await getRelatedFormData('License ID', LicenseDetailsInfo["License Number"], DisciplinaryEventTemplateID);
            if (getDisciplineData.length > 0) {
                let disciplineSummary = ''
                for (var dElem of getDisciplineData) {
                    disciplineSummary += `Date of Event: ${dElem['estimated Date of Event']}, Summary: ${dElem['summary of Event']}<br>`
                }
                LicenseDetailsInfo['License Details Discipline Summary'] = disciplineSummary;
            } else {
                LicenseDetailsInfo['License Details Discipline Summary'] = 'No disciplinary or non-disciplinary action on license.'
            }

            // If LicnseApplicationID is not in context and 
            // the license details has the association, pull the data
            if (!LicenseApplicationID && LicenseDetailsInfo['License Details license Application ID']) {
                await setLicenseApplicationData(LicenseDetailsInfo['License Details license Application ID']);
            }
        }

        //Step 8. Call GetForms to get the Disciplinary Event record if the ID is present
        if (DisciplinaryEventID) {
            let getDisciplinaryEventData = await getFormInstanceData(DisciplinaryEventID, DisciplinaryEventTemplateID);

            if (getDisciplinaryEventData.length > 0) {
                DisciplinaryEventInfo = prefixDataKeys("Disciplinary Event", getDisciplinaryEventData[0]);
                DisciplinaryEventInfo["Disciplinary Event ID"] = DisciplinaryEventID;
                //Find latest payment plan for this event
                await setPaymentPlanData(DisciplinaryEventID, 'Civil Penalty');

                if (null != DisciplinaryEventInfo['Disciplinary Event license Details Form ID'] &&
                    '' != DisciplinaryEventInfo['Disciplinary Event license Details Form ID']) {
                    setLicenseDetailsData(DisciplinaryEventInfo['Disciplinary Event license Details Form ID']);
                }

                if (null != DisciplinaryEventInfo['Disciplinary Event denial Code'] &&
                    '' != DisciplinaryEventInfo['Disciplinary Event denial Code']) {
                    DisciplinaryEventInfo['Appeal Link'] = generateAppealFormLink();
                }
            }
        }

        //Step 9. Call getforms to pull All information from the Potentate lookup table
        //Note this one looks different because we are interested in more than one record
        LeaderInfo = {};
        LeaderInfo["Current Date"] = today;
        let getPotentateLookupData = await getAllFormData(PotentateLetterTemplateID);
        if (getPotentateLookupData.length > 0) {
            for (const rec of getPotentateLookupData) {
                if ('Enabled' == rec["enabled"]) {
                    var jobTitle = rec['job Title'];

                    LeaderInfo = Object.assign(LeaderInfo, prefixDataKeys(jobTitle, rec));

                    if (rec["middle Name"]) {
                        LeaderInfo[jobTitle + " full Name"] = `${rec["first Name"]} ${rec["middle Name"]} ${rec["last Name"]}`
                    } else {
                        LeaderInfo[jobTitle + " full Name"] = `${rec["first Name"]} ${rec["last Name"]}`
                    }

                    let relatedDocumentsResp = await vvClient.forms.getFormRelatedDocs(rec.revisionId, relParams);
                    relatedDocumentsResp = JSON.parse(relatedDocumentsResp);
                    let relatedDocumentsData = (relatedDocumentsResp.hasOwnProperty('data') ? relatedDocumentsResp.data : null);
                    if (relatedDocumentsResp.meta.status !== 200 && relatedDocumentsResp.meta.status !== 404) {
                        throw new Error(`An error was encountered when attempting retrive the documents associated with the License Application. ${relatedDocumentsResp.meta.statusMsg}  ${errorMessageGuidance}`)
                    }

                    if (relatedDocumentsData.length > 0) {
                        LeaderInfo[jobTitle + " signature"] = baseURL + "imagehandler.ashx?hidemenu=true&dhid=" + relatedDocumentsData[0].id;
                    }
                }
            }
        }

        //Step 10: Get License Staff info
        if ('' !== licenseTypeName) {
            let licenseGroupData = await getRelatedFormData('license Name', licenseTypeName, LicenseLookupTemplateID);
            if (licenseGroupData.length > 0) {
                let licenseGroupName = licenseGroupData[0]['license Category'];
                let managerGroup = `License Manager ${licenseGroupName}`;
                let coordinatorGroup = `License Coordinator ${licenseGroupName}`;

                let groupsParamObj = [{
                    name: 'groups',
                    value: [managerGroup, coordinatorGroup]
                }];

                let getLicenseStaff = await vvClient.scripts.runWebService('LibGroupGetGroupUserEmails', groupsParamObj);
                let getLicenseStaffData = (getLicenseStaff.hasOwnProperty('data') ? getLicenseStaff.data : null);

                if (getLicenseStaff.meta.status !== 200) { throw new Error(`There was an error when attempting to get emails for the ${licenseTypeName} license group.`); }
                if (getLicenseStaffData === null) { throw new Error(`Data was not able to be returned when attempting to get emails for the ${licenseTypeName} license group.`); }
                if (getLicenseStaffData[0] === 'Error') { throw new Error(`The call to get the emails for the ${licenseTypeName} license group returned with an error: ${getEmailsData.statusMessage}`); }

                let coordinator, manager = null;
                for (let staffElem of getLicenseStaffData[2]) {
                    if (null == manager && managerGroup === staffElem['groupname']) {

                        manager = prefixDataKeys("Program Manager", staffElem);
                        manager['Program Manager full Name'] = staffElem['firstName'] + ' ' + staffElem['lastName'];
                        manager['Program Manager license Group'] = licenseGroupName;
                        LicenseStaffInfo = Object.assign(!LicenseStaffInfo ? {} : LicenseStaffInfo, manager);
                    }
                    if (null == coordinator && coordinatorGroup === staffElem['groupname']) {

                        coordinator = prefixDataKeys("License Coordinator", staffElem);
                        coordinator['License Coordinator full Name'] = staffElem['firstName'] + ' ' + staffElem['lastName'];
                        coordinator['License Coordinator license Group'] = licenseGroupName;
                        LicenseStaffInfo = Object.assign(!LicenseStaffInfo ? {} : LicenseStaffInfo, coordinator);
                    }
                    if (null != coordinator && null != manager) {
                        break;
                    }
                }
            }
        }

        //Create formatted string
        if (notEmpty(UserInfo)) {
            formattedKeys += getHTMLFormattedKeyValue(UserInfo, 'State Staff');
        }
        if (notEmpty(DisciplinaryEventInfo)) {
            formattedKeys += getHTMLFormattedKeyValue(DisciplinaryEventInfo, 'Disciplinary Event');
        }
        if (notEmpty(LicenseDetailsInfo)) {
            formattedKeys += getHTMLFormattedKeyValue(LicenseDetailsInfo, 'License Details');
        }
        if (notEmpty(LicenseApplicationInfo)) {
            formattedKeys += getHTMLFormattedKeyValue(LicenseApplicationInfo, 'License Application');
        }
        if (notEmpty(OrganizationInfo)) {
            formattedKeys += getHTMLFormattedKeyValue(OrganizationInfo, 'Organization Record');
        }
        if (notEmpty(FacilityInfo)) {
            formattedKeys += getHTMLFormattedKeyValue(FacilityInfo, 'Facility Information');
        }
        if (notEmpty(IndividualInfo)) {
            formattedKeys += getHTMLFormattedKeyValue(IndividualInfo, 'Individual Record');
        }
        if (notEmpty(IndividualFeeInfo)) {
            formattedKeys += getHTMLFormattedKeyValue(IndividualFeeInfo, 'Fee Record, Individual');
        }
        if (notEmpty(PaymentPlanInfo)) {
            formattedKeys += getHTMLFormattedKeyValue(PaymentPlanInfo, 'Payment Plan Details');
        }
        if (notEmpty(LeaderInfo)) {
            formattedKeys += getHTMLFormattedKeyValue(LeaderInfo, 'Licensure Leaders');
        }
        if (notEmpty(LicenseStaffInfo)) {
            formattedKeys += getHTMLFormattedKeyValue(LicenseStaffInfo, 'Licensure Staff');
        }


        //Return Array
        outputCollection[0] = "Success";
        outputCollection[1] = "User info found.";
        outputCollection[2] = `<p><span style="font-family: Arial,&quot;Helvetica Neue&quot;,Helvetica,sans-serif;">${formattedKeys}</span></p>`;
        outputCollection[3] = RecipientEmail;
        outputCollection[4] = UserInfo;
        outputCollection[5] = IndividualInfo;
        outputCollection[6] = OrganizationInfo;
        outputCollection[7] = FacilityInfo;
        outputCollection[8] = LicenseApplicationInfo;
        outputCollection[9] = LicenseDetailsInfo;
        outputCollection[10] = DisciplinaryEventInfo;
        outputCollection[11] = LeaderInfo;
        outputCollection[12] = LicenseStaffInfo;
        outputCollection[13] = IndividualFeeInfo;
        outputCollection[14] = PaymentPlanInfo;
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
