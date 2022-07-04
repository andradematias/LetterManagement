// ValidationGoToFieldFromModal for Global Script - Helper Function for Validation Modal process (ValidationLoadModal).
//Parameter: fieldName
// This script takes a passed in fieldName and will navigate to the field in the browser automatically including setting the Tab Control value and then waiting for that field to become visible.

// Check if Tabs are currently displayed on the form. If no tabs are displayed tab logic does not need to be run.
if ($(".styleTabButtons").length > 0 && $(".styleTabButtons").prop("style")['display'] === 'none') {
    // Close modal before going to field.
    VV.Form.Global.ValidationCancelModal()
    $('[VVFieldName="' + fieldName + '"]')[0].scrollIntoView()
} else {
    var tabName = ''
    var fieldFound = false

    // Populated from TabToFieldRelationships function call.
    var tabToFieldRelationshipsObj = {}

    // A function will only exist if there are tab field relationships on the form. Check if it exists before calling it.
    if (typeof VV.Form.Template.TabToFieldRelationships === 'function') {
        tabToFieldRelationshipsObj = VV.Form.Template.TabToFieldRelationships()
    }

    // Iterate through Tab Field Obj to find if a relationship exists.
    for (var key in tabToFieldRelationshipsObj) {
        if (tabToFieldRelationshipsObj.hasOwnProperty(key)) {
            fieldFound = tabToFieldRelationshipsObj[key].some(function (elem) {
                return elem.toLowerCase() === fieldName.toLowerCase()
            })

            if (fieldFound) {
                tabName = key

                // If Tab Control is already on the correct tab field should already be visible.
                if (VV.Form.GetFieldValue('Tab Control').toLowerCase() === tabName.toLowerCase()) {
                    // Close modal before going to field.
                    VV.Form.Global.ValidationCancelModal()
                    $('[VVFieldName="' + fieldName + '"]')[0].scrollIntoView()
                    break
                } else {
                    // Select the node that will be observed for mutations
                    var watchThisNode = document.querySelector('[VVFieldName="' + fieldName + '"]').parentNode.parentNode

                    // Options for the observer (which mutations to observe)
                    var config = { attributes: true };

                    // Callback function to execute when mutations are observed. This ensures that field will not be scrolled to until it becomes visible.
                    var callback = function (mutationsList, observer) {
                        // Use traditional 'for loops' for IE 11
                        for (var i = 0; i < mutationsList.length; i++) {
                            if (mutationsList[i].type === 'attributes') {
                                $('[VVFieldName="' + fieldName + '"]')[0].scrollIntoView()
                                observer.disconnect();
                            }
                        }
                    };

                    // Create an observer instance linked to the callback function
                    var observer = new MutationObserver(callback);

                    // Start observing the target node for configured mutations
                    observer.observe(watchThisNode, config);

                    // Close modal before going to field.
                    VV.Form.Global.ValidationCancelModal()

                    // Click on tab button so it's styled correctly.
                    $(".styleTabButtons").find('input[value="' + tabName + '"]').click()
                    // Set Tab Control to where field is located.
                    VV.Form.SetFieldValue('Tab Control', tabName)
                    // break out of loop when field has been found as this function handles one field at a time.
                    break
                }

            }
        }
    }

    // If field wasn't found in tab relationships assume it's always visible on the page.
    if (!fieldFound) {
        // Close modal before going to field.
        VV.Form.Global.ValidationCancelModal()
        $('[VVFieldName="' + fieldName + '"]')[0].scrollIntoView()
    }
}