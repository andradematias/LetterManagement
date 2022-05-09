const { query } = require("winston");
var logger = require("../log");

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
    /*Script Name: LibGrantViewerPermissionToIndividualFolder.js
      Purpose: This process will lookup the individual licensee folder for a given individual ID
      and, if found, will give the user associated with the individual ID viewer access.
  
      Parameters: The following represent variables passed into the function from an array:
                  Individual Id - (String, Required)
  
      Return Array: The following represents the array of information returned to the calling function. This is a standardized response.
                  Any item in the array at points 2 or above can be used to return multiple items of information.
                  0 - Status: Success, Error
                  1 - Message
      Pseudo code:
          1. Validate passed in parameters
          2. Find user associated with provided individual ID
          3. Find folder(s) associated with the individual ID
          4. For each folder found, check if the user found in step 2 has viewer permission
          5. For any folders found in step 4 to be missing the viewer permission for the user, add it
          6. Return result to caller
      Date of Dev: 01/05/2022
      Last Rev Date: 01/05/2022
      Revision Notes:
      01/05/2022 - Fabian Montero: Initial Creation
      */

    logger.info("Start of the process LibGrantViewerPermissionToIndividualFolder at " + Date());

    /****************
     Script Variables
    *****************/
    let outputCollection = [];
    let errorLog = [];

    try {
        /****************
         Helper Functions
        *****************/

        function trimIfStr(val) {
            if (typeof val === "string") {
                return val.trim();
            } else {
                return val;
            }
        }

        let IndividualID = trimIfStr(ffCollection.getFormFieldByName("Individual ID")?.value);

        let IndividualRecordTemplateID = "Individual Record";

        /*************************************************************************************************
         Attempt to add view permission to individual folder for applicant, if it does not already have it
        **************************************************************************************************/
        if (IndividualID) {
            //Get User ID associated with this individual ID.
            let individualFormQuery = `[instanceName] eq '${IndividualID}'`;
            let individualFormQueryObj = {
                q: individualFormQuery,
                //expand: true,
                fields: "Email Address",
            };
            let individualGetFormsResp = await vvClient.forms.getForms(
                individualFormQueryObj,
                IndividualRecordTemplateID
            );
            individualGetFormsResp = JSON.parse(individualGetFormsResp);
            let individualGetFormsData = individualGetFormsResp.hasOwnProperty("data") ? individualGetFormsResp.data : null;

            if (individualGetFormsResp.meta.status == 200 && individualGetFormsData != null && individualGetFormsData.length == 1) {
                let individualFoundData = individualGetFormsData[0];
                let userID = individualFoundData["email Address"];
                //Get user object in order to get user GUID and validate the user exists
                let userQuery = `[userid] eq '${userID}'`;
                let getUserParams = {
                    q: userQuery,
                    fields: "id",
                };
                let individualUserResp = await vvClient.users.getUser(getUserParams);
                individualUserResp = JSON.parse(individualUserResp);
                let individualGetUserData = individualUserResp.hasOwnProperty("data") ? individualUserResp.data : null;
                if (individualUserResp.meta.status == 200 && individualGetUserData != null && individualGetUserData.length == 1) {
                    let userGuid = individualGetUserData[0]["id"];
                    //Now that we have the user record, we can try to find the individual user folder
                    individualFolderParams = {};
                    individualFolderQueryParams = [
                        { parameterName: "IndividualID", value: IndividualID },
                    ];
                    individualFolderParams["params"] = JSON.stringify(individualFolderQueryParams);
                    let individualFolderCustomQueryResponse = JSON.parse(await vvClient.customQuery.getCustomQueryResultsByName("Individual User Folder Lookup", individualFolderParams));
                    let individualFolderData = individualFolderCustomQueryResponse.hasOwnProperty("data") ? individualFolderCustomQueryResponse.data : null;
                    if (individualFolderCustomQueryResponse.meta.status == 200 && individualFolderData != null && individualFolderData.length >= 1) {
                        //We were able to find a folder for the individual user. This is the folder which will get a security member record
                        //added for the individual user.
                        for (const folder of individualFolderData) {
                            let folderId = folder["fsid"];

                            //Check if we need to add the permission

                            let securityMemberGetResp = JSON.parse(await vvClient.library.getFolderSecurityMembers(null, folderId));

                            let securityMemberData = securityMemberGetResp.hasOwnProperty("data") ? securityMemberGetResp.data : null;
                            if (securityMemberGetResp.meta.status == 200 && securityMemberData != null) {
                                let permissionFound = false;
                                securityMemberData.forEach(function (securityMember) {
                                    if (securityMember["memberId"] == userGuid && securityMember["memberRole"] == "Viewer") {
                                        permissionFound = true;
                                    }
                                });
                                //Permission not found so we will go ahead and add it
                                if (!permissionFound) {
                                    let securityMemberPutResp =
                                        JSON.parse(await vvClient.library.putFolderSecurityMember(
                                            folderId,
                                            userGuid,
                                            0,
                                            4,
                                            true
                                        ));
                                    if (securityMemberPutResp.meta.status != 200) {
                                        errorLog.push('Adding viewer permission for user ' + userGuid + ' to folder ' + folderId + 'failed.')
                                    }

                                }
                            }
                        }
                    }
                }
            }
            //Handle any minor errors.
            if (errorLog.length > 0) {
                outputCollection[0] = 'Minor Error';
                outputCollection[1] = '';
                errorLog.forEach(function (errorLog) {
                    outputCollection[1] += errorLog + '<br>';
                });
            }
            else {
                //Return Array
                outputCollection[0] = "Success";
                outputCollection[1] =
                    "View permissions where added for the specified individual to their folders, if missing.";
            }

        }
        else {
            //Return Array
            outputCollection[0] = "Error";
            outputCollection[1] =
                "A valid Individual ID was not provided. No change has been performed.";
        }
    } catch (error) {
        logger.info(JSON.stringify(error));

        outputCollection[0] = 'Error';

        if (error && error.message) {
            outputCollection[1] = error.message;
        } else {
            outputCollection[1] = "An unhandled error has occurred. The message returned was: " + error;
        }
    } finally {
        response.json(200, outputCollection);
    }
};
