//Name: PopulateLanceDataTokens
//Parameters: resp - This parameter is an Array of objects, with two attributes, name and value.
//This function receives an Array of objects and returns a string variable to set in a text field


// The array of objects obtained from the web service is received
const array = resp;
let formatedString = "";

for (let i = 0; i < array.length; i++) {
    formatedString += "<h2>" + array[i].name + ":</h2>"
    if (array[i].value && array[i].name != "Recipient Email") {
        for (let prop in array[i].value) {
            if (array[i].value[prop]) {

                formatedString += "<ul><strong>[" + prop + "]</strong>: " + array[i].value[prop] + "</ul>";
            }
            else {
                formatedString += "<ul><strong>[" + prop + "]</strong>: " + '""' + "</ul>";
            }
        }
        //If the array of objects contains the object named "Recipient Email" with a value, that value is added to the string variable
    } else if (array[i].name == "Recipient Email" && array[i].value) {
        formatedString += "<ul><strong>[" + array[i].name + "]</strong>: " + array[i].value + "</ul>";
    }
    else {
        formatedString += "<ul>" + "No data obtained </ul>";
    }
}

return formatedString;