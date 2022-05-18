//Name: PopulateLanceDataTokens
//Parameters: resp - This parameter is an Array of objects, with two attributes, name and value.
//This function receives an Array of objects and returns a string variable to set in a text field


//Se recibe el array de objetos obtenidos del  web service
const array = resp;
let formatedString = "";

for (let i = 0; i < array.length; i++) {
    formatedString += "<h2>" + array[i].name + ":</h2>"
    if (array[i].value) {
        for (let prop in array[i].value) {
            if (array[i].value[prop]) {

                formatedString += "<ul><strong>[" + prop + "]</strong>: " + array[i].value[prop] + "</ul>";
            }
            else {
                formatedString += "<ul><strong>[" + prop + "]</strong>: " + '""' + "</ul>";
            }
        }
    }
    else {
        formatedString += "<ul>" + "No data obtained </ul>";
    }
}

return formatedString;